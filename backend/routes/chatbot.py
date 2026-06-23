"""
Chatbot API - Text2NoSQL shopping assistant using Pydantic AI.

How it works:
- Normal conversation (greetings, questions): agent replies with plain text.
- Product queries (show me X, find Y under Z price): agent calls `search_products`
    tool which queries MongoDB and returns matching products.
- The endpoint figures out which type of response to send to the frontend.
"""


from fastapi import APIRouter, Body
from backend.database import products_collection
from backend.models.search_filters import ProductSearchFilters
from backend.services.product_search import ProductSearchService
from backend.services.recommendation.recommendation_service import RecommendationService
from backend.services.memory.memory_manager import MemoryManager
from backend.services.memory.context_merger import ContextMerger
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/chat", tags=["Chatbot"])


# ──────────────────────────────────────────────
# Agent Dependencies: carries the product search
# results back out of the tool call
# ──────────────────────────────────────────────


class StoreDeps(BaseModel):
    """Holds the list of products found during this run."""
    session_id: str = "default_session"
    found_products: List[Dict[str, Any]] = []

    class Config:
        arbitrary_types_allowed = True


# ──────────────────────────────────────────────
# Agent - plain string output (simple & reliable)
# We detect product queries from tool usage, NOT
# by forcing a rigid output schema on the LLM.
# ──────────────────────────────────────────────


agent = Agent(
    "groq:qwen/qwen3-32b",
    deps_type=StoreDeps, ## they way it will output
    system_prompt=(
        "You are a friendly shopping assistant for ClothStore — an online clothing store. "
        "The store has 3 categories: men, women, and kids."
        "\n\n"
        "RULES:\n"
        "1. If the user greets you or asks who you are → reply naturally and warmly.\n"
        "2. If the user wants products, extract as many filters as possible.\n"
        "- Men/Women/Kids -> category\n"
        "- T-Shirt/Shirt/Hoodie/Jacket/Jeans/Dress -> subcategory\n"
        "- Colors -> color\n"
        "- Brands -> brand\n"
        "- Price limits -> min_price/max_price\n"
        "Always call search_products with structured filters.\n"
        "3. After calling `search_products`, confirm to the user what you searched for (e.g. 'Here are men's shirts under ₹2000!').\n"
        "4. If the user asks for recommendations, alternatives, or cheaper/premium options, use `recommend_products` tool. You can omit product_name if relying on context.\n"
        "5. If the user asks to clear filters, start over, or completely change topic, use `clear_filters` tool before searching.\n"
        "6. If the user asks something completely unrelated to shopping or clothes, reply: "
        "'Sorry, I can't help with that. For assistance, contact our customer care at 546464434.'\n"
        "7. DO NOT make up product names, prices, or details ever."
    ),
)

@agent.system_prompt
def add_memory_context(ctx: RunContext[StoreDeps]) -> str:
    mem = MemoryManager.get_context(ctx.deps.session_id)
    return f"\n--- CURRENT SHOPPING CONTEXT ---\n{mem.model_dump_json(indent=2)}\n--------------------------------\nUse this context to understand missing parameters (e.g. if user just says 'under 1000', apply that to the existing category/subcategory)."


@agent.tool
def search_products(
    ctx: RunContext[StoreDeps],
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    keyword: Optional[str] = None,
    brand: Optional[str] = None,
    color: Optional[str] = None,
    fit: Optional[str] = None,
    max_price: Optional[int] = None,
    min_price: Optional[int] = None,
) -> str:

    filters = ProductSearchFilters(
        category=category,
        subcategory=subcategory,
        keyword=keyword,
        brand=brand,
        color=color,
        fit=fit,
        max_price=max_price,
        min_price=min_price
    )

    current_context = MemoryManager.get_context(ctx.deps.session_id)
    merged_context = ContextMerger.merge_filters(current_context, filters)

    final_filters = ProductSearchFilters(
        keyword=merged_context.keyword,
        category=merged_context.category,
        subcategory=merged_context.subcategory,
        brand=merged_context.brand,
        color=merged_context.color,
        fit=merged_context.fit,
        min_price=merged_context.min_price,
        max_price=merged_context.max_price,
        sort_by=merged_context.sort_by,
        sort_order=merged_context.sort_order
    )

    processed = ProductSearchService.search(final_filters)
    
    if processed:
        merged_context.last_searched_product = processed[0].get("name")
        
    MemoryManager.update_context(ctx.deps.session_id, merged_context)

    ctx.deps.found_products = processed

    if not processed:
        return "No matching products found."

    return f"Found {len(processed)} matching products."

@agent.tool
def clear_filters(ctx: RunContext[StoreDeps]) -> str:
    """Use this tool when the user asks to start over, clear filters, or completely change the topic (e.g., from men's shirts to women's dresses)."""
    MemoryManager.clear_context(ctx.deps.session_id)
    return "Filters and context have been cleared."

@agent.tool
def recommend_products(
    ctx: RunContext[StoreDeps],
    product_name: Optional[str] = None,
    alternative_type: str = "similar"  # can be 'similar', 'cheaper', 'premium'
) -> str:
    """
    Use this tool when the user asks for similar products, alternatives, cheaper options, or premium options based on a specific product.
    If product_name is omitted, it will automatically use the last searched product from memory.
    """
    mem = MemoryManager.get_context(ctx.deps.session_id)
    target_name = product_name or mem.last_searched_product or mem.last_recommended_product

    if not target_name:
        return "Could not determine which product to base recommendations on. Please ask the user to clarify."

    # 1. Find target product
    target_doc = products_collection.find_one({"name": {"$regex": target_name.strip(), "$options": "i"}})
    if not target_doc:
        return f"Could not find a product matching '{target_name}' to base recommendations on."

    target_doc["id"] = str(target_doc["_id"])
    target_doc.pop("_id", None)

    # 2. Get recommendations
    if alternative_type == "cheaper":
        recs = RecommendationService.get_cheaper_alternatives(target_doc)
    elif alternative_type == "premium":
        recs = RecommendationService.get_premium_alternatives(target_doc)
    else:
        recs = RecommendationService.get_recommendations(target_doc)

    if not recs:
         return f"Could not find any {alternative_type} recommendations for {target_doc.get('name')}."

    # 3. Format outpu
    processed = []
    for r in recs:
        p = r.product
        # Add reasons to the product dict so frontend or LLM can see them
        p["recommendation_reasons"] = r.reasons 
        p["similarity_score"] = r.score
        processed.append(p)

    ctx.deps.found_products = processed
    
    if processed:
        mem.last_recommended_product = processed[0].get("name")
        MemoryManager.update_context(ctx.deps.session_id, mem)
        
    return f"Found {len(processed)} {alternative_type} recommendations based on {target_name}."


@router.post("")
async def chat_bot(data: dict = Body(...)):
    """
    Main chat endpoint. Accepts a user message and returns either
    a plain text reply or a list of matching products.
    """
    user_message = data.get("message", "").strip()
    session_id = data.get("session_id", "default_session")
    
    if not user_message:
        return {"type": "text", "message": "Please type a message!", "data": None}

    deps = StoreDeps(session_id=session_id)

    try:
        result = await agent.run(user_message, deps=deps)
        text_reply = result.output  # plain string from the LLM

        # If the tool was called and found products → send them to the frontend
        if deps.found_products:
            return {
                "type": "products",
                "message": text_reply,
                "data": deps.found_products,
                "debug_context": MemoryManager.get_context(session_id).model_dump()
            }

        # Otherwise just a normal conversation reply
        return {
            "type": "text",
            "message": text_reply,
            "data": None,
            "debug_context": MemoryManager.get_context(session_id).model_dump()
        }

    except Exception as e:
        print(f"[Chatbot Error] {e}")
        return {
            "type": "text",
            "message": "Sorry, I ran into an issue. Please try again or contact customer care at 546464434.",
            "data": None,
        }

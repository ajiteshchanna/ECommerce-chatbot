from backend.routes.chatbot import agent, StoreDeps, MemoryManager
from pydantic_ai import RunContext

async def run_tests():
    print("Running Multi-Turn Memory Validation...")
    
    session_id = "test_memory_session_123"
    deps = StoreDeps(session_id=session_id)
    
    scenarios = [
        "Show black t-shirts",
        "Only oversized",
        "Under 1000",
        "Show premium alternatives",
        "Clear filters",
        "Show women's dresses"
    ]
    
    for user_msg in scenarios:
        print(f"\nUser: {user_msg}")
        result = await agent.run(user_msg, deps=deps)
        
        ctx = MemoryManager.get_context(session_id)
        
        print(f"Assistant: {result.output.encode('ascii', 'ignore').decode()}")
        print(f"--- Context State ---")
        print(f"Category: {ctx.category} | Subcategory: {ctx.subcategory} | Color: {ctx.color} | Fit: {ctx.fit} | Max Price: {ctx.max_price}")
        print(f"Last Searched: {ctx.last_searched_product}")
        print(f"Last Recommended: {ctx.last_recommended_product}")
        print("---------------------")

if __name__ == "__main__":
    import asyncio
    asyncio.run(run_tests())

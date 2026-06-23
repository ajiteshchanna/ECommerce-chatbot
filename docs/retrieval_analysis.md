# Retrieval Architecture Analysis

## 1. Current Retrieval Flow

The existing flow maps the user directly to the MongoDB query via the chatbot orchestrator:
1. **User Input:** "Show me red shirts under 2000"
2. **LLM Agent (`pydantic_ai`):** Parses the prompt and identifies it as a product request.
3. **Agent Tool (`search_products`):** Extracts parameters like `subcategory="shirt"`, `color="red"`, `max_price=2000`.
4. **Tool Execution:** Inside `search_products` (in `chatbot.py`), a MongoDB query dictionary is manually constructed.
5. **Database Call:** `products_collection.find(query).limit(12)` is called.
6. **Results Formatting:** Internal fields `_id` and images are stripped, and `id` string is added.
7. **Response to LLM:** Tool returns a summary to LLM.
8. **Response to Frontend:** `chat_bot` endpoint detects `deps.found_products` and returns them alongside the agent's text response.

## 2. Problems with Current Architecture

1. **Tight Coupling:** The logic to build database queries is tightly coupled with the agent tool inside `chatbot.py`. If we change the database, the chatbot logic breaks.
2. **Lack of Normalization:** If the LLM generates "tees" instead of "T-Shirt", MongoDB won't find it unless the `keyword` regex catches it. Catalog standard terminology is not enforced.
3. **Unstructured Inputs:** The `search_products` tool accepts generic `Optional[str]` fields instead of structured models. Validating or adding complex nested logic is difficult.
4. **Poor Reusability:** If the frontend or another service wants to search products, they cannot reuse the logic embedded within `chatbot.py`.

## 3. Benefits of the New Structured Retrieval Architecture

1. **Separation of Concerns:** `chatbot.py` orchestrates. Models validate. Normalizer standardizes. Query Builder handles syntax. Search Service coordinates. 
2. **Scalability:** We can easily introduce more complex sorting, faceting, and vector-based semantic search down the line without changing the orchestration layer.
3. **Robustness:** Normalization reduces zero-result searches (e.g., mapping "hooded sweatshirt" to "Hoodie").
4. **Testability:** Each component can be unit tested individually.

# Multi-Turn Shopping Memory & Context Management

## Architecture
The Memory Layer consists of three primary components that wrap the LLM agent:
1. **`ConversationContext` (Model)**: Represents the state of the active shopping filter tree (category, price limits, last viewed/searched products).
2. **`MemoryManager` (Service)**: A dictionary-backed session store tracking contexts by `session_id`.
3. **`ContextMerger` (Service)**: Implements safe-merge logic to combine explicitly declared new filters with previously existing memory filters without accidental overwrites.

## Context Lifecycle & Session Flow
1. **Initialization:** The `/chat` endpoint accepts an optional `session_id` (defaulting to `"default_session"` for non-authenticated clients).
2. **Injection:** The LLM's system prompt is dynamically populated with `add_memory_context()`, feeding the LLM the exact JSON representation of the current `ConversationContext`.
3. **Refinement:** When the LLM calls `search_products`, it passes the *newly extracted* filters. `ContextMerger` merges them into the saved session context, runs the search on the DB, and saves the `last_searched_product`.
4. **Tool Redirection:** The `recommend_products` tool uses the `last_searched_product` if the user just asks "show me cheaper ones".

## Reset Strategy
The agent uses the `clear_filters` tool when a user explicitly asks to start over, change topics radically, or clear filters. This replaces the active `session_id` memory with an empty `ConversationContext()`.

## Debugging / Explainability
The frontend receives the full memory state inside the response payload:
```json
{
    "type": "products",
    "message": "...",
    "data": [...],
    "debug_context": {
        "subcategory": "T-Shirt",
        "max_price": 1000,
        "last_searched_product": "Premium Oversized Graphic T-Shirt"
    }
}
```

## Future Personalization Roadmap
This session-based dictionary implementation is purposefully built to be easily replaced by a durable data store (Redis, PostgreSQL). In the future, this allows:
- Cross-session persistent memory.
- User profile personalization (e.g. permanently saving `fit: Slim` for a logged-in user).

# Memory Architecture Design

## Current Architecture Flow
1. **User Request**: "Show black t-shirts"
2. **LLM**: Parses `{"color": "black", "subcategory": "tshirt"}` and calls `search_products`.
3. **Retrieval**: Fetches black t-shirts.
4. **User Follow-up**: "Under 1000"
5. **LLM**: Parses `{"max_price": 1000}`. Forgets "black" and "tshirt" unless the LLM internally rewrites the tool call args. Often, LLMs drop previous context in structured tool calls.
6. **Retrieval**: Fetches *anything* under 1000. 

## Proposed Architecture Flow
1. **User Request**: "Show black t-shirts"
2. **LLM**: Extracts `{"color": "black", "subcategory": "tshirt"}`.
3. **Memory Manager**: Merges this into session context.
4. **Retrieval**: Fetches black t-shirts.
5. **User Follow-up**: "Under 1000"
6. **LLM**: Extracts `{"max_price": 1000}`.
7. **Context Merger**: Merges into existing memory: `{"color": "black", "subcategory": "tshirt", "max_price": 1000}`.
8. **Retrieval**: Uses merged context to fetch black t-shirts under 1000.

## Context Merge Rules
- If a new filter is explicitly provided, it overwrites the old one (e.g. changing color from "black" to "red").
- If a new filter is `None` or omitted, the old filter is preserved.
- The `clear_filters` action flushes the context entirely.

## Future Extensibility
Currently, the memory is session-based (in-memory dict). In the future, this can be seamlessly migrated to Redis or a database to support cross-session persistence, user profiles, and long-term personalization, without altering the `ContextMerger` or chatbot LLM logic.

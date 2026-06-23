# Multi-Turn Memory Validation

## Multi-Turn Refinement Scenario
**1. User:** "Show black t-shirts"
**System:** Extracted `color: black`, `subcategory: t-shirt`. Searched and found *Premium Oversized Graphic T-Shirt*. Context remembered.

**2. User:** "Only oversized"
**System:** Successfully combined previous context with new fit filter (`fit: oversized`). Searched `color: black`, `subcategory: t-shirt`, `fit: oversized`. Found 1 item.

**3. User:** "Under 1000"
**System:** Continued building context. Searched `color: black`, `subcategory: t-shirt`, `fit: oversized`, `max_price: 1000`.

**4. User:** "Show premium alternatives"
**System:** Context explicitly remembered the `last_searched_product` (*Premium Oversized Graphic T-Shirt*) and attempted to find premium upgrades for it without the user repeating the name.

## Reset Scenarios
**5. User:** "Clear filters"
**System:** `clear_filters` tool fired. Memory Context flushed. All fields reset to `None`.

**6. User:** "Show women's dresses"
**System:** New fresh context started: `category: women`, `subcategory: dresses`.

## Conclusion
The ConversationContext correctly persists and layers LLM-extracted filters, preventing repetitive questioning while supporting rapid discovery. The ContextMerger cleanly overwrites or appends filters appropriately.

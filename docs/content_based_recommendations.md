# Content-Based Recommendation Engine

## Overview
This document covers the Phase 2 addition to the Structured Retrieval Layer: a Content-Based Recommendation Engine. It shifts the chatbot from being purely a search tool to a proactive shopping assistant.

## Architecture Flow
```text
Target Product
      ↓
Recommendation Service (Fetches Category Siblings to limit scope)
      ↓
Similarity Scorer (Computes Score & Explainability tags)
      ↓
Ranked Recommendations -> Returned via `/products/{id}/recommendations` OR `chatbot.py (recommend_products)`
```

## Similarity Scorer Formula
Points are awarded for matches against the target product's fields:
- **Category:** Exact Match = `+10`
- **Keyword (Style):** Shared non-generic title words = `+30`
- **Color:** Set Intersection Match = `+10`
- **Price:** Within 20% diff = `+15`, Within 40% diff = `+7.5`
- **Quality:** Rating >= 4.0 = `+10`

### Explainability (Reasons)
Every recommendation generates human-readable tags based on what scored points:
- "Same Category"
- "Similar Style"
- "Same Color"
- "Similar Price Range"
- "Highly Rated"
- "Budget Alternative" (If fetched via budget endpoint)
- "Premium Upgrade" (If fetched via premium endpoint)

## Trade-offs
- **Keyword Proxy vs Strict Subcategory**: Because the generated DB rows use unstructured `name` strings without a strict `subcategory` field, we use a set-intersection of title words (excluding common adjectives). While effective, it's less deterministic than a strictly typed `subcategory` enum.
- **Content-Based vs Collaborative**: This only looks at item features. It does not know what is popular, trending, or frequently bought together.

## Future Upgrades
- **Collaborative Filtering:** Introduce a User-Item interaction matrix to recommend "Customers who bought this also bought...".
- **User Behavior Signals:** Factor in cart-adds and wishlists for scoring.
- **Embedding-Based Similarity:** Replace the manual keyword intersection with a vector database (e.g. Pinecone/Milvus) for true semantic matching.
- **Hybrid Recommendations:** Combine the Content-Based score and Collaborative score into a single unified recommendation framework.

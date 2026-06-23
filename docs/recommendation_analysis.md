# Recommendation Architecture Analysis

## Current State

The database (`products` collection) and models primarily track the following product schema:
- `name`: Free text describing the product.
- `description`: Free text paragraph.
- `price`: Integer.
- `category`: 'men', 'women', 'kids'.
- `color`: List of colors (e.g. `["Black"]`).
- `size`: List of sizes.
- `rating`: Float.
- `reviews`: Integer.

Subcategory, brand, style tags, material, and occasion are typically inferred by `chatbot.py` from user input (via LLM) but are not explicitly separated in the standard generated DB rows. However, keywords often exist in the `name` or `description`.

## Proposed Recommendation Signals

The initial Content-Based Recommendation Engine will utilize these explicit fields to compute similarity scores:
1. **Category (10 points)**: Exact match guarantees products are functionally equivalent.
2. **Title Keyword / Subcategory (30 points)**: A basic keyword overlap check on `name` or `description` to act as a proxy for "subcategory" (e.g. matching "T-Shirt" to "T-Shirt").
3. **Color (10 points)**: Exact or partial match on the `color` array.
4. **Price (15 points)**: Evaluates if candidates are within +/- 20% of the target product's price.
5. **Rating (10 points)**: Recommends products with a rating >= 4.0.

*Total Available Points: 75 (for current explicit fields)*

## Architecture

```text
Target Product
      ↓
Recommendation Service (Fetches Category Siblings)
      ↓
Similarity Scorer (Applies weights & generates explainability strings)
      ↓
Ranked Recommendations (Top N returned to Chatbot or UI)
```

## Future Extensibility
As the product schema expands, the `SimilarityScorer` can easily adopt:
- `brand`
- `material`
- `occasion`
- `style_tags`

This acts as a solid foundational proxy for Collaborative Filtering and Embeddings.

# Recommendation Engine Validation

## Test Execution
A dedicated test script (`test_recommendations.py`) was run against the populated DB to validate the similarity scorer and the different recommendation services (similar, budget, premium).

## Scenario 1: Similar T-Shirts (Men)
**Target:** Classic Black Shirt | Price: 4774 | Rating: 4.9
**Results:**
- **Similar:** Returned "Classic Black Polo" and "Classic Black Jeans" with 75.0 score. Reasons included `Same Category, Similar Style, Same Color, Similar Price Range, Highly Rated`.
- **Budget Alternatives:** Found cheaper items (e.g. 4541, 4160, 3415) down to a 67.5 score, appending the `Budget Alternative` reason.
- **Premium Upgrades:** Found items up to 5594 appending the `Premium Upgrade` reason.

## Scenario 2: Similar Hoodies (Kids)
**Target:** Trendy Beige Hoodie | Price: 1282 | Rating: 4.9
**Results:**
- Found beige items in kids category (Frock, Pajama, Hoodie) ranking highly due to color and style overlap.
- Successfully segregated cheaper alternatives (e.g., 1090, 1097, 377) from premium ones (e.g., 1312, 1284, 5658).

## Scenario 3: Women's Dress Recommendations
**Target:** Relaxed Teal Dress | Price: 2327 | Rating: 3.7
**Results:**
- Highly rated items (>= 4.0) received the `Highly Rated` tag, successfully bumping them above lower-rated items.
- Price similarity boundaries successfully distinguished budget, similar, and premium.

## Conclusion
The Content-Based Recommendation Engine correctly applies the weighting schema defined in `SimilarityScorer`. Explanations map cleanly to the underlying data attributes. The REST endpoints and chatbot tool bindings are functioning correctly and parsing the new `RecommendationResult` structure.

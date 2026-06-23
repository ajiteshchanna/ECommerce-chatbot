from typing import Dict, Any, List

class SimilarityScorer:
    """
    Computes similarity scores and generates explanations between a target product and candidate products.
    """

    # Weights configuration
    CATEGORY_WEIGHT = 10
    KEYWORD_WEIGHT = 30
    COLOR_WEIGHT = 10
    PRICE_WEIGHT = 15
    RATING_WEIGHT = 10

    @classmethod
    def score(cls, target: Dict[str, Any], candidate: Dict[str, Any]) -> tuple[float, List[str]]:
        """
        Calculates similarity score and returns (score, reasons).
        """
        score = 0.0
        reasons = []

        # 1. Category Match
        if target.get("category") and candidate.get("category"):
            if target["category"].lower() == candidate["category"].lower():
                score += cls.CATEGORY_WEIGHT
                reasons.append("Same Category")

        # 2. Keyword/Subcategory Match Proxy
        # Check if they share significant words in their names
        target_name_words = set(target.get("name", "").lower().split())
        candidate_name_words = set(candidate.get("name", "").lower().split())
        
        # Filter out common descriptors
        ignore_words = {"premium", "classic", "modern", "casual", "elegant", "trendy", "bold"}
        target_keywords = target_name_words - ignore_words
        candidate_keywords = candidate_name_words - ignore_words

        if target_keywords & candidate_keywords:
            score += cls.KEYWORD_WEIGHT
            reasons.append("Similar Style")

        # 3. Color Match
        target_colors = set([c.lower() for c in target.get("color", [])])
        candidate_colors = set([c.lower() for c in candidate.get("color", [])])
        if target_colors and candidate_colors and (target_colors & candidate_colors):
            score += cls.COLOR_WEIGHT
            reasons.append("Same Color")

        # 4. Price Similarity
        target_price = target.get("price")
        candidate_price = candidate.get("price")
        if target_price and candidate_price:
            price_diff_ratio = abs(target_price - candidate_price) / max(target_price, 1)
            if price_diff_ratio <= 0.20:
                score += cls.PRICE_WEIGHT
                reasons.append("Similar Price Range")
            elif price_diff_ratio <= 0.40:
                score += (cls.PRICE_WEIGHT / 2)

        # 5. Rating Similarity / Quality
        candidate_rating = candidate.get("rating", 0)
        if candidate_rating >= 4.0:
            score += cls.RATING_WEIGHT
            reasons.append("Highly Rated")

        return score, reasons

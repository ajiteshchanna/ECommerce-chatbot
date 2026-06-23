from typing import Dict, Any, List
from backend.database import products_collection
from backend.models.recommendation import RecommendationResult
from backend.services.recommendation.scorer import SimilarityScorer
from bson import ObjectId

class RecommendationService:
    """
    Coordinates product recommendation retrieval, scoring, and ranking.
    """

    @classmethod
    def get_recommendations(cls, target_product: Dict[str, Any], limit: int = 5) -> List[RecommendationResult]:
        """
        Retrieves top N recommendations for a given target product.
        """
        # Fetch candidate products (e.g. from the same category to narrow down DB query)
        # Exclude the target product itself.
        query = {}
        if "category" in target_product:
            query["category"] = target_product["category"]
            
        if "id" in target_product:
             # Just safety filtering if 'id' exists
             pass

        cursor = products_collection.find(query)
        candidates = []
        for doc in cursor:
            # Transform _id to id string
            doc["id"] = str(doc["_id"])
            doc.pop("_id", None)
            
            # Skip the target product
            if target_product.get("id") == doc["id"]:
                continue
                
            doc.pop("image_data", None)
            doc.pop("image_content_type", None)
            candidates.append(doc)

        # Score candidates
        results = []
        for candidate in candidates:
            score, reasons = SimilarityScorer.score(target_product, candidate)
            
            # We only recommend products with a decent similarity (e.g. at least category + 1 other feature)
            if score >= 20: 
                results.append(RecommendationResult(
                    product=candidate,
                    score=score,
                    reasons=reasons
                ))

        # Sort by score descending
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:limit]

    @classmethod
    def get_cheaper_alternatives(cls, target_product: Dict[str, Any], limit: int = 5) -> List[RecommendationResult]:
        """
        Retrieves similar products that are cheaper.
        """
        recommendations = cls.get_recommendations(target_product, limit=20)
        target_price = target_product.get("price", 0)
        
        cheaper = []
        for rec in recommendations:
            if rec.product.get("price", 0) < target_price:
                rec.reasons.append("Budget Alternative")
                cheaper.append(rec)
                
        return cheaper[:limit]
        
    @classmethod
    def get_premium_alternatives(cls, target_product: Dict[str, Any], limit: int = 5) -> List[RecommendationResult]:
        """
        Retrieves similar products that are more expensive / higher quality.
        """
        recommendations = cls.get_recommendations(target_product, limit=20)
        target_price = target_product.get("price", 0)
        
        premium = []
        for rec in recommendations:
            if rec.product.get("price", 0) > target_price:
                rec.reasons.append("Premium Upgrade")
                premium.append(rec)
                
        return premium[:limit]

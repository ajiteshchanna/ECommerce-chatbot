from pydantic import BaseModel
from typing import Dict, Any, List

class RecommendationResult(BaseModel):
    """
    Structured model representing a recommended product and its score/reasons.
    """
    product: Dict[str, Any]
    score: float
    reasons: List[str]

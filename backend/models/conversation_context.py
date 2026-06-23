from pydantic import BaseModel, Field
from typing import Optional

class ConversationContext(BaseModel):
    """
    Represents the active multi-turn shopping context for a session.
    """
    # Active Search Filters
    keyword: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    color: Optional[str] = None
    fit: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    sort_by: Optional[str] = None
    sort_order: Optional[int] = 1

    # Product Context Memory
    last_viewed_product: Optional[str] = None
    last_recommended_product: Optional[str] = None
    last_searched_product: Optional[str] = None

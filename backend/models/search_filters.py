from pydantic import BaseModel, Field
from typing import Optional

class ProductSearchFilters(BaseModel):
    """
    Structured model for product search filters.
    Provides standard fields to build database queries.
    """
    keyword: Optional[str] = Field(None, description="General search term matching name, description, or subcategory")
    category: Optional[str] = Field(None, description="Main category, e.g., men, women, kids")
    subcategory: Optional[str] = Field(None, description="Specific item type, e.g., shirt, hoodie, jeans")
    brand: Optional[str] = Field(None, description="Brand name")
    color: Optional[str] = Field(None, description="Item color")
    fit: Optional[str] = Field(None, description="Fit style, e.g., slim, regular, loose")
    min_price: Optional[int] = Field(None, description="Minimum price limit")
    max_price: Optional[int] = Field(None, description="Maximum price limit")
    sort_by: Optional[str] = Field(None, description="Field to sort by, e.g., price, name")
    sort_order: Optional[int] = Field(1, description="Sort order: 1 for ascending, -1 for descending")

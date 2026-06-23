from typing import Dict, Any
from backend.models.search_filters import ProductSearchFilters

class MongoQueryBuilder:
    """
    Builds MongoDB queries from structured ProductSearchFilters.
    """

    @staticmethod
    def build_query(filters: ProductSearchFilters) -> Dict[str, Any]:
        """
        Converts filters to a MongoDB query dictionary.
        """
        query: Dict[str, Any] = {}

        if filters.category:
            query["category"] = {
                "$regex": f"^{filters.category.strip()}$",
                "$options": "i"
            }

        if filters.subcategory:
            query["subcategory"] = {
                "$regex": filters.subcategory.strip(),
                "$options": "i"
            }

        if filters.brand:
            query["brand"] = {
                "$regex": filters.brand.strip(),
                "$options": "i"
            }

        if filters.color:
            query["color"] = {
                "$regex": filters.color.strip(),
                "$options": "i"
            }
            
        if filters.fit:
            # Assuming 'description' or 'name' might contain the fit, 
            # or maybe there's a 'fit' field. We'll search description for now
            # as 'fit' wasn't natively a field but is a good generic addition.
            query["description"] = {
                "$regex": filters.fit.strip(),
                "$options": "i"
            }

        if filters.keyword:
            keyword_str = filters.keyword.strip()
            # If there's an existing $or, we need to handle it properly, 
            # but currently we only use $or here.
            query["$or"] = [
                {"name": {"$regex": keyword_str, "$options": "i"}},
                {"description": {"$regex": keyword_str, "$options": "i"}},
                {"subcategory": {"$regex": keyword_str, "$options": "i"}}
            ]

        price_filter = {}
        if filters.min_price is not None:
            price_filter["$gte"] = filters.min_price
        if filters.max_price is not None:
            price_filter["$lte"] = filters.max_price
            
        if price_filter:
            query["price"] = price_filter

        return query

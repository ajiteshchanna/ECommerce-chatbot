from typing import List, Dict, Any
from backend.database import products_collection
from backend.models.search_filters import ProductSearchFilters
from backend.services.normalizer import ProductFilterNormalizer
from backend.services.query_builder import MongoQueryBuilder

class ProductSearchService:
    """
    Coordinates product search operations: normalization, query building, execution, and formatting.
    """

    @staticmethod
    def search(filters: ProductSearchFilters) -> List[Dict[str, Any]]:
        """
        Executes a product search given a set of filters.
        """
        # 1. Normalize filters
        normalized_filters = ProductFilterNormalizer.normalize(filters)

        # 2. Build MongoDB query
        query = MongoQueryBuilder.build_query(normalized_filters)

        # 3. Execute query with limit (and optional sorting)
        cursor = products_collection.find(query)
        
        # Apply sorting if provided
        if normalized_filters.sort_by:
            # Pymongo expects sort("field", direction) where direction is 1 (asc) or -1 (desc)
            # Default to 1 if sort_order is None
            order = normalized_filters.sort_order if normalized_filters.sort_order is not None else 1
            cursor = cursor.sort(normalized_filters.sort_by, order)
            
        raw_results = list(cursor.limit(12))

        # 4. Format product results for the frontend/agent
        processed = []
        for r in raw_results:
            r["id"] = str(r["_id"])
            r.pop("_id", None)
            r.pop("image_data", None)
            r.pop("image_content_type", None)
            processed.append(r)

        return processed

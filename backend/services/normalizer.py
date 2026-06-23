from backend.models.search_filters import ProductSearchFilters

class ProductFilterNormalizer:
    """
    Normalizes user-provided terminology into standardized catalog terminology.
    """
    
    # Common mappings for subcategories
    SUBCATEGORY_MAP = {
        "tee": "T-Shirt",
        "tees": "T-Shirt",
        "tshirt": "T-Shirt",
        "t-shirt": "T-Shirt",
        "t shirts": "T-Shirt",
        "hooded sweatshirt": "Hoodie",
        "hoodies": "Hoodie",
        "joggers": "Jogger",
        "sweatpants": "Jogger",
        "sneakers": "Shoes",
        "kicks": "Shoes"
    }

    # Common mappings for categories
    CATEGORY_MAP = {
        "mens": "men",
        "man": "men",
        "womens": "women",
        "woman": "women",
        "children": "kids",
        "childrens": "kids",
        "boys": "kids",
        "girls": "kids"
    }

    @classmethod
    def normalize(cls, filters: ProductSearchFilters) -> ProductSearchFilters:
        """
        Takes a ProductSearchFilters object and returns a new normalized one.
        """
        normalized = filters.model_copy()

        if normalized.subcategory:
            sub = normalized.subcategory.lower().strip()
            normalized.subcategory = cls.SUBCATEGORY_MAP.get(sub, normalized.subcategory)

        if normalized.category:
            cat = normalized.category.lower().strip()
            normalized.category = cls.CATEGORY_MAP.get(cat, normalized.category)

        return normalized

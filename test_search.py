from backend.models.search_filters import ProductSearchFilters
from backend.services.product_search import ProductSearchService
import json

def run_tests():
    test_cases = [
        {"name": "T-shirts under Rs1000", "filters": ProductSearchFilters(subcategory="tshirt", max_price=1000)},
        {"name": "Men's shirts", "filters": ProductSearchFilters(category="mens", subcategory="shirt")},
        {"name": "Black hoodies", "filters": ProductSearchFilters(color="black", subcategory="hooded sweatshirt")},
        {"name": "Women's dresses", "filters": ProductSearchFilters(category="woman", subcategory="dress")},
        {"name": "Color filters", "filters": ProductSearchFilters(color="red")},
        {"name": "Brand filters", "filters": ProductSearchFilters(brand="Nike")}
    ]

    print("Running Validation Tests...")
    for tc in test_cases:
        print(f"\n--- Test: {tc['name']} ---")
        try:
            results = ProductSearchService.search(tc['filters'])
            print(f"Found {len(results)} products.")
            if results:
                # print first result name/price just to verify
                print(f"Example: {results[0].get('name')} | Price: {results[0].get('price')}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    run_tests()

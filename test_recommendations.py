from backend.services.recommendation.recommendation_service import RecommendationService
from backend.database import products_collection

def run_tests():
    # Fetch some sample products from db
    print("Fetching sample products from DB...")
    
    tshirt = products_collection.find_one({"category": "men", "name": {"$regex": "Shirt", "$options": "i"}}) or products_collection.find_one({"category": "men"})
    hoodie = products_collection.find_one({"category": "kids", "name": {"$regex": "Hoodie", "$options": "i"}}) or products_collection.find_one({"category": "kids"})
    dress = products_collection.find_one({"category": "women", "name": {"$regex": "Dress", "$options": "i"}}) or products_collection.find_one({"category": "women"})
    
    samples = [
        ("Similar T-Shirts", tshirt),
        ("Similar Hoodies", hoodie),
        ("Women's Dress Recommendations", dress)
    ]
    
    for name, prod in samples:
        if not prod:
            print(f"--- Test: {name} --- SKIPPED (No product found)")
            continue
            
        prod["id"] = str(prod["_id"])
        prod.pop("_id", None)
        
        print(f"\n--- Test: {name} ---")
        print(f"Target: {prod.get('name')} | Price: {prod.get('price')} | Rating: {prod.get('rating')}")
        
        recs = RecommendationService.get_recommendations(prod, limit=3)
        print("SIMILAR:")
        for r in recs:
            print(f"  - {r.product.get('name')} | Price: {r.product.get('price')} | Score: {r.score} | Reasons: {r.reasons}")
            
        cheaper = RecommendationService.get_cheaper_alternatives(prod, limit=3)
        print("BUDGET ALTERNATIVES:")
        for r in cheaper:
            print(f"  - {r.product.get('name')} | Price: {r.product.get('price')} | Score: {r.score} | Reasons: {r.reasons}")
            
        premium = RecommendationService.get_premium_alternatives(prod, limit=3)
        print("PREMIUM ALTERNATIVES:")
        for r in premium:
            print(f"  - {r.product.get('name')} | Price: {r.product.get('price')} | Score: {r.score} | Reasons: {r.reasons}")


if __name__ == "__main__":
    run_tests()

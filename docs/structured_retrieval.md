# Structured Retrieval Layer

## Overview
This document explains the transition from the old text-to-NoSQL embedded architecture to the new Structured Retrieval Layer for the eCommerce Chatbot.

## Old Architecture
Previously, the chatbot directly built MongoDB dictionaries from the LLM outputs. 

**Flow**:
User → LLM Agent → `search_products()` → Hardcoded MongoDB Query → Database → Products

**Problems**:
- Tight coupling between Agent orchestration and Database logic.
- Poor search accuracy for non-standard terminology (e.g. "tees" vs "T-Shirt").
- Unscalable: Cannot easily add complex pagination, vector search, or different database backends.

## New Architecture
The retrieval process is now decoupled into specialized services under `backend/services/` and `backend/models/`.

**Flow**:
User → LLM Agent → `ProductSearchFilters` Model → `ProductFilterNormalizer` → `MongoQueryBuilder` → `ProductSearchService` → Database → Products

### Components
1. **`ProductSearchFilters` (Pydantic Model)**
   - Found in `backend/models/search_filters.py`.
   - Provides a strict contract for filters.
   
2. **`ProductFilterNormalizer`**
   - Found in `backend/services/normalizer.py`.
   - Normalizes varied terminology into a catalog standard (e.g., `tshirt` -> `T-Shirt`, `mens` -> `men`).
   
3. **`MongoQueryBuilder`**
   - Found in `backend/services/query_builder.py`.
   - Encapsulates all syntax logic necessary to query the MongoDB.

4. **`ProductSearchService`**
   - Found in `backend/services/product_search.py`.
   - Orchestrates the above three components to return standardized dictionary lists.

## Benefits
- **Separation of Concerns**: Chatbot is purely orchestration now.
- **Improved Accuracy**: The normalization layer catches variations in LLM-generated terminology.
- **Future-Proof**: The architecture allows replacing the MongoDB builder with an Elasticsearch or Vector DB builder without changing the Chatbot layer.

## Trade-offs
- Slight increase in code verbosity due to multiple files and models.
- Minor overhead moving data between layers, although trivial in current scale.

## Future Roadmap
- **Phase 2:** Add Vector Database integration for true semantic search.
- **Phase 3:** Introduce user personalization filters (Recommendation Engine).
- **Phase 4:** Add persistent conversational memory integrated into search filters.

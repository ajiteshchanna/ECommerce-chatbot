from backend.models.search_filters import ProductSearchFilters
from backend.models.conversation_context import ConversationContext

class ContextMerger:
    """
    Merges new search filters into the existing conversation context.
    """

    @staticmethod
    def merge_filters(current_context: ConversationContext, new_filters: ProductSearchFilters) -> ConversationContext:
        """
        Safely merges newly provided filters with the existing context.
        If a new filter is provided, it overwrites the old one.
        If a new filter is None, the old one is retained.
        """
        # Create a dictionary of fields from new_filters that are NOT None
        new_data = new_filters.model_dump(exclude_none=True)
        
        # We dump the current context, update it with new_data, and re-instantiate
        merged_data = current_context.model_dump()
        merged_data.update(new_data)
        
        return ConversationContext(**merged_data)

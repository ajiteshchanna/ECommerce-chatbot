from backend.models.conversation_context import ConversationContext
from typing import Dict

class MemoryManager:
    """
    Manages active shopping contexts per session.
    Using an in-memory dictionary for this sprint. 
    Can be replaced with Redis or DB in the future.
    """
    _sessions: Dict[str, ConversationContext] = {}

    @classmethod
    def get_context(cls, session_id: str) -> ConversationContext:
        """
        Retrieves the active context for a session. Creates one if it doesn't exist.
        """
        if session_id not in cls._sessions:
            cls._sessions[session_id] = ConversationContext()
        return cls._sessions[session_id]

    @classmethod
    def update_context(cls, session_id: str, context: ConversationContext):
        """
        Updates the active context for a session.
        """
        cls._sessions[session_id] = context

    @classmethod
    def clear_context(cls, session_id: str):
        """
        Clears all active context for a session (Reset Strategy).
        """
        cls._sessions[session_id] = ConversationContext()

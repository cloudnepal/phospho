"""
Define the message class
"""

class Message:
    # Typed attributes
    def __init__(self, prompt: str, payload: dict, metadata: dict):
        self.prompt = prompt # can be empty, even though it doesn't make sense
        self.payload = payload # Implemented by the dev user, can be empty
        self.metadata = metadata # Added by the backend : timestamp, user_id, etc. TODO: define the metadata
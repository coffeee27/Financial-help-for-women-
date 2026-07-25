from typing import Optional


class MongoDB:
    def __init__(self, uri: Optional[str] = None) -> None:
        self.uri = uri

    def connect(self) -> str:
        return "MongoDB connection placeholder"

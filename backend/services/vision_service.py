class VisionService:
    def __init__(self) -> None:
        self.name = "vision_service"

    def analyze_document(self, document_text: str) -> str:
        return f"Document analysis placeholder for: {document_text[:80]}"

class VisionAI:
    def __init__(self) -> None:
        self.name = "vision_ai"

    def analyze(self, image_text: str) -> str:
        return f"Vision analysis for: {image_text[:80]}"

class ScamDetector:
    def __init__(self) -> None:
        self.name = "scam_detector"

    def detect(self, text: str) -> dict:
        return {"safe": True, "reason": "Placeholder scam detection"}

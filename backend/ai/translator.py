class Translator:
    def __init__(self) -> None:
        self.name = "translator"

    def translate(self, text: str, target_language: str = "en") -> str:
        return f"[{target_language}] {text}"

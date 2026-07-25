class ChallengeService:
    def __init__(self) -> None:
        self.name = "challenge_service"

    def get_daily_challenge(self) -> dict:
        return {"title": "Save a small amount", "description": "Set aside a small amount today."}

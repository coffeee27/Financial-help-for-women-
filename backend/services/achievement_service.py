class AchievementService:
    def __init__(self) -> None:
        self.name = "achievement_service"

    def list_achievements(self) -> list[dict]:
        return [{"id": 1, "title": "First Step", "description": "Completed your first action."}]

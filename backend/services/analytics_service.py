class AnalyticsService:
    def __init__(self) -> None:
        self.name = "analytics_service"

    def get_snapshot(self) -> dict:
        return {"engagement": 0, "streak": 0}

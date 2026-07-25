class UserService:
    def __init__(self) -> None:
        self.name = "user_service"

    def get_profile(self) -> dict:
        return {"name": "Guest", "status": "active"}

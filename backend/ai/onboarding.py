class OnboardingAI:
    def __init__(self) -> None:
        self.name = "onboarding_ai"

    def suggest_next_step(self, goal: str) -> str:
        return f"Next step for {goal}: define a small weekly action."

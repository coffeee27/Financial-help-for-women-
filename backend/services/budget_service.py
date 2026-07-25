class BudgetService:
    def __init__(self) -> None:
        self.name = "budget_service"

    def calculate_budget(self, income: float, expenses: float) -> dict:
        remaining = income - expenses
        return {"income": income, "expenses": expenses, "remaining": remaining}

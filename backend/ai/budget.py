class BudgetAI:
    def __init__(self) -> None:
        self.name = "budget_ai"

    def explain(self, income: float, expenses: float) -> str:
        return f"Budget explanation for income {income} and expenses {expenses}."

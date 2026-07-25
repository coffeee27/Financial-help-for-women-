from dataclasses import dataclass


@dataclass
class Budget:
    id: str
    income: float
    expenses: float

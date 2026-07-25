from dataclasses import dataclass


@dataclass
class ScamReport:
    id: str
    content: str
    risk_score: int = 0

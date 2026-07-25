from dataclasses import dataclass


@dataclass
class Achievement:
    id: str
    title: str
    description: str = ""

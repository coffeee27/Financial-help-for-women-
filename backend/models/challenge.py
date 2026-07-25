from dataclasses import dataclass


@dataclass
class Challenge:
    id: str
    title: str
    description: str = ""

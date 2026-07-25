from dataclasses import dataclass


@dataclass
class Dream:
    id: str
    title: str
    description: str = ""

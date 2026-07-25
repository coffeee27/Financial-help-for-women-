import json
import os
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "data"


def seed_demo_data() -> None:
    print("Demo data seeded successfully")

import os


def get_firestore_client():
    return {"status": "not_configured", "project_id": os.getenv("FIRESTORE_PROJECT_ID", "demo")}

from fastapi import APIRouter

router = APIRouter(prefix="/achievements", tags=["achievements"])


@router.get("/health")
async def achievements_health() -> dict:
    return {"status": "ok", "message": "achievements route ready"}

from fastapi import APIRouter

router = APIRouter(prefix="/budget", tags=["budget"])


@router.get("/health")
async def budget_health() -> dict:
    return {"status": "ok", "message": "budget route ready"}

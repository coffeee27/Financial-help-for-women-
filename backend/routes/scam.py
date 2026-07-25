from fastapi import APIRouter

router = APIRouter(prefix="/scam", tags=["scam"])


@router.get("/health")
async def scam_health() -> dict:
    return {"status": "ok", "message": "scam route ready"}

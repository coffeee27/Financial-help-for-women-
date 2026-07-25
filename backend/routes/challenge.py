from fastapi import APIRouter

router = APIRouter(prefix="/challenge", tags=["challenge"])


@router.get("/health")
async def challenge_health() -> dict:
    return {"status": "ok", "message": "challenge route ready"}

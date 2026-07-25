from fastapi import APIRouter

router = APIRouter(prefix="/mentor", tags=["mentor"])


@router.get("/health")
async def mentor_health() -> dict:
    return {"status": "ok", "message": "mentor route ready"}

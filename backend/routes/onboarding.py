from fastapi import APIRouter

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.get("/health")
async def onboarding_health() -> dict:
    return {"status": "ok", "message": "onboarding route ready"}

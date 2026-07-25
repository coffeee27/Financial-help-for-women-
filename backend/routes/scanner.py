from fastapi import APIRouter

router = APIRouter(prefix="/scanner", tags=["scanner"])


@router.get("/health")
async def scanner_health() -> dict:
    return {"status": "ok", "message": "scanner route ready"}

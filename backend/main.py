from fastapi import FastAPI

app = FastAPI(title="GirlsHack Backend")


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "message": "Backend service is running"}

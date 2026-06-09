from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def ai_status():
    return {"status": "AI router ready", "stages": ["deterministic", "claude-haiku", "claude-sonnet"]}

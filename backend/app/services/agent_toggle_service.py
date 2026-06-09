"""
Agent ON/OFF toggle stored in Redis.
Key: nura:agent:enabled:{tenant_id}
Value: "1" (on) or "0" (off)
Default: on (if key doesn't exist)
"""
import redis.asyncio as aioredis
from app.core.config import settings


class AgentToggleService:
    def __init__(self):
        self._redis = None

    async def _get_redis(self):
        if not self._redis:
            self._redis = await aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        return self._redis

    async def is_enabled(self, tenant_id: str) -> bool:
        """Returns True if agent is ON (default). False if owner has turned it OFF."""
        r = await self._get_redis()
        val = await r.get(f"nura:agent:enabled:{tenant_id}")
        return val != "0"  # Default to on

    async def set_enabled(self, tenant_id: str, enabled: bool) -> None:
        r = await self._get_redis()
        await r.set(f"nura:agent:enabled:{tenant_id}", "1" if enabled else "0", ex=86400 * 30)

    async def toggle(self, tenant_id: str) -> bool:
        """Toggle and return new state."""
        current = await self.is_enabled(tenant_id)
        new_state = not current
        await self.set_enabled(tenant_id, new_state)
        return new_state


agent_toggle = AgentToggleService()

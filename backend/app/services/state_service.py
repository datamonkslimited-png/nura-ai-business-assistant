from __future__ import annotations

import json
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation_state import ConversationState


class StateService:
    """
    Manages conversation state machine for multi-turn flows.

    Order flow states:
    idle → order.browsing → order.awaiting_quantity → order.awaiting_address
         → order.awaiting_confirmation → order.placed

    Booking flow states:
    idle → booking.awaiting_service → booking.awaiting_date
         → booking.awaiting_time → booking.confirmed
    """

    def __init__(self, db: Optional[AsyncSession]):
        self.db = db

    async def get_state(self, tenant_id: UUID, customer_phone: str) -> Optional[ConversationState]:
        """Get current state for this customer. Returns None if idle/no state."""
        result = await self.db.execute(
            select(ConversationState)
            .where(ConversationState.tenant_id == tenant_id)
            .where(ConversationState.customer_phone == customer_phone)
        )
        state = result.scalar_one_or_none()
        if state and state.flow == "idle":
            return None
        return state

    async def set_state(
        self,
        tenant_id: UUID,
        customer_phone: str,
        flow: str,
        step: str,
        data: dict = None,
    ) -> ConversationState:
        """Upsert state for this customer. Creates if not exists."""
        result = await self.db.execute(
            select(ConversationState)
            .where(ConversationState.tenant_id == tenant_id)
            .where(ConversationState.customer_phone == customer_phone)
        )
        state = result.scalar_one_or_none()

        if state:
            state.flow = flow
            state.step = step
            state.set_data(data or {})
        else:
            state = ConversationState(
                tenant_id=tenant_id,
                customer_phone=customer_phone,
                flow=flow,
                step=step,
            )
            state.set_data(data or {})
            self.db.add(state)

        await self.db.flush()
        return state

    async def clear_state(self, tenant_id: UUID, customer_phone: str) -> None:
        """Reset to idle (order placed, booking confirmed, handoff triggered)."""
        result = await self.db.execute(
            select(ConversationState)
            .where(ConversationState.tenant_id == tenant_id)
            .where(ConversationState.customer_phone == customer_phone)
        )
        state = result.scalar_one_or_none()
        if state:
            state.flow = "idle"
            state.step = ""
            state.set_data({})
            await self.db.flush()

    async def update_data(
        self, tenant_id: UUID, customer_phone: str, extra_data: dict
    ) -> Optional[ConversationState]:
        """Merge extra_data into existing state data dict."""
        result = await self.db.execute(
            select(ConversationState)
            .where(ConversationState.tenant_id == tenant_id)
            .where(ConversationState.customer_phone == customer_phone)
        )
        state = result.scalar_one_or_none()
        if not state:
            return None
        existing = state.get_data()
        existing.update(extra_data)
        state.set_data(existing)
        await self.db.flush()
        return state

    def format_state_context(self, state: Optional[ConversationState]) -> str:
        """
        Format state as context string to inject into AI prompt.
        Returns empty string if idle or None.
        """
        if not state or state.flow == "idle":
            return ""

        data = state.get_data()
        parts = [f"Customer is in {state.flow.upper()} flow, step: {state.step}."]

        if state.flow == "order":
            cart = data.get("cart", [])
            if cart:
                cart_str = ", ".join(
                    f"{item.get('qty', 1)}x {item.get('name', 'item')} (KSh {item.get('price', 0):,})"
                    for item in cart
                )
                parts.append(f"Cart: {cart_str}.")
            if state.step == "awaiting_address":
                parts.append("Delivery address needed.")
            elif state.step == "awaiting_quantity":
                parts.append(f"Awaiting quantity for: {data.get('current_item', 'item')}.")
            elif state.step == "awaiting_confirmation":
                total = data.get("total", 0)
                parts.append(f"Awaiting customer confirmation. Total: KSh {total:,}.")

        elif state.flow == "booking":
            if state.step == "awaiting_service":
                parts.append("Customer needs to choose a service.")
            elif state.step == "awaiting_date":
                service = data.get("service", "service")
                parts.append(f"Service selected: {service}. Awaiting preferred date.")
            elif state.step == "awaiting_time":
                date = data.get("date", "")
                parts.append(f"Date: {date}. Awaiting preferred time slot.")
            elif state.step == "confirmed":
                service = data.get("service", "service")
                date = data.get("date", "")
                time = data.get("time", "")
                parts.append(f"Booking confirmed: {service} on {date} at {time}.")

        elif state.flow == "quote":
            parts.append("Customer is in lead qualification stage.")

        return " ".join(parts)

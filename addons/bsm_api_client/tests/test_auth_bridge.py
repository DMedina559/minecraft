"""The Minecraft bridge must use the backend's full login policy."""

import importlib.util
from pathlib import Path
from unittest.mock import AsyncMock, Mock

import httpx
import pytest
from fastapi import FastAPI, HTTPException


@pytest.mark.asyncio
async def test_bridge_delegates_login_and_preserves_mfa_rejections():
    source = Path(__file__).parents[1] / "bsm_addon_api_bridge.py"
    spec = importlib.util.spec_from_file_location("minecraft_auth_bridge", source)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    plugin = object.__new__(module.MinecraftBsmApiPlugin)
    plugin.logger = Mock()
    await plugin.on_load()
    app = FastAPI()
    context = object()
    app.state.app_context = context
    app.include_router(plugin.router)
    module.api_login_for_access_token = AsyncMock(
        side_effect=HTTPException(
            401,
            "Authenticator or recovery code required",
            headers={"X-BSM-MFA": "required"},
        )
    )
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        headers = {"X-BSM-API-Username": "minecraft", "X-BSM-API-Password": "secret"}
        response = await client.post("/minecraft-bsm-api/auth/token", headers=headers)
        assert response.status_code == 401
        assert response.headers["X-BSM-MFA"] == "required"
        module.api_login_for_access_token.return_value = module.TokenResponse(
            access_token="tracked"
        )
        module.api_login_for_access_token.side_effect = None
        response = await client.post(
            "/minecraft-bsm-api/auth/token",
            headers={**headers, "X-BSM-API-OTP": "123456"},
        )
    assert response.json()["access_token"] == "tracked"
    arguments = module.api_login_for_access_token.await_args.kwargs
    assert arguments["app_context"] is context
    assert arguments["otp"] == "123456"
    assert arguments["form_data"].username == "minecraft"
    assert arguments["remember_me"] is False

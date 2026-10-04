"""Authentication bridge for BSM API for Minecraft.
Only exchanges BDS SecretString-backed credentials for a BSM JWT.
All normal API calls go directly to BSM's official HTTP API.
"""
from __future__ import annotations
import datetime
from typing import Any
from fastapi import APIRouter, Header, HTTPException, Request, status
from bedrock_server_manager import PluginBase
from bedrock_server_manager.utils import authenticate_user, create_access_token

class MinecraftBsmApiPlugin(PluginBase):
    version = "1.0.0"
    description = "Secret-safe authentication bridge for BSM API for Minecraft."
    author = "dmedina559"

    def on_load(self, **kwargs: Any):
        router = APIRouter(prefix="/minecraft-bsm-api/auth", tags=["Minecraft BSM API"])
        @router.post("/token")
        async def token(request: Request, x_bsm_api_username: str = Header(...), x_bsm_api_password: str = Header(...)):
            app_context = getattr(request.app.state, "app_context", None)
            if app_context is None:
                raise HTTPException(status_code=503, detail="BSM AppContext unavailable")
            username = await authenticate_user(app_context, x_bsm_api_username, x_bsm_api_password)
            if not username:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password", headers={"WWW-Authenticate":"Bearer"})
            jwt = await create_access_token(data={"sub": username}, app_context=app_context, expires_delta=datetime.timedelta(hours=24))
            return {"access_token": jwt, "token_type": "bearer"}
        self._routers=[router]
        self.logger.info("BSM API for Minecraft authentication bridge loaded.")
    def get_fastapi_routers(self, **kwargs: Any):
        return getattr(self,"_routers",[])

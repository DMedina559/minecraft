"""Exchange BDS SecretString headers using BSM's standard tracked login flow."""

from typing import Any

from bedrock_server_manager import PluginBase, app_event
from bedrock_server_manager.web.access_metadata import describe_access
from bedrock_server_manager.web.routers.auth import api_login_for_access_token
from bedrock_server_manager.web.schemas import TokenResponse
from fastapi import APIRouter, Header, Request, Response
from fastapi.security import OAuth2PasswordRequestForm


class MinecraftBsmApiPlugin(PluginBase):
    version = "1.2.0"
    description = "Secret-safe authentication bridge for BSM API for Minecraft."
    author = "dmedina559"
    permissions = []

    @app_event("on_load")
    async def on_load(self, **kwargs: Any):
        router = APIRouter(prefix="/minecraft-bsm-api/auth", tags=["Minecraft BSM API"])

        @router.post(
            "/token",
            response_model=TokenResponse,
            operation_id="minecraft_bsm_authenticate",
        )
        @describe_access("public", authentication="none", additional_checks=[])
        async def token(
            request: Request,
            response: Response,
            x_bsm_api_username: str = Header(...),
            x_bsm_api_password: str = Header(...),
            x_bsm_api_otp: str = Header("", max_length=128),
        ):
            # Reuse throttling, MFA checks, auth revisions and session tracking.
            # Calling create_access_token directly would bypass the login policy.
            return await api_login_for_access_token(
                request=request,
                response=response,
                form_data=OAuth2PasswordRequestForm(
                    username=x_bsm_api_username, password=x_bsm_api_password
                ),
                remember_me=False,
                remember_device=False,
                trusted_device_token=None,
                otp=x_bsm_api_otp,
                app_context=request.app.state.app_context,
            )

        self.router = router
        self.logger.info("BSM API for Minecraft authentication bridge loaded.")

    def get_fastapi_routers(self, **kwargs: Any):
        return [self.router] if hasattr(self, "router") else []

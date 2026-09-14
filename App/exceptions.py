from fastapi import Request
from fastapi.responses import JSONResponse

async def general_exception_handler(
    request: Request,
    exc: Exception
):
    return JSONResponse(
        status_code = 500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": "Something went wrong on the server."
        },
    )

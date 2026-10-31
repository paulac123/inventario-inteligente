from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse


async def http_exception_handler(request: Request, exc: HTTPException):
    """Maneja errores HTTP lanzados desde los services (404, 422, etc.)"""
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


async def general_exception_handler(request: Request, exc: Exception):
    """Atrapa cualquier error inesperado y devuelve 500."""
    return JSONResponse(status_code=500, content={"error": "Error interno del servidor"})

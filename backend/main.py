from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import text
from config.database import engine, create_tables
from routes.sale import router as sale_router
from routes.expense import router as expense_router
from routes.summary import router as summary_router
from routes.category import router as category_router
from routes.payment_method import router as payment_method_router
from middlewares.error_handler import http_exception_handler, general_exception_handler

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

create_tables()

app.include_router(sale_router)
app.include_router(expense_router)
app.include_router(summary_router)
app.include_router(category_router)
app.include_router(payment_method_router)


@app.get("/test-db-connection")
def test_db_connection():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"mensaje": "Conexión a la base de datos exitosa"}

app.mount("/assets", StaticFiles(directory="/frontend/dist/assets"), name="assets")

@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    return FileResponse("/frontend/dist/index.html")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from config.database import engine, create_tables
from routes.sale import router as sale_router
from routes.expense import router as expense_router
from routes.summary import router as summary_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

create_tables()

app.include_router(sale_router)
app.include_router(expense_router)
app.include_router(summary_router)


@app.get("/")
def read_root():
    return {"mensaje": "API de Inventario Inteligente funcionando"}

@app.get("/test-db-connection")
def test_db_connection():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"mensaje": "Conexión a la base de datos exitosa"}

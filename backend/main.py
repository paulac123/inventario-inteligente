from fastapi import FastAPI
from sqlalchemy import text
from config.database import engine, create_tables

app = FastAPI()

create_tables()


@app.get("/")
def read_root():
    return {"mensaje": "API de Inventario Inteligente funcionando"}

@app.get("/test-db-connection")
def test_db_connection():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"mensaje": "Conexión a la base de datos exitosa"}

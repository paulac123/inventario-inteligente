import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import text
from config.database import engine, create_tables
from services.authService import require_roles
from routes.sale import router as sale_router
from routes.expense import router as expense_router
from routes.summary import router as summary_router
from routes.category import router as category_router
from routes.payment_method import router as payment_method_router
from routes.productRouter import router as product_router
from routes.productVariantsRouter import router as product_variants_router
from routes.metrics import router as metrics_router
from routes.customer import router as customer_router
from routes.salePayment import router as sale_payment_router
from routes.auth import router as auth_router
from routes.alerts import router as alerts_router
from routes.debts import router as debts_router
from middlewares.error_handler import http_exception_handler, general_exception_handler


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

app.include_router(sale_router)
app.include_router(expense_router)
app.include_router(summary_router)
app.include_router(category_router)
app.include_router(payment_method_router)
app.include_router(product_router)
app.include_router(product_variants_router)
app.include_router(metrics_router)
app.include_router(customer_router)
app.include_router(sale_payment_router)
app.include_router(auth_router)
app.include_router(alerts_router)
app.include_router(debts_router)


@app.get("/test-db-connection", dependencies=[Depends(require_roles("admin"))])
def test_db_connection():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"mensaje": "Conexión a la base de datos exitosa"}

if os.path.exists("/frontend/dist/assets"):
    app.mount("/assets", StaticFiles(directory="/frontend/dist/assets"), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        return FileResponse("/frontend/dist/index.html")

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite |
| Backend | Python + FastAPI |
| Base de datos | PostgreSQL |
| Contenedor | Docker + docker-compose |
| IA reconocimiento de imágenes | Gemini Vision API (Google) |
| Agente conversacional IA | Claude API (Anthropic) |
| Analytics y predicciones | Python (Pandas, Scikit-learn) |
| Escaneo código de barras | ZXing / QuaggaJS |
| Autenticación | JWT |
| Reportes | ExcelJS / jsPDF |
| Deploy futuro | Render (backend) + Supabase (BD) |

---

## 📁 Estructura de carpetas

```
inventario-inteligente/
├── backend/
│   ├── config/
│   │   └── database.py
│   ├── models/
│   │   ├── sale.py
│   │   ├── expense.py
│   │   ├── category.py
│   │   └── payment_method.py
│   ├── schemas/
│   │   ├── sale.py
│   │   ├── expense.py
│   │   ├── category.py
│   │   └── payment_method.py
│   ├── routes/
│   │   ├── sale.py
│   │   ├── expense.py
│   │   ├── summary.py
│   │   ├── category.py
│   │   └── payment_method.py
│   ├── services/
│   │   ├── saleService.py
│   │   ├── expenseService.py
│   │   ├── summaryService.py
│   │   ├── categoryService.py
│   │   └── paymentMethodService.py
│   ├── middlewares/
│   │   └── error_handler.py
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── SaleModal.jsx
│       │   └── ExpenseModal.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Transactions.jsx
│       │   └── Summary.jsx
│       └── services/
│           ├── api.js
│           ├── saleService.js
│           ├── expenseService.js
│           ├── summaryService.js
│           ├── categoryService.js
│           └── paymentMethodService.js
├── docker-compose.yml
└── README.md
```

---

## 🚀 Roadmap por fases

### Fase 0 — Base del proyecto ✅
- [x] Estructura del proyecto (React + Vite + Python FastAPI + PostgreSQL en Docker)
- [x] Configuración de Docker con docker-compose
- [x] Estructura de carpetas backend (config, models, schemas, routes, services, middlewares)
- [x] Modelos `Sale` y `Expense` con timestamp UTC
- [x] Conexión a PostgreSQL con SQLAlchemy

### Fase 1 — Módulo ventas y egresos ✅
- [x] Schemas Pydantic para validación
- [x] Rutas POST /sales, POST /expenses
- [x] Ruta GET /summary con rango de fechas
- [x] Frontend: sidebar, modales, página de resumen con Tailwind
- [x] Categorías y formas de pago (tablas, rutas, combobox searchable)
- [x] Validación de campos obligatorios con mensajes de error
- [x] Fix zona horaria (filtros en UTC con offset de Colombia)
- [x] Frontend compilado y servido desde FastAPI (1 solo túnel ngrok)
- [x] Notificación flotante de éxito al guardar venta o gasto

### Fase 2 — Vista Inventariador ⬜
- [ ] Login y redirección según rol
- [ ] Ver lista de productos sin cantidades ni marca
- [ ] Escaneo de código de barras con cámara del celular
- [ ] Si no tiene código → foto → Gemini Vision sugiere producto → usuario confirma
- [ ] Ingresar unidades contadas físicamente
- [ ] Guardar conteo en sesión activa

### Fase 3 — Vista Supervisor ⬜
- [ ] Ver resumen de sesión con costo, precio de venta y totales
- [ ] Totales agrupados por marca, referencia y categoría
- [ ] Cruce automático: conteo físico vs cantidad en sistema
- [ ] Reporte con coincidencias, sobrantes y faltantes
- [ ] Exportar reporte a Excel o PDF
- [ ] Aprobar o rechazar sesión de inventario

### Fase 4 — Base de datos de inventario ⬜
- [ ] Tablas: products, users, inventory_sessions, inventory_counts
- [ ] Autenticación JWT con dos roles
- [ ] Importar Excel existente para poblar la BD inicial

### Fase 5 — Dashboard y Analytics ⬜
- [ ] Dashboard con métricas generales de stock
- [ ] Gráficas de rotación por categoría, marca y referencia
- [ ] Alertas de stock mínimo
- [ ] Predicciones basadas en histórico (Pandas, Scikit-learn)

### Fase 6 — Agente IA ⬜
- [ ] Agente Claude integrado para análisis conversacional
- [ ] Interpretar patrones detectados en lenguaje natural
- [ ] Responder preguntas sobre el inventario
- [ ] Sugerencias inteligentes cruzando múltiples variables

### Fase 7 — Funcionalidades extra ⬜
- [ ] Generación automática de referencias por categoría + color + número
- [ ] Impresión de etiquetas con código de barras desde la app

---

## 🤖 Arquitectura de IA

| Herramienta | Rol | Cuándo se usa |
|-------------|-----|---------------|
| **Gemini Vision (Google)** | Reconocimiento de imágenes | Al contar físicamente sin código de barras |
| **Claude API (Anthropic)** | Agente conversacional | Para interpretar datos y dar recomendaciones |
| **Python (Pandas/Scikit-learn)** | Análisis y predicciones | Reportes automáticos, patrones, alertas |

---

## 📅 Plan de desarrollo

| Período | Meta |
|---------|------|
| Octubre — Diciembre 2026 | Fases 0, 1 y 2 |
| Diciembre 2026 — Enero 2027 | Fases 3 y 4 |
| Febrero — Marzo 2027 | Fases 5, 6 y 7 |

---

## 📝 Notas del proyecto

- Desarrollado en local con Docker
- Deploy futuro en Render (backend) + Supabase (BD)
- Proyecto real para tienda de ropa propia (~250 productos)
- Pensado para usarse desde celular durante el conteo físico
- Backend en Python + FastAPI para ampliar perfil laboral
- Proyecto de portafolio profesional

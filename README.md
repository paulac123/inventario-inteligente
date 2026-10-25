---

## 📁 Estructura de carpetas (para comparar con python)

```
inventario-inteligente/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── db/
│   ├── .env
│   └── index.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── services/
├── docker-compose.yml
└── README.md
```

---

## 🚀 Roadmap por fases

### Fase 0 — Módulo ventas y egresos ⬜
- [x] Modelos `Sale` y `Expense` con timestamp UTC
- [ ] Schemas Pydantic para validación
- [ ] Rutas POST /sales, POST /expenses
- [ ] Ruta GET /summary?date= con totales del día
- [ ] Probar con Postman

### Fase 1 — Base del proyecto ⬜
- [x] Estructura del proyecto (React + Vite + Python FastAPI + PostgreSQL en Docker)
- [x] Configuración de Docker con docker-compose
- [x] Estructura de carpetas backend (config, models, schemas, routes, services, migrations, middlewares)
- [ ] Base de datos con todas las tablas (products, users, inventory_sessions, inventory_counts)
- [ ] Autenticación JWT con dos roles
- [ ] Importar Excel existente para poblar la BD inicial

### Fase 2 — Vista Inventariador ⬜
- [ ] Login y redirección según rol
- [ ] Ver lista de productos sin cantidades ni marca
- [ ] Escaneo de código de barras con cámara del celular
- [ ] Si no tiene código → foto → Gemini Vision sugiere producto → usuario confirma
- [ ] Ingresar unidades contadas físicamente
- [ ] Guardar conteo en sesión activa

### Fase 3 — Vista Supervisor ⬜
- [ ] Ver resumen de sesión con costo, precio de venta y totales
- [ ] Totales agrupados por **marca** — unidades, costo total, valor venta total
- [ ] Totales agrupados por **referencia** — unidades, costo total, valor venta total
- [ ] Totales agrupados por **categoría** — unidades, costo total, valor venta total
- [ ] Cruce automático: conteo físico vs cantidad en sistema
- [ ] Reporte con:
  - ✅ Coincidencias
  - ⚠️ Sobrantes
  - ❌ Faltantes
- [ ] Exportar reporte a Excel o PDF
- [ ] Aprobar o rechazar sesión de inventario

### Fase 4 — Dashboard y Analytics ⬜
- [ ] Dashboard con métricas generales de stock
- [ ] Gráficas de rotación por categoría, marca y referencia
- [ ] Reportes estándar automáticos (scripts Python)
- [ ] Alertas de stock mínimo
- [ ] Detección de patrones y tendencias
- [ ] Predicciones basadas en histórico

### Fase 5 — Agente IA ⬜
- [ ] Agente Claude integrado para análisis conversacional
- [ ] Interpretar patrones detectados en lenguaje natural
- [ ] Responder preguntas sobre el inventario ("¿por qué esta referencia no rota?")
- [ ] Sugerencias inteligentes que combinan múltiples variables
- [ ] Historial de inventarios anteriores

### Fase 6 — Funcionalidades extra ⬜
- [ ] Generación automática de referencias por categoría + color + número
- [ ] Impresión de etiquetas con código de barras desde la app

---

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
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.py
│   │   │   └── settings.py
│   │   ├── controllers/
│   │   │   ├── auth_controller.py
│   │   │   ├── product_controller.py
│   │   │   ├── inventory_controller.py
│   │   │   └── agent_controller.py
│   │   ├── middleware/
│   │   │   └── auth_middleware.py
│   │   ├── routes/
│   │   │   ├── auth_routes.py
│   │   │   ├── product_routes.py
│   │   │   ├── inventory_routes.py
│   │   │   └── agent_routes.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── product_service.py
│   │   │   ├── inventory_service.py
│   │   │   ├── gemini_service.py
│   │   │   └── claude_agent_service.py
│   │   ├── models/
│   │   │   ├── product.py
│   │   │   ├── user.py
│   │   │   └── inventory.py
│   │   ├── scripts/
│   │   │   ├── reports.py
│   │   │   ├── alerts.py
│   │   │   ├── patterns.py
│   │   │   └── predictions.py
│   │   └── db/
│   │       └── migrations/
│   ├── .env
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── common/
│       │   ├── inventariador/
│       │   └── supervisor/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── inventariador/
│       │   └── supervisor/
│       ├── context/
│       │   └── AuthContext.jsx
│       └── services/
│           ├── api.js
│           ├── auth.js
│           └── inventory.js
├── docker-compose.yml
└── README.md
```

---

## 🤖 Arquitectura de IA

| Herramienta | Rol | Cuándo se usa |
|-------------|-----|---------------|
| **Gemini Vision (Google)** | Reconocimiento de imágenes | Al contar físicamente sin código de barras |
| **Claude API (Anthropic)** | Agente conversacional | Para interpretar datos y dar recomendaciones |
| **Python (Pandas/Scikit-learn)** | Análisis y predicciones | Reportes automáticos, patrones, alertas |

### Flujo de reconocimiento de imagen
1. Inventariador toma foto de la prenda
2. Gemini Vision identifica el producto
3. Sistema sugiere la referencia al inventariador
4. Inventariador confirma o corrige
5. Se registra el conteo en la sesión activa

### Flujo del agente Claude
1. Python detecta patrones en los datos
2. Supervisor pregunta al agente en lenguaje natural
3. Claude interpreta los datos y responde con recomendaciones
4. El agente puede cruzar múltiples variables para dar sugerencias no obvias

---

## 📅 Plan de desarrollo

| Período | Meta |
|---------|------|
| Octubre — Diciembre 2026 | Módulo ventas/egresos + Fases 1, 2 y 3 |
| Diciembre 2026 — Enero 2027 | Fases 4 y 5 |
| Febrero — Marzo 2027 | Fase 6 y extras |

---

## 📝 Notas del proyecto

- Desarrollado inicialmente en local con Docker
- Deploy futuro en Render (backend) + Supabase (BD)
- Proyecto real para tienda de ropa propia (~250 productos)
- Pensado para usarse desde celular durante el conteo físico
- Backend en Python + FastAPI para ampliar perfil laboral
- Metodología: comparar cómo se haría en Node.js vs Python para entender ambos lenguajes
- Proyecto de portafolio profesional
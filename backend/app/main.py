"""
FastAPI application main file
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, close_db
from app.routers import pacientes, avaliacoes, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()

app = FastAPI(
    title="Sistema de Avaliação Nutricional para Gestantes",
    description="API para avaliação nutricional baseada no checklist FIGO",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - Configure conforme necessário
import os

# Permitir todas as origens em desenvolvimento
# Em produção, configure apenas os domínios permitidos
cors_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# Cors configuration
from app.config import settings

# Adicionar origens via variável de ambiente (separadas por vírgula)
allowed_origins_env = settings.ALLOWED_ORIGINS
if allowed_origins_env and allowed_origins_env != "http://localhost:5173":
    cors_origins.extend([origin.strip() for origin in allowed_origins_env.split(",")])

# Adicionar frontend URL específica se definida
if settings.frontend_url_parsed:
    cors_origins.append(settings.frontend_url_parsed)

# Permitir todas as origens se não estiver em produção estrita
# (Útil para testes, mas idealmente deve ser restrito em produção)
if settings.ENVIRONMENT != "production" and not allowed_origins_env and not settings.frontend_url_parsed:
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(pacientes.router, prefix="/api", tags=["Pacientes"])
app.include_router(avaliacoes.router, prefix="/api", tags=["Avaliações"])
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])
from app.routers import calculos
app.include_router(calculos.router, prefix="/api/calculos", tags=["Cálculos"])
from app.routers import pdf
app.include_router(pdf.router, prefix="/api", tags=["PDF"])

@app.get("/")
async def root():
    return {"message": "API de Avaliação Nutricional para Gestantes", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


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
    "https://nutri-frontend.onrender.com",
]

# Em produção, você pode adicionar o domínio do frontend:
# cors_origins.append("https://seu-frontend.onrender.com")

# Permitir todas as origens se não estiver em produção estrita
# (REMOVER EM PRODUÇÃO E CONFIGURAR DOMÍNIOS ESPECÍFICOS)
if os.getenv("ENVIRONMENT") != "production":
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


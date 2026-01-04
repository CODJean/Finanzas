from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ai_routes
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Crear aplicación
app = FastAPI(
    title="Finanzas Smart AI Service",
    description="Servicio de IA con DeepSeek para análisis financiero",
    version="1.0.0"
)

# Configurar CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas
app.include_router(ai_routes.router)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Finanzas Smart AI Service",
        "version": "1.0.0",
        "ai_model": "deepseek-chat"
    }

@app.get("/health")
async def health_check():
    """Verificar estado del servicio"""
    try:
        # Verificar que la API key esté configurada
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            return {"status": "error", "message": "API key no configurada"}
        
        return {
            "status": "healthy",
            "api_configured": True,
            "deepseek": "ready"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)

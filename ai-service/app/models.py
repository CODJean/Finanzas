from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class Transaction(BaseModel):
    """Modelo de transacción financiera"""
    id: Optional[int] = None
    monto: float
    categoria: Optional[str] = None
    fuente: Optional[str] = None
    descripcion: Optional[str] = None
    fecha: str
    tipo: str  # 'gasto' o 'ingreso'

class ChatMessage(BaseModel):
    """Mensaje de chat"""
    role: str  # 'user' o 'assistant'
    content: str

class ChatRequest(BaseModel):
    """Solicitud de chat"""
    message: str
    conversation_history: List[ChatMessage] = []
    user_id: Optional[str] = None

class FinancialData(BaseModel):
    """Datos financieros del usuario"""
    gastos: List[Transaction] = []
    ingresos: List[Transaction] = []
    presupuestos: List[Dict] = []
    
class AnalysisRequest(BaseModel):
    """Solicitud de análisis financiero"""
    financial_data: FinancialData
    analysis_type: str = "complete"  # complete, spending, savings, budget
    
class CategorizationRequest(BaseModel):
    """Solicitud de categorización automática"""
    descripcion: str
    monto: float
    tipo: str  # 'gasto' o 'ingreso'

class PredictionRequest(BaseModel):
    """Solicitud de predicción de gastos"""
    historical_data: List[Transaction]
    months_ahead: int = 1

class ChatResponse(BaseModel):
    """Respuesta de chat"""
    message: str
    metadata: Optional[Dict] = None

class AnalysisResponse(BaseModel):
    """Respuesta de análisis"""
    analysis: str
    insights: List[str] = []
    recommendations: List[str] = []
    risk_level: Optional[str] = None
    
class CategorizationResponse(BaseModel):
    """Respuesta de categorización"""
    categoria: str
    confidence: float
    reasoning: Optional[str] = None

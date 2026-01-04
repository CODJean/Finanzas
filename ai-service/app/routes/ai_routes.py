from fastapi import APIRouter, HTTPException
from app.models import (
    ChatRequest, ChatResponse,
    AnalysisRequest, AnalysisResponse,
    CategorizationRequest, CategorizationResponse
)
from app.services.financial_analyzer import FinancialAnalyzer

router = APIRouter(prefix="/api/ai", tags=["AI"])

analyzer = FinancialAnalyzer()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint de chat con contexto financiero
    """
    try:
        # Por ahora, chat simple sin datos financieros
        # TODO: Integrar con backend de Node.js para obtener datos del usuario
        
        messages = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history]
        
        response = await analyzer.deepseek.chat_completion(
            messages=[
                {"role": "system", "content": "Eres un asistente financiero amigable. Responde en español de forma concisa."},
                *messages,
                {"role": "user", "content": request.message}
            ],
            temperature=0.7
        )
        
        return ChatResponse(
            message=response,
            metadata={"model": "deepseek-chat"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_finances(request: AnalysisRequest):
    """
    Generar análisis financiero completo
    """
    try:
        result = await analyzer.generate_complete_analysis(request.financial_data)
        
        return AnalysisResponse(
            analysis=result["analysis"],
            insights=result["insights"],
            recommendations=result["recommendations"],
            risk_level=result["risk_level"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en análisis: {str(e)}")

@router.post("/categorize", response_model=CategorizationResponse)
async def categorize_transaction(request: CategorizationRequest):
    """
    Categorizar automáticamente una transacción
    """
    try:
        result = await analyzer.categorize_transaction(
            request.descripcion,
            request.monto,
            request.tipo
        )
        
        return CategorizationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en categorización: {str(e)}")

@router.post("/chat-financial")
async def chat_with_financial_context(request: dict):
    """
    Chat con contexto financiero completo
    """
    try:
        from app.models import FinancialData
        
        message = request.get("message")
        conversation_history = request.get("conversation_history", [])
        financial_data = FinancialData(**request.get("financial_data", {}))
        
        response = await analyzer.chat_with_context(
            message,
            conversation_history,
            financial_data
        )
        
        return {"message": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

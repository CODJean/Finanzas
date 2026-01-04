# 🤖 Finanzas Smart - AI Service (Python)

Servicio de inteligencia artificial usando DeepSeek para análisis financiero avanzado.

## 🚀 Instalación

### 1. Crear entorno virtual
```bash
cd ai-service
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

Crea el archivo `.env`:
```env
DEEPSEEK_API_KEY=tu_api_key_aqui
PORT=8000
NODE_BACKEND_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 4. Ejecutar servicio
```bash
# Modo desarrollo
uvicorn app.main:app --reload --port 8000

# O con Python
python -m app.main
```

## 📡 Endpoints

### Health Check
```http
GET http://localhost:8000/
GET http://localhost:8000/health
```

### Chat Simple
```http
POST http://localhost:8000/api/ai/chat
Content-Type: application/json

{
  "message": "¿Cómo puedo ahorrar más?",
  "conversation_history": []
}
```

### Análisis Financiero Completo
```http
POST http://localhost:8000/api/ai/analyze
Content-Type: application/json

{
  "financial_data": {
    "gastos": [...],
    "ingresos": [...],
    "presupuestos": [...]
  },
  "analysis_type": "complete"
}
```

### Categorización Automática
```http
POST http://localhost:8000/api/ai/categorize
Content-Type: application/json

{
  "descripcion": "Compra en supermercado",
  "monto": 50.00,
  "tipo": "gasto"
}
```

## 🔗 Integración con Node.js Backend

### Actualizar `backend/src/controllers/chatController.js`

Reemplaza el archivo actual con esta versión que llama al servicio Python:
```javascript
import axios from 'axios';
import { supabase } from '../db/supabase.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.userId;

    // Obtener datos financieros
    const [gastosRes, ingresosRes, presupuestosRes] = await Promise.all([
      supabase.from('gastos').select('*').eq('usuario_id', userId),
      supabase.from('ingresos').select('*').eq('usuario_id', userId),
      supabase.from('presupuestos').select('*').eq('usuario_id', userId)
    ]);

    // Llamar al servicio Python
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/chat-financial`, {
      message,
      conversation_history: conversationHistory,
      financial_data: {
        gastos: gastosRes.data || [],
        ingresos: ingresosRes.data || [],
        presupuestos: presupuestosRes.data || []
      }
    });

    res.json({
      message: response.data.message,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: response.data.message }
      ]
    });

  } catch (error) {
    console.error('Error en chat:', error);
    res.status(500).json({ 
      error: 'Error al procesar el mensaje',
      details: error.message 
    });
  }
};

export const getAnalysis = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Obtener datos
    const [gastosRes, ingresosRes, presupuestosRes] = await Promise.all([
      supabase.from('gastos').select('*').eq('usuario_id', userId),
      supabase.from('ingresos').select('*').eq('usuario_id', userId),
      supabase.from('presupuestos').select('*').eq('usuario_id', userId)
    ]);

    // Llamar al servicio Python para análisis completo
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/analyze`, {
      financial_data: {
        gastos: gastosRes.data || [],
        ingresos: ingresosRes.data || [],
        presupuestos: presupuestosRes.data || []
      },
      analysis_type: 'complete'
    });

    res.json({
      analysis: response.data.analysis,
      insights: response.data.insights,
      recommendations: response.data.recommendations,
      risk_level: response.data.risk_level
    });

  } catch (error) {
    console.error('Error al obtener análisis:', error);
    res.status(500).json({ error: 'Error al obtener análisis' });
  }
};
```

## 📊 Características

✅ Chat contextual con datos financieros
✅ Análisis financiero completo con insights
✅ Categorización automática de transacciones
✅ Nivel de riesgo financiero
✅ Recomendaciones personalizadas
✅ Integración con DeepSeek AI

## 🛠️ Desarrollo
```bash
# Ejecutar tests (cuando los agregues)
pytest

# Verificar tipos
mypy app/

# Formatear código
black app/
```

## 📝 Notas

- Puerto por defecto: 8000
- Asegúrate de que el backend Node.js tenga la variable `AI_SERVICE_URL=http://localhost:8000`
- El servicio debe estar corriendo para que el chat funcione

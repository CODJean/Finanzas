import { supabase } from '../db/supabase.js';

// Determinar qué proveedor usar
const AI_PROVIDER = process.env.AI_PROVIDER || 'deepseek'; // 'deepseek', 'gemini', 'openrouter'

let aiClient;

// Configurar cliente según proveedor
if (AI_PROVIDER === 'gemini') {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY no está definida en .env');
    throw new Error('Missing GEMINI_API_KEY');
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  aiClient = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  console.log('🤖 Gemini AI inicializado correctamente ✅');
  
} else if (AI_PROVIDER === 'deepseek') {
  const OpenAI = (await import('openai')).default;
  
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('❌ ERROR: DEEPSEEK_API_KEY no está definida en .env');
    throw new Error('Missing DEEPSEEK_API_KEY');
  }
  
  aiClient = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/v1'
  });
  
  console.log('🤖 DeepSeek AI inicializado correctamente ✅');
}

// Función auxiliar para chat compatible con ambos proveedores
async function generateChatResponse(messages, systemPrompt) {
  if (AI_PROVIDER === 'gemini') {
    // Gemini
    const chat = aiClient.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
      systemInstruction: systemPrompt
    });
    
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
    
  } else {
    // DeepSeek/OpenAI
    const completion = await aiClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });
    
    return completion.choices[0].message.content;
  }
}

export const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.userId;

    // Obtener datos financieros del usuario
    const [gastosRes, ingresosRes, presupuestosRes] = await Promise.all([
      supabase.from('gastos').select('*').eq('usuario_id', userId).order('fecha', { ascending: false }).limit(20),
      supabase.from('ingresos').select('*').eq('usuario_id', userId).order('fecha', { ascending: false }).limit(20),
      supabase.from('presupuestos').select('*').eq('usuario_id', userId)
    ]);

    const gastos = gastosRes.data || [];
    const ingresos = ingresosRes.data || [];
    const presupuestos = presupuestosRes.data || [];

    const totalIngresos = ingresos.reduce((sum, i) => sum + parseFloat(i.monto), 0);
    const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
    const saldo = totalIngresos - totalGastos;

    const gastosPorCategoria = gastos.reduce((acc, gasto) => {
      const cat = gasto.categoria || 'Sin categoría';
      acc[cat] = (acc[cat] || 0) + parseFloat(gasto.monto);
      return acc;
    }, {});

    const contextFinanciero = `
DATOS FINANCIEROS DEL USUARIO:

Resumen General:
- Total de ingresos: $${totalIngresos.toFixed(2)}
- Total de gastos: $${totalGastos.toFixed(2)}
- Saldo actual: $${saldo.toFixed(2)}
- Porcentaje gastado: ${totalIngresos > 0 ? ((totalGastos / totalIngresos) * 100).toFixed(1) : 0}%

Distribución de Gastos por Categoría:
${Object.entries(gastosPorCategoria)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, total]) => `- ${cat}: $${total.toFixed(2)} (${totalGastos > 0 ? ((total / totalGastos) * 100).toFixed(1) : 0}%)`)
  .join('\n')}

Presupuestos Activos: ${presupuestos.length}
${presupuestos.length > 0 ? presupuestos.map(p => `- ${p.categoria}: $${p.monto_limite} (${p.mes})`).join('\n') : ''}

Últimos 5 Gastos:
${gastos.slice(0, 5).map(g => `- ${g.categoria}: $${g.monto} - ${g.descripcion || 'Sin descripción'}`).join('\n')}

Últimos 3 Ingresos:
${ingresos.slice(0, 3).map(i => `- ${i.fuente}: $${i.monto}`).join('\n')}
`;

    const systemPrompt = `Eres "FinBot", un asistente financiero personal inteligente y amigable creado por Finanzas Smart.

TU MISIÓN:
- Ayudar a mejorar la salud financiera del usuario
- Dar consejos prácticos basados en datos reales
- Analizar patrones y oportunidades de ahorro
- Educar sobre finanzas de forma simple

TU PERSONALIDAD:
- Amigable y positivo (nunca crítico)
- Usa emojis ocasionalmente 💰📊✨
- Sé específico con números
- Da ejemplos prácticos

REGLAS:
- No des consejos específicos de inversión en acciones/criptomonedas
- Sé constructivo y motivador
- Respuestas concisas (2-4 párrafos máximo)
- Basa consejos en los datos del usuario

DATOS ACTUALES:
${contextFinanciero}

Responde SIEMPRE en español, de forma clara y motivadora.`;

    // Construir historial de mensajes
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Llamar a la IA
    const assistantMessage = await generateChatResponse(messages, systemPrompt);

    res.json({
      message: assistantMessage,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
      ]
    });

  } catch (error) {
    console.error('Error en chat:', error);
    
    // Manejar error de saldo insuficiente
    if (error.status === 402 || error.message?.includes('Insufficient Balance')) {
      return res.status(402).json({ 
        error: 'Saldo insuficiente en la API de IA',
        message: 'Por favor, recarga créditos en tu cuenta de DeepSeek o cambia a Gemini (gratis) en el archivo .env',
        details: 'Configura GEMINI_API_KEY en lugar de DEEPSEEK_API_KEY'
      });
    }
    
    res.status(500).json({ 
      error: 'Error al procesar el mensaje',
      details: error.message 
    });
  }
};

export const getAnalysis = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [gastosRes, ingresosRes] = await Promise.all([
      supabase.from('gastos').select('*').eq('usuario_id', userId),
      supabase.from('ingresos').select('*').eq('usuario_id', userId)
    ]);

    const gastos = gastosRes.data || [];
    const ingresos = ingresosRes.data || [];

    if (gastos.length === 0 && ingresos.length === 0) {
      return res.json({
        analysis: 'Aún no tienes suficientes datos financieros para generar un análisis. ¡Empieza agregando tus gastos e ingresos! 📊'
      });
    }

    const totalIngresos = ingresos.reduce((sum, i) => sum + parseFloat(i.monto), 0);
    const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);

    const gastosPorCategoria = gastos.reduce((acc, gasto) => {
      const cat = gasto.categoria || 'Sin categoría';
      acc[cat] = (acc[cat] || 0) + parseFloat(gasto.monto);
      return acc;
    }, {});

    const contextFinanciero = `
Datos del usuario:
- Total ingresos: $${totalIngresos.toFixed(2)}
- Total gastos: $${totalGastos.toFixed(2)}
- Saldo: $${(totalIngresos - totalGastos).toFixed(2)}
- Tasa de ahorro: ${totalIngresos > 0 ? (((totalIngresos - totalGastos) / totalIngresos) * 100).toFixed(1) : 0}%

Top 5 categorías de gasto:
${Object.entries(gastosPorCategoria)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([cat, total]) => `- ${cat}: $${total.toFixed(2)} (${totalGastos > 0 ? ((total / totalGastos) * 100).toFixed(1) : 0}%)`)
  .join('\n')}
`;

    const systemPrompt = 'Eres un asesor financiero experto. Analiza y proporciona: 1) Estado actual, 2) Hallazgos principales, 3) 3 recomendaciones accionables. Usa emojis y sé motivador.';
    
    const messages = [
      { role: 'user', content: `${contextFinanciero}\n\nGenera un análisis financiero completo en español.` }
    ];

    const analysis = await generateChatResponse(messages, systemPrompt);

    res.json({ analysis });

  } catch (error) {
    console.error('Error al obtener análisis:', error);
    
    if (error.status === 402 || error.message?.includes('Insufficient Balance')) {
      return res.status(402).json({ 
        error: 'Saldo insuficiente en la API de IA',
        message: 'Cambia a Gemini (gratis) configurando GEMINI_API_KEY en el .env'
      });
    }
    
    res.status(500).json({ error: 'Error al obtener análisis' });
  }
};

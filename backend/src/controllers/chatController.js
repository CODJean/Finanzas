import OpenAI from 'openai';
import { supabase } from '../db/supabase.js';

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ ERROR: DEEPSEEK_API_KEY no está definida en .env');
  throw new Error('Missing DEEPSEEK_API_KEY');
}

console.log('🤖 DeepSeek AI inicializado correctamente ✅');

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'
});

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
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Llamar a DeepSeek
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0].message.content;

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

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Eres un asesor financiero experto. Analiza y proporciona: 1) Estado actual, 2) Hallazgos principales, 3) 3 recomendaciones accionables. Usa emojis y sé motivador.'
        },
        {
          role: 'user',
          content: `${contextFinanciero}\n\nGenera un análisis financiero completo en español.`
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    res.json({
      analysis: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Error al obtener análisis:', error);
    res.status(500).json({ error: 'Error al obtener análisis' });
  }
};

from typing import List, Dict
from app.models import Transaction, FinancialData
from app.services.ai_service import AIService
from datetime import datetime

class FinancialAnalyzer:
    """Analizador financiero usando IA"""
    
    def __init__(self):
        self.ai_service = AIService()
        
    def _prepare_financial_context(self, data: FinancialData) -> str:
        """Preparar contexto financiero para la IA"""
        
        # Calcular métricas básicas
        total_ingresos = sum(float(i.monto) for i in data.ingresos)
        total_gastos = sum(float(g.monto) for g in data.gastos)
        saldo = total_ingresos - total_gastos
        
        # Gastos por categoría
        gastos_por_categoria = {}
        for gasto in data.gastos:
            cat = gasto.categoria or "Sin categoría"
            gastos_por_categoria[cat] = gastos_por_categoria.get(cat, 0) + float(gasto.monto)
        
        # Ingresos por fuente
        ingresos_por_fuente = {}
        for ingreso in data.ingresos:
            fuente = ingreso.fuente or "Sin fuente"
            ingresos_por_fuente[fuente] = ingresos_por_fuente.get(fuente, 0) + float(ingreso.monto)
        
        # Construir contexto
        context = f"""
RESUMEN FINANCIERO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 MÉTRICAS GENERALES:
   • Total Ingresos: ${total_ingresos:,.2f}
   • Total Gastos: ${total_gastos:,.2f}
   • Saldo Actual: ${saldo:,.2f}
   • Tasa de Ahorro: {(saldo/total_ingresos*100 if total_ingresos > 0 else 0):.1f}%
   • Número de Transacciones: {len(data.gastos) + len(data.ingresos)}

💸 DISTRIBUCIÓN DE GASTOS:
"""
        # Top categorías de gasto
        sorted_gastos = sorted(gastos_por_categoria.items(), key=lambda x: x[1], reverse=True)
        for cat, monto in sorted_gastos[:5]:
            percentage = (monto / total_gastos * 100) if total_gastos > 0 else 0
            context += f"   • {cat}: ${monto:,.2f} ({percentage:.1f}%)\n"
        
        context += "\n💰 FUENTES DE INGRESO:\n"
        for fuente, monto in sorted(ingresos_por_fuente.items(), key=lambda x: x[1], reverse=True):
            percentage = (monto / total_ingresos * 100) if total_ingresos > 0 else 0
            context += f"   • {fuente}: ${monto:,.2f} ({percentage:.1f}%)\n"
        
        # Últimas transacciones
        if data.gastos:
            context += "\n📉 ÚLTIMOS 5 GASTOS:\n"
            for gasto in sorted(data.gastos, key=lambda x: x.fecha, reverse=True)[:5]:
                context += f"   • {gasto.fecha[:10]}: ${gasto.monto} - {gasto.categoria} - {gasto.descripcion or 'N/A'}\n"
        
        if data.ingresos:
            context += "\n📈 ÚLTIMOS 3 INGRESOS:\n"
            for ingreso in sorted(data.ingresos, key=lambda x: x.fecha, reverse=True)[:3]:
                context += f"   • {ingreso.fecha[:10]}: ${ingreso.monto} - {ingreso.fuente}\n"
        
        # Presupuestos
        if data.presupuestos:
            context += f"\n🎯 PRESUPUESTOS ACTIVOS: {len(data.presupuestos)}\n"
            for p in data.presupuestos[:3]:
                context += f"   • {p.get('categoria')}: ${p.get('monto_limite')} ({p.get('mes')})\n"
        
        return context
    
    async def generate_complete_analysis(self, data: FinancialData) -> Dict:
        """Generar análisis financiero completo"""
        
        context = self._prepare_financial_context(data)
        
        system_prompt = """Eres un asesor financiero experto certificado. 
        
Tu tarea es analizar los datos financieros y proporcionar:

1. **DIAGNÓSTICO ACTUAL** (2-3 oraciones)
   - Estado general de las finanzas
   - Principal fortaleza
   - Principal área de mejora

2. **INSIGHTS CLAVE** (3-4 puntos)
   - Patrones de gasto identificados
   - Oportunidades de ahorro
   - Tendencias preocupantes (si las hay)

3. **RECOMENDACIONES ACCIONABLES** (3-5 puntos)
   - Acciones específicas y prácticas
   - Priorizadas por impacto
   - Con números concretos cuando sea posible

4. **NIVEL DE RIESGO**: Bajo / Medio / Alto
   - Basado en ratio ahorro/gasto y diversificación

Usa emojis ocasionalmente 💰📊✨ y sé motivador pero honesto."""

        prompt = f"{context}\n\nGenera un análisis financiero completo en español, estructurado y accionable."
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        
        analysis_text = await self.ai_service.chat_completion(messages, temperature=0.7, max_tokens=1200)
        
        # Extraer insights y recomendaciones del texto
        insights = self._extract_bullet_points(analysis_text, ["insights", "hallazgos", "patrones"])
        recommendations = self._extract_bullet_points(analysis_text, ["recomendaciones", "acciones", "sugerencias"])
        
        # Determinar nivel de riesgo
        total_ingresos = sum(float(i.monto) for i in data.ingresos)
        total_gastos = sum(float(g.monto) for g in data.gastos)
        savings_rate = ((total_ingresos - total_gastos) / total_ingresos * 100) if total_ingresos > 0 else 0
        
        if savings_rate >= 20:
            risk_level = "Bajo"
        elif savings_rate >= 10:
            risk_level = "Medio"
        else:
            risk_level = "Alto"
        
        return {
            "analysis": analysis_text,
            "insights": insights,
            "recommendations": recommendations,
            "risk_level": risk_level,
            "metrics": {
                "total_ingresos": total_ingresos,
                "total_gastos": total_gastos,
                "saldo": total_ingresos - total_gastos,
                "savings_rate": savings_rate
            }
        }
    
    async def categorize_transaction(self, descripcion: str, monto: float, tipo: str) -> Dict:
        """Categorizar automáticamente una transacción"""
        
        if tipo == "gasto":
            categorias = [
                "Alimentación", "Transporte", "Vivienda", "Servicios",
                "Entretenimiento", "Salud", "Educación", "Ropa", "Otros"
            ]
        else:  # ingreso
            categorias = [
                "Salario", "Freelance", "Negocio", "Inversiones", "Regalo", "Otros"
            ]
        
        system_prompt = f"""Eres un experto en finanzas personales. 
        
Categoriza la siguiente transacción en UNA de estas categorías:
{', '.join(categorias)}

Responde SOLO con un JSON en este formato:
{{
    "categoria": "nombre_de_categoria",
    "confidence": 0.95,
    "reasoning": "breve explicación"
}}"""

        prompt = f"""Transacción:
- Descripción: {descripcion}
- Monto: ${monto}
- Tipo: {tipo}

Categorízala."""

        try:
            result = await self.ai_service.structured_completion(prompt, system_prompt, temperature=0.3)
            
            # Validar que la categoría esté en la lista
            categoria = result.get("categoria", "Otros")
            if categoria not in categorias:
                categoria = "Otros"
            
            return {
                "categoria": categoria,
                "confidence": result.get("confidence", 0.8),
                "reasoning": result.get("reasoning", "Categorización automática")
            }
        except Exception as e:
            # Fallback: categoría por defecto
            return {
                "categoria": "Otros",
                "confidence": 0.5,
                "reasoning": f"Error en categorización: {str(e)}"
            }
    
    async def chat_with_context(
        self, 
        message: str, 
        conversation_history: List[Dict],
        financial_data: FinancialData
    ) -> str:
        """Chat contextual con datos financieros"""
        
        context = self._prepare_financial_context(financial_data)
        
        system_prompt = f"""Eres "FinBot", un asistente financiero personal inteligente y amigable.

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

DATOS FINANCIEROS DEL USUARIO:
{context}

Responde SIEMPRE en español, de forma clara y motivadora."""

        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(conversation_history)
        messages.append({"role": "user", "content": message})
        
        response = await self.ai_service.chat_completion(messages, temperature=0.7, max_tokens=800)
        return response
    
    def _extract_bullet_points(self, text: str, keywords: List[str]) -> List[str]:
        """Extraer puntos de una lista en el texto"""
        points = []
        lines = text.split('\n')
        
        in_section = False
        for line in lines:
            line = line.strip()
            
            # Detectar inicio de sección
            if any(keyword in line.lower() for keyword in keywords):
                in_section = True
                continue
            
            # Detectar fin de sección
            if in_section and line and not line.startswith(('•', '-', '*', '1', '2', '3', '4', '5')):
                if len(points) > 0:
                    in_section = False
            
            # Extraer punto
            if in_section and line:
                if line.startswith(('•', '-', '*')):
                    points.append(line.lstrip('•-* '))
                elif line[0].isdigit() and '.' in line[:3]:
                    points.append(line.split('.', 1)[1].strip())
        
        return points[:5]  # Máximo 5 puntos

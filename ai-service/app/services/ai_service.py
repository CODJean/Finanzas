import os
from typing import List, Dict
import json

# Determinar proveedor
AI_PROVIDER = os.getenv('AI_PROVIDER', 'gemini')

if AI_PROVIDER == 'gemini':
    import google.generativeai as genai
else:
    from openai import OpenAI

class AIService:
    """Servicio unificado para múltiples proveedores de IA"""
    
    def __init__(self):
        self.provider = AI_PROVIDER
        
        if self.provider == 'gemini':
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                raise ValueError("GEMINI_API_KEY no está configurada")
            
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
            print("✅ Gemini AI inicializado")
            
        else:  # deepseek
            api_key = os.getenv('DEEPSEEK_API_KEY')
            if not api_key:
                raise ValueError("DEEPSEEK_API_KEY no está configurada")
                
            self.client = OpenAI(
                api_key=api_key,
                base_url='https://api.deepseek.com/v1'
            )
            self.model_name = "deepseek-chat"
            print("✅ DeepSeek AI inicializado")
        
    async def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        temperature: float = 0.7,
        max_tokens: int = 1024
    ) -> str:
        """
        Obtener respuesta de chat del proveedor configurado
        
        Args:
            messages: Lista de mensajes [{"role": "user", "content": "..."}]
            temperature: Creatividad (0-1)
            max_tokens: Tokens máximos en respuesta
            
        Returns:
            Respuesta del modelo
        """
        try:
            if self.provider == 'gemini':
                return await self._gemini_completion(messages, temperature, max_tokens)
            else:
                return await self._deepseek_completion(messages, temperature, max_tokens)
        except Exception as e:
            raise Exception(f"Error en {self.provider} API: {str(e)}")
    
    async def _gemini_completion(self, messages, temperature, max_tokens):
        """Completion usando Gemini"""
        # Separar system prompt del resto
        system_prompt = None
        chat_messages = []
        
        for msg in messages:
            if msg['role'] == 'system':
                system_prompt = msg['content']
            else:
                chat_messages.append(msg)
        
        # Convertir historial para Gemini
        history = []
        for msg in chat_messages[:-1]:
            history.append({
                'role': 'model' if msg['role'] == 'assistant' else 'user',
                'parts': [msg['content']]
            })
        
        # Configurar chat
        chat = self.model.start_chat(
            history=history
        )
        
        # Preparar último mensaje con system prompt
        last_message = chat_messages[-1]['content']
        if system_prompt:
            last_message = f"{system_prompt}\n\n{last_message}"
        
        # Generar respuesta
        response = chat.send_message(
            last_message,
            generation_config={
                'temperature': temperature,
                'max_output_tokens': max_tokens,
            }
        )
        
        return response.text
    
    async def _deepseek_completion(self, messages, temperature, max_tokens):
        """Completion usando DeepSeek"""
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content
    
    async def structured_completion(
        self,
        prompt: str,
        system_prompt: str = None,
        temperature: float = 0.5
    ) -> Dict:
        """
        Obtener respuesta estructurada en JSON
        
        Args:
            prompt: Pregunta del usuario
            system_prompt: Instrucciones del sistema
            temperature: Creatividad
            
        Returns:
            Diccionario con la respuesta parseada
        """
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
            
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = await self.chat_completion(
                messages=messages,
                temperature=temperature,
                max_tokens=800
            )
            
            # Intentar parsear JSON
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                # Si no es JSON válido, extraer entre ```json y ```
                if "```json" in response:
                    json_str = response.split("```json")[1].split("```")[0].strip()
                    return json.loads(json_str)
                return {"raw_response": response}
                
        except Exception as e:
            raise Exception(f"Error al obtener respuesta estructurada: {str(e)}")

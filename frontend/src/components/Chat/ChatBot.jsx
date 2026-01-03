import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, getFinancialAnalysis } from '../../services/api';

const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! 👋 Soy FinBot, tu asistente financiero personal. Puedo ayudarte a analizar tus gastos, darte consejos de ahorro y responder tus dudas sobre finanzas. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Agregar mensaje del usuario
    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Preparar historial para la API (sin el mensaje de bienvenida inicial)
      const conversationHistory = messages
        .slice(1)
        .map(msg => ({ role: msg.role, content: msg.content }));

      const response = await sendChatMessage(userMessage, conversationHistory);
      
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response.data.message }
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '❌ Lo siento, hubo un error al procesar tu mensaje. Verifica que hayas configurado tu API Key de Anthropic en el backend.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  const handleAnalysis = async () => {
    setLoadingAnalysis(true);
    
    try {
      const response = await getFinancialAnalysis();
      
      setMessages([
        ...messages,
        { role: 'user', content: '📊 Dame un análisis completo de mis finanzas' },
        { role: 'assistant', content: response.data.analysis }
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...messages,
        { role: 'assistant', content: '❌ Error al generar el análisis. Verifica tu configuración de API.' }
      ]);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const quickQuestions = [
    '¿Cómo puedo ahorrar más?',
    'Analiza mis gastos',
    '¿En qué categoría gasto más?',
    'Dame consejos financieros'
  ];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-primary-500 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <h3 className="font-bold text-lg">FinBot</h3>
            <p className="text-xs opacity-90">Tu asistente financiero IA</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          title="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-lg shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-700'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🤖</span>
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">FinBot</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">💡 Preguntas sugeridas:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs p-2 bg-gray-100 dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300 rounded-lg text-left transition-colors border border-transparent hover:border-primary-300"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Button */}
      <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleAnalysis}
          disabled={loadingAnalysis}
          className="w-full bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
        >
          {loadingAnalysis ? (
            <>
              <span className="animate-spin">⚙️</span>
              <span>Analizando...</span>
            </>
          ) : (
            <>
              <span>📊</span>
              <span>Análisis Financiero Completo</span>
            </>
          )}
        </button>
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta aquí..."
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows="2"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            title="Enviar mensaje"
          >
            <span className="text-xl">▶</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;

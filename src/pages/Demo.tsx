
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Send, User, Bot, LogOut, Play } from 'lucide-react';
import { toast } from 'sonner';

const BASE_API_URL = 'http://localhost:5000'; // Change this to your actual API URL
const OPENAI_API_URL = 'http://localhost:5000'; // Change this to your OpenAI server URL

const Demo = () => {
  const { user, loading, signOut } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', content: string}>>([
    {type: 'bot', content: '¡Hola! Soy tu asistente de entrenamiento. ¿En qué tipo de situación quieres practicar hoy? ¿Una entrevista laboral, una presentación académica o un discurso profesional?'}
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    }
  }, [loading, user, navigate]);
  
  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, {type: 'user', content: message}]);
    setIsProcessing(true);
    
    try {
      // Call OpenAI API
      const response = await fetch(`${OPENAI_API_URL}/api/openai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
      });
      
      if (!response.ok) {
        throw new Error('Error al comunicarse con el asistente');
      }
      
      const data = await response.json();
      
      // Add assistant response
      setMessages(prev => [...prev, {type: 'bot', content: data.response}]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al comunicarse con el asistente');
      
      // Fallback response if API fails
      setMessages(prev => [...prev, {type: 'bot', content: 'Lo siento, estoy teniendo problemas para responder. Por favor, intenta de nuevo más tarde.'}]);
    } finally {
      setIsProcessing(false);
      setMessage('');
    }
  };
  
  const runElevenLabsDemo = async () => {
    try {
      setIsProcessing(true);
      toast.info('Iniciando ElevenLabs...');
      
      const response = await fetch(`${BASE_API_URL}/api/run-prueba`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al ejecutar el demo de ElevenLabs');
      }
      
      const data = await response.json();
      console.log('ElevenLabs demo response:', data);
      
      toast.success('Demo de ElevenLabs iniciado correctamente');
      setMessages(prev => [...prev, {type: 'bot', content: 'Demo de ElevenLabs iniciado. ¡Ahora puedes interactuar con el asistente por voz!'}]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al iniciar el demo de ElevenLabs');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const toggleListening = () => {
    setIsListening(!isListening);
    
    // Este es un placeholder. En una implementación real, usarías una API para convertir voz a texto.
    if (!isListening) {
      // Simulating voice recognition
      setTimeout(() => {
        setMessage(prev => prev + "Me gustaría practicar para una entrevista en el sector tecnológico. ");
        setIsListening(false);
      }, 3000);
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/5ca03822-e2b4-4bd7-a6b6-81224f3fc870.png" 
              alt="ProTalker Logo" 
              className="h-8 w-8"
            />
            <span className="font-display font-semibold text-lg text-foreground">ProTalker</span>
          </a>
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Demo de entrenamiento</h1>
          <p className="text-muted-foreground">
            Interactúa con nuestro asistente para practicar tus habilidades de comunicación
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 flex-grow">
          <div className="w-full md:w-3/4 bg-white rounded-lg shadow-md flex flex-col">
            <Tabs defaultValue="chat" className="flex-grow flex flex-col">
              <div className="border-b px-4">
                <TabsList className="mt-2">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="feedback">Retroalimentación</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="chat" className="flex-grow flex flex-col p-4">
                <div 
                  ref={chatContainerRef}
                  className="flex-grow overflow-y-auto mb-4 space-y-4"
                >
                  {messages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.type === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          {msg.type === 'bot' ? <Bot size={14} className="mr-1" /> : <User size={14} className="mr-1" />}
                          <span className="text-xs font-medium">
                            {msg.type === 'user' ? 'Tú' : 'Asistente'}
                          </span>
                        </div>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant={isListening ? "destructive" : "secondary"}
                    onClick={toggleListening}
                    className="flex-shrink-0"
                    disabled={isProcessing}
                  >
                    <Mic size={18} />
                  </Button>
                  
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="resize-none min-h-[2.5rem]"
                    disabled={isProcessing}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  
                  <Button 
                    size="icon" 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isProcessing}
                    className="flex-shrink-0"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="feedback" className="p-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Análisis de comunicación</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Claridad del mensaje</span>
                          <span className="font-medium">78%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Estructura</span>
                          <span className="font-medium">82%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '82%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Confianza percibida</span>
                          <span className="font-medium">65%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Recomendaciones</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Trata de responder con ejemplos más específicos.</li>
                      <li>Evita usar muletillas como "eh", "um" y "como que".</li>
                      <li>Mantén contacto visual más consistente.</li>
                      <li>Mejora tu tono variando la entonación para enfatizar puntos clave.</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="w-full md:w-1/4 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-medium mb-3">Escenarios disponibles</h3>
              <ul className="space-y-2">
                <li>
                  <Button variant="outline" className="w-full justify-start text-left">
                    Entrevista para desarrollador
                  </Button>
                </li>
                <li>
                  <Button variant="outline" className="w-full justify-start text-left">
                    Presentación de proyecto
                  </Button>
                </li>
                <li>
                  <Button variant="outline" className="w-full justify-start text-left">
                    Discurso motivacional
                  </Button>
                </li>
                <li>
                  <Button variant="outline" className="w-full justify-start text-left">
                    Conversación con cliente
                  </Button>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-medium mb-3">Tu progreso</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sesiones completadas</span>
                    <span className="font-medium">3/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Últimos logros:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary/10 text-primary text-xs py-1 px-2 rounded-full">Respuestas claras</span>
                    <span className="bg-primary/10 text-primary text-xs py-1 px-2 rounded-full">Buen ritmo</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-medium mb-3">Demo de voz con ElevenLabs</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Inicia el demo para interactuar con el asistente utilizando voz (powered by ElevenLabs)
              </p>
              <Button 
                onClick={runElevenLabsDemo} 
                className="w-full flex items-center justify-center"
                disabled={isProcessing}
              >
                <Play className="mr-2 h-4 w-4" />
                Iniciar demo de voz
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Demo;

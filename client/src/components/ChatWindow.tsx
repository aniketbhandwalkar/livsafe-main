import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Copy, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isAnalysis?: boolean;
}

interface ChatWindowProps {
  initialAnalysis?: string;
  patientData?: {
    id: string;
    name: string;
    grade: string;
    confidence?: number;
    date: string;
  };
}

export function ChatWindow({ initialAnalysis, patientData }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  
  // Environment check performed silently

  const LIVSAFE_PROMPT = `You are LivSafe LLM, an advanced AI assistant specializing in liver health and fibrosis assessment. You have:

- Comprehensive knowledge of liver diseases and fibrosis staging
- Access to the latest medical research and clinical guidelines
- Expertise in interpreting liver imaging and diagnostic results
- Understanding of treatment protocols and follow-up recommendations

Your communication style is:
- Professional and informative
- Evidence-based with clear explanations
- Accessible to users while maintaining medical accuracy
- Focused on providing helpful clinical insights
- Always emphasizing the importance of consulting healthcare professionals

When discussing liver fibrosis stages:
- F0: No fibrosis
- F1: Mild fibrosis (portal fibrosis without septa)
- F2: Moderate fibrosis (portal fibrosis with few septa)
- F3: Severe fibrosis (numerous septa without cirrhosis)
- F4: Cirrhosis (advanced fibrosis with regenerative nodules)

Always provide practical recommendations and remind users that imaging findings should be correlated with clinical history, physical examination, and laboratory results for comprehensive patient care.

Respond as LivSafe LLM, providing helpful information while encouraging users to consult with their healthcare providers for medical decisions.`;

  // Initialize with analysis if provided
  useEffect(() => {
    if (initialAnalysis && patientData) {
      const analysisMessage: Message = {
        id: 'analysis-' + Date.now(),
        type: 'ai',
        content: initialAnalysis,
        timestamp: new Date(),
        isAnalysis: true
      };

      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        type: 'ai',
        content: `Hello, I'm Livsafe. I've reviewed the liver fibrosis analysis for ${patientData.name} (Patient ID: ${patientData.id}). The imaging shows a ${patientData.grade} grade with ${patientData.confidence}% confidence. 

I've provided a detailed analysis above. Please feel free to ask any questions about the findings, treatment recommendations, or follow-up protocols. I'm here to help with any clinical concerns you may have.`,
        timestamp: new Date()
      };

      setMessages([analysisMessage, welcomeMessage]);
    } else {
      // General welcome message
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        type: 'ai',
        content: `Hello, I'm Livsafe, I'm here to help you with any questions about liver health, fibrosis staging, treatment options, or general hepatology concerns. How can I assist you today?`,
        timestamp: new Date()
      };

      setMessages([welcomeMessage]);
    }
  }, [initialAnalysis, patientData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateGeminiResponse = async (userMessage: string): Promise<string> => {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    const conversationHistory = messages
      .filter(msg => !msg.isAnalysis)
      .map(msg => `${msg.type === 'user' ? 'User' : 'LivSafe LLM'}: ${msg.content}`)
      .join('\n\n');

    const contextPrompt = patientData 
      ? `Current patient context: ${patientData.name} (ID: ${patientData.id}), Grade: ${patientData.grade}, Confidence: ${patientData.confidence}%, Date: ${patientData.date}\n\n`
      : '';

    const fullPrompt = `${LIVSAFE_PROMPT}

${contextPrompt}Previous conversation:
${conversationHistory}

Current question: ${userMessage}

Please respond as LivSafe LLM with helpful information:`;

    // API call initiated
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      // API error occurred
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I encountered an issue generating a response. Please try again.';
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await generateGeminiResponse(input.trim());
      
      const aiMessage: Message = {
        id: 'ai-' + Date.now(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      // AI response error occurred
      
      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        type: 'ai',
        content: `I apologize, but I'm experiencing technical difficulties: ${error.message}. Please ensure your internet connection is stable and try again. If the problem persists, you may need to configure the Gemini API key.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        variant: 'destructive',
        title: 'AI Response Error',
        description: error.message,
        className:'text-white'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied to clipboard',
      description: 'Message copied successfully',
      className:'text-white'
    });
  };

  const downloadConversation = async () => {
    try {
      // Dynamic import for jsPDF
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Medical Consultation with LivSafe', 20, 30);
      
      // Add patient information if available
      if (patientData) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PATIENT INFORMATION:', 20, 50);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Patient: ${patientData.name} (${patientData.id})`, 20, 65);
        doc.text(`Grade: ${patientData.grade}`, 20, 75);
        doc.text(`Confidence: ${patientData.confidence}%`, 20, 85);
        doc.text(`Date: ${patientData.date}`, 20, 95);
        
        // Add separator
        doc.text('─'.repeat(50), 20, 110);
      }
      
      // Add conversation
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CONVERSATION:', 20, patientData ? 130 : 50);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let yPos = patientData ? 145 : 65;
      
      messages.forEach((message, index) => {
        const timestamp = message.timestamp.toLocaleString();
        const sender = message.type === 'user' ? 'You' : 'LivSafe LLM';
        const content = message.content;
        
        // Add message header
        doc.setFont('helvetica', 'bold');
        doc.text(`[${timestamp}] ${sender}:`, 20, yPos);
        yPos += 5;
        
        // Add message content
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(content, 170);
        doc.text(splitText, 20, yPos);
        yPos += splitText.length * 5 + 10;
        
        // Add new page if needed
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // Add footer
      doc.setFontSize(8);
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, 270);
      doc.text('System: LivSafe Medical Assistant', 20, 280);
      
      // Save the PDF
      doc.save(`consultation-${patientData?.id || 'general'}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: 'Conversation Downloaded',
        description: 'Your consultation has been saved as PDF',
        className:'text-white'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate PDF. Please try again.',
        className:'text-white'
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-primary-900">
      {/* Header */}
      <div className="bg-primary-800 border-b border-primary-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Livsafe</h1>
            <p className="text-sm text-primary-400">Your AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {patientData && (
            <div className="text-right mr-4">
              <p className="text-sm text-white font-medium">{patientData.name}</p>
              <p className="text-xs text-primary-300">Grade: {patientData.grade} • {patientData.confidence}%</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={downloadConversation}
            className="border-primary-600 text-primary-300 hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className="flex items-center mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                  message.type === 'user' ? 'bg-primary-600' : 'bg-accent'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-xs text-primary-400">
                  {message.type === 'user' ? 'You' : 'LivSafe LLM'} • {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className={`p-4 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : message.isAnalysis 
                    ? 'bg-accent/20 border border-accent/30 text-white'
                    : 'bg-primary-700 text-white'
              }`}>
                {message.isAnalysis && (
                  <div className="flex items-center mb-2 text-accent">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Liver Fibrosis Analysis</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.type === 'ai' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 px-2 text-xs text-primary-300 hover:text-white"
                    onClick={() => copyMessage(message.content)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-accent">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-primary-400">Livsafe is typing...</span>
              </div>
              <div className="p-4 rounded-lg bg-primary-700 text-white">
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing your question...
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-primary-800 border-t border-primary-700 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Livsafe about liver health, fibrosis, treatment options..."
              className="bg-primary-700 border-primary-600 text-white placeholder-gray-400  resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-accent hover:bg-accent/90 px-4 py-2 h-auto"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-primary-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

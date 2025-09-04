import { useEffect, useState } from 'react';
import { ChatWindow } from '@/components/ChatWindow';

export default function ChatPage() {
  const [chatData, setChatData] = useState<{
    initialAnalysis?: string;
    patientData?: {
      id: string;
      name: string;
      grade: string;
      confidence?: number;
      date: string;
    };
  }>({});

  useEffect(() => {
    // Get data from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patientId');
    const initialAnalysis = urlParams.get('analysis');
    
    if (patientId) {
      // Get patient data from localStorage or URL params
      const patientData = {
        id: urlParams.get('patientId') || '',
        name: urlParams.get('patientName') || 'Unknown Patient',
        grade: urlParams.get('grade') || 'F0',
        confidence: urlParams.get('confidence') ? parseInt(urlParams.get('confidence')!) : undefined,
        date: urlParams.get('date') || new Date().toLocaleDateString()
      };

      setChatData({
        initialAnalysis: initialAnalysis ? (() => {
          try {
            return decodeURIComponent(initialAnalysis);
          } catch (e) {
            // Failed to decode parameter
            return initialAnalysis;
          }
        })() : undefined,
        patientData
      });
    }

    // Set page title
    const title = patientId 
      ? `Medical Chat - ${urlParams.get('patientName') || 'Patient'} | LivSafe`
      : 'Medical Chat with LivSafe LLM | LivSafe';
    document.title = title;
  }, []);

  return <ChatWindow {...chatData} />;
}

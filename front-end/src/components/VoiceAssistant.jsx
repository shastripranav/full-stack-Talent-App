import React, { useState, useEffect, useRef, useContext } from 'react';
import styled from 'styled-components';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';

const VoiceAssistant = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const [state, setState] = useState({
    isRecording: false,
    isProcessing: false,
    isBotSpeaking: false,
    messages: [],
    error: null,
    currentBotMessage: '',
    introductionDone: false,
    conversationStarted: false
  });
  
  const recognitionRef = useRef(null);
  const chatWindowRef = useRef(null);
  const audioRef = useRef(new Audio());
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Define handleError first since it's used in other functions
  const handleError = (error) => {
    let errorMessage = "An error occurred";
    let canRetry = true;

    if (error.name === 'NotAllowedError') {
      errorMessage = "Please allow microphone access to use the voice assistant";
      canRetry = false;
    } else if (error.message === 'Network Error') {
      errorMessage = "Unable to connect to the server. Please check your internet connection";
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    setState(prev => ({ ...prev, error: { message: errorMessage, retry: canRetry } }));
  };

  const addMessage = (sender, text) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { sender, text, timestamp: new Date() }]
    }));
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      }
    }, 100);
  };

  const startConversation = async () => {
    try {
      setState(prev => ({ ...prev, conversationStarted: true }));
      // Updated API call to match the specified format
      const response = await api.get('/voiceassistant/greeting', {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      });
      
      // Check for the expected response format
      if (response.data.text && response.data.audio && response.data.isIntroduction) {
        addMessage('bot', response.data.text);
        await playAudio(response.data.audio);
        setState(prev => ({ ...prev, introductionDone: true }));
      }
    } catch (error) {
      handleError(error);
    }
  };

  const playAudio = async (base64Audio) => {
    try {
      setState(prev => ({ ...prev, isBotSpeaking: true }));
      const audioData = `data:audio/wav;base64,${base64Audio}`;
      audioRef.current = new Audio(audioData);
      audioRef.current.onended = () => {
        setState(prev => ({ ...prev, isBotSpeaking: false }));
      };
      await audioRef.current.play();
    } catch (error) {
      handleError(error);
    }
  };

  const startRecording = async () => {
    try {
      if (!mediaRecorderRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
      }

      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = processRecording;
      mediaRecorderRef.current.start();
      setState(prev => ({ ...prev, isRecording: true, error: null }));
    } catch (error) {
      handleError(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setState(prev => ({ ...prev, isRecording: false }));
    }
  };

  const processRecording = async () => {
    setState(prev => ({ ...prev, isProcessing: true }));
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const base64Audio = await blobToBase64(audioBlob);
      
      const response = await api.post('/voiceassistant/process', 
        { audio: base64Audio },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      );

      // Add user's transcribed text to messages
      if (response.data.userText) {
        addMessage('user', response.data.userText);
      }

      // Add bot's response and play audio in sequence
      if (response.data.botText && response.data.audio) {
        addMessage('bot', response.data.botText);
        await playAudio(response.data.audio);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Add toggleRecording function
  const toggleRecording = async () => {
    if (state.isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  useEffect(() => {
    startConversation();
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      audioRef.current.pause();
    };
  }, []);

  if (!state.conversationStarted) {
    return (
      <WelcomeScreen>
        <h1>Welcome to TechBot!</h1>
        <StartButton onClick={startConversation}>Start Chatting</StartButton>
      </WelcomeScreen>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Chat with TechBot</Title>
        <CloseButton onClick={onClose} aria-label="Close chat">×</CloseButton>
      </Header>
      
      <ChatWindow ref={chatWindowRef} role="log" aria-live="polite">
        {state.messages.map((message, index) => (
          <MessageBubble 
            key={index} 
            $sender={message.sender}
            role="article"
            aria-label={`${message.sender} message`}
          >
            {message.text}
          </MessageBubble>
        ))}
        {state.error && (
          <ErrorMessage role="alert">
            {state.error.message}
            {state.error.retry && (
              <RetryButton onClick={startConversation}>
                Retry
              </RetryButton>
            )}
          </ErrorMessage>
        )}
      </ChatWindow>

      <Controls>
        <MicButton 
          onClick={toggleRecording}
          disabled={state.isProcessing || state.isBotSpeaking}
          $isRecording={state.isRecording}
          aria-label={state.isRecording ? "Stop recording" : "Start recording"}
        >
          🎤
        </MicButton>
        <StatusBar>
          {state.isRecording ? "Recording..." : 
           state.isProcessing ? "Processing..." :
           state.isBotSpeaking ? "TechBot is speaking..." : 
           "Ready"}
        </StatusBar>
      </Controls>
    </Container>
  );
};

const Container = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);
  margin: 20px;
`;

const Header = styled.div`
  background-color: #4A3CDB;
  color: white;
  padding: 15px 20px;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.2rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
`;

const ChatWindow = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f5f5;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 15px;
  margin-bottom: 10px;
  ${props => props.$sender === 'bot' 
    ? `
      background-color: #4A3CDB;
      color: white;
      align-self: flex-start;
      border-bottom-left-radius: 5px;
      margin-right: auto;
    ` 
    : `
      background-color: white;
      color: #333;
      align-self: flex-end;
      border-bottom-right-radius: 5px;
      margin-left: auto;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    `}
  display: inline-block;
`;

const StatusBar = styled.div`
  padding: 15px;
  background-color: #f8f8f8;
  border-top: 1px solid #eee;
  text-align: center;
  color: #666;
  border-radius: 0 0 10px 10px;
`;

const Controls = styled.div`
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #f8f8f8;
  border-top: 1px solid #eee;
`;

const MicButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.$isRecording ? '#f44336' : '#4A3CDB'};
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  text-align: center;
`;

const RetryButton = styled.button`
  background-color: #c62828;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  margin-left: 10px;
  cursor: pointer;
`;

// Add new styled components
const WelcomeScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: white;
  border-radius: 10px;
  padding: 2rem;
`;

const StartButton = styled.button`
  background-color: #4A3CDB;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3c31b0;
  }
`;

export default VoiceAssistant;

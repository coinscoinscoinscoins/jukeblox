import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// Define session participant type
export interface SessionParticipant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
}

// Define session track type
export interface SessionTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  albumArt?: string;
  addedBy: string;
}

// Define session data type
export interface SessionData {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  host: SessionParticipant;
  participants: SessionParticipant[];
  currentTrack?: SessionTrack;
  queue: SessionTrack[];
  isPlaying: boolean;
}

// Define the shape of our session context
interface SessionContextType {
  currentSession: SessionData | null;
  joinSession: (session: SessionData) => void;
  leaveSession: () => void;
}

// Create the session context with a default value
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Custom hook to use the session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

// Session Provider component
export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  
  // Try to restore session from localStorage on component mount
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem('current_session');
      if (storedSession) {
        setCurrentSession(JSON.parse(storedSession));
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      localStorage.removeItem('current_session');
    }
  }, []);

  // Save session to localStorage when it changes
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('current_session', JSON.stringify(currentSession));
    } else {
      localStorage.removeItem('current_session');
    }
  }, [currentSession]);

  const joinSession = (session: SessionData) => {
    setCurrentSession(session);
  };

  const leaveSession = () => {
    setCurrentSession(null);
  };

  const contextValue: SessionContextType = {
    currentSession,
    joinSession,
    leaveSession
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}; 
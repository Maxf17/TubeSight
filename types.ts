export type Language = 'fr' | 'en';

export interface VideoData {
  url: string; // Blob URL for preview
  file?: File;
  mimeType: string;
}

export interface AnalysisState {
  isLoading: boolean;
  result: string | null;
  error: string | null;
  sources?: string[];
}

export type AnalysisMode = 
  | 'summary' 
  | 'key_takeaways' 
  | 'sentiment' 
  | 'technical' 
  | 'qa';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface SlideData {
  id: string; // Added ID for list rendering
  title: string;
  bulletPoints: string[];
  imageBase64: string;
  notes?: string; // Speaker notes for oral presentation
}

// New interface to persist visual state in App.tsx
export interface VisualsState {
  slides: SlideData[];
  isLoading: boolean;
  error: string | null;
  config: {
    instructions: string;
    audience: string;
    style: string;
    colorTheme: string;
    layoutType: string;
    slideCount: number;
  };
}
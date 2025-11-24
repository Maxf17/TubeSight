import React, { useState, useRef } from 'react';
import { FileText, Zap, Search, ChevronDown, ChevronUp, Upload, Film, Microscope, MessageCircleQuestion } from 'lucide-react';
import { analyzeUploadedVideo } from '../services/geminiService';
import { AnalysisState, AnalysisMode, Language } from '../types';

interface AnalysisFormProps {
  onVideoFileSelect: (file: File) => void;
  onAnalysisStart: (state: AnalysisState) => void;
  onAnalysisComplete: (state: AnalysisState) => void;
  isAnalyzing: boolean;
  selectedFile?: File;
  language: Language;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
  onVideoFileSelect,
  onAnalysisStart,
  onAnalysisComplete,
  isAnalyzing,
  selectedFile,
  language
}) => {
  const [transcript, setTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('summary');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    fr: {
      sourceFile: 'Fichier Source',
      clickToUpload: 'Cliquez pour importer la vidéo',
      formats: 'MP4, WebM (Max 150 Mo)',
      replace: 'Remplacer',
      strategy: "Stratégie d'Analyse",
      summary: 'Résumé',
      keyTakeaways: 'Points Clés',
      sentiment: 'Ambiance',
      technical: 'Technique',
      qa: 'Q & R',
      addContext: 'Ajouter du contexte / Questions précises (Optionnel)',
      placeholder: "Ex: 'Concentre-toi sur la démo technique' ou 'Quel est l'objet tenu par l'orateur ?'",
      analyzing: 'Analyse en cours...',
      startAnalysis: "Lancer l'Analyse",
      tooLarge: "Fichier trop volumineux. Max 150 Mo.",
      uploadError: "Échec du traitement du fichier vidéo."
    },
    en: {
      sourceFile: 'Source File',
      clickToUpload: 'Click to upload video',
      formats: 'MP4, WebM (Max 150 MB)',
      replace: 'Replace',
      strategy: "Analysis Strategy",
      summary: 'Summary',
      keyTakeaways: 'Key Points',
      sentiment: 'Vibe/Tone',
      technical: 'Technical',
      qa: 'Q & A',
      addContext: 'Add context / Specific questions (Optional)',
      placeholder: "Ex: 'Focus on the tech demo' or 'What object is the speaker holding?'",
      analyzing: 'Analyzing...',
      startAnalysis: 'Start Analysis',
      tooLarge: "File too large. Max 150 MB.",
      uploadError: "Failed to process video file."
    }
  };

  const text = t[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 150 * 1024 * 1024) { // 150MB Limit
        alert(text.tooLarge);
        return;
      }
      onVideoFileSelect(file);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    onAnalysisStart({
      isLoading: true,
      result: null,
      error: null
    });

    try {
      const base64Data = await convertFileToBase64(selectedFile);

      const { text: resultText } = await analyzeUploadedVideo(
        base64Data,
        selectedFile.type,
        transcript, 
        selectedMode
      );

      onAnalysisComplete({
        isLoading: false,
        result: resultText,
        error: null
      });
    } catch (err: any) {
      onAnalysisComplete({
        isLoading: false,
        result: null,
        error: err.message || text.uploadError
      });
    }
  };

  const modes: { id: AnalysisMode; label: string; icon: React.ReactNode }[] = [
    { id: 'summary', label: text.summary, icon: <FileText className="w-4 h-4" /> },
    { id: 'key_takeaways', label: text.keyTakeaways, icon: <Zap className="w-4 h-4" /> },
    { id: 'sentiment', label: text.sentiment, icon: <Microscope className="w-4 h-4" /> },
    { id: 'technical', label: text.technical, icon: <Search className="w-4 h-4" /> },
    { id: 'qa', label: text.qa, icon: <MessageCircleQuestion className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8">
      
      {/* File Upload Area */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2">
          <Upload className="w-3 h-3 text-brand-500" />
          {text.sourceFile}
        </label>
        
        {!selectedFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative border border-dashed border-white/20 rounded-2xl bg-white/[0.02] p-8 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/[0.02] transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            <div className="relative z-10 p-4 bg-white/5 rounded-full group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 mb-4 shadow-lg ring-1 ring-white/10">
              <Upload className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <p className="relative z-10 text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{text.clickToUpload}</p>
            <p className="relative z-10 text-xs text-gray-500 mt-1">{text.formats}</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-white/20 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-500/20 rounded-lg ring-1 ring-brand-500/30">
                <Film className="w-5 h-5 text-brand-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-100 truncate max-w-[180px]">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <button 
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = '';
                fileInputRef.current?.click();
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
            >
              {text.replace}
            </button>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
        />
      </div>

      {/* Analysis Mode Selection */}
      <div className="space-y-3">
         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2">
          <Microscope className="w-3 h-3 text-brand-500" />
          {text.strategy}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`flex items-center justify-center gap-2.5 px-3 py-3 rounded-xl text-xs font-bold transition-all duration-200 border ${
                selectedMode === mode.id
                  ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-900/40 transform scale-[1.02]'
                  : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-gray-200 hover:border-white/10'
              }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Context/Notes Toggle */}
      <div className="space-y-3">
        <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden transition-colors hover:border-white/10">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full px-5 py-4 flex items-center justify-between text-xs font-semibold text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
          >
            <span>{text.addContext}</span>
            {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showTranscript && (
            <div className="p-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-200 bg-black/20">
              <textarea
                className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none placeholder-gray-600 transition-all"
                placeholder={text.placeholder}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !selectedFile}
        className={`w-full py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-[0.98] relative overflow-hidden group tracking-wide ${
          isAnalyzing || !selectedFile
            ? 'bg-dark-800 text-dark-600 cursor-not-allowed border border-white/5'
            : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-brand-900/30 border border-brand-400/20'
        }`}
      >
        {/* Shine effect */}
        {!isAnalyzing && selectedFile && (
            <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
        )}

        {isAnalyzing ? (
          <>
            <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="relative z-20">{text.analyzing}</span>
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 relative z-20" />
            <span className="relative z-20">{text.startAnalysis}</span>
          </>
        )}
      </button>
    </div>
  );
};
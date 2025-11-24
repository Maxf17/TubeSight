import React, { useRef, useEffect } from 'react';
import { UploadCloud, Film } from 'lucide-react';
import { Language } from '../types';

interface VideoEmbedProps {
  videoUrl?: string;
  language: Language;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ videoUrl, language }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const t = {
    fr: {
      noVideo: "Aucune vidéo sélectionnée",
      uploadPrompt: "Téléchargez un fichier pour commencer",
      playing: "Lecture"
    },
    en: {
      noVideo: "No video selected",
      uploadPrompt: "Upload a file to begin",
      playing: "Playing"
    }
  };

  const text = t[language];

  // Listen for custom seek events from AnalysisResults or Chat
  useEffect(() => {
    const handleSeek = (event: CustomEvent<number>) => {
      if (videoRef.current) {
        videoRef.current.currentTime = event.detail;
        videoRef.current.play().catch(e => console.log("Play interrupted or failed", e));
        // Smooth scroll to video
        videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    window.addEventListener('tubeSightSeek', handleSeek as any);
    return () => {
      window.removeEventListener('tubeSightSeek', handleSeek as any);
    };
  }, []);

  if (!videoUrl) {
    return (
      <div className="aspect-video w-full bg-dark-950/50 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-5 transition-all duration-500 hover:border-brand-500/30 hover:bg-brand-500/5 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative p-5 rounded-full bg-white/5 ring-1 ring-white/10 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-2xl">
           <UploadCloud className="w-8 h-8 text-gray-500 group-hover:text-white transition-colors" />
        </div>
        <div className="text-center relative z-10">
          <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{text.noVideo}</p>
          <p className="text-xs text-gray-500 mt-1.5 group-hover:text-brand-200 transition-colors">{text.uploadPrompt}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group rounded-2xl">
      {/* Ambient Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-violet-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
      
      <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative z-10">
        <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 pointer-events-none">
            <Film className="w-3 h-3 text-brand-500" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{text.playing}</span>
        </div>
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          src={videoUrl}
          playsInline
        >
          Votre navigateur ne supporte pas la balise vidéo.
        </video>
      </div>
    </div>
  );
};

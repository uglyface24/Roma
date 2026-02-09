
import React, { useState, useEffect, useCallback } from 'react';
import { AppState } from './types';
import FloatingHearts from './components/FloatingHearts';
import MovingButton from './components/MovingButton';
import { generateRomanticMessage } from './services/gemini';
import { audioService } from './services/audio';

interface ConfettiPiece {
  id: number;
  x: string;
  y: string;
  r: string;
  s: number;
  color: string;
}

const App: React.FC = () => {
  const [status, setStatus] = useState<AppState>(AppState.ASKING);
  const [aiMessage, setAiMessage] = useState<string>("");
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [yesScale, setYesScale] = useState(1);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isMuted, setIsMuted] = useState(audioService.isMuted);
  const [hasNoMoved, setHasNoMoved] = useState(false);

  const valentineName = "My Love";

  const handleInteraction = useCallback(() => {
    audioService.initMusic();
  }, []);

  const spawnConfetti = useCallback(() => {
    const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffffff', '#ffd1dc'];
    const newConfetti = Array.from({ length: 80 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 600; 
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      return {
        id: Date.now() + i,
        x: `${x}px`,
        y: `${y}px`,
        r: `${Math.random() * 1000 - 500}deg`,
        s: Math.random() * 1.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 3000);
  }, []);

  const handleYes = async () => {
    handleInteraction();
    audioService.playPop();
    setStatus(AppState.ACCEPTED);
    spawnConfetti();
    setIsLoadingMessage(true);
    const message = await generateRomanticMessage(valentineName);
    setAiMessage(message);
    setIsLoadingMessage(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMutedState = audioService.toggleMute();
    setIsMuted(newMutedState);
  };

  useEffect(() => {
    if (status === AppState.ACCEPTED) {
      audioService.playChime();
    }
  }, [status]);

  const handleNoAttempt = () => {
    handleInteraction();
    setHasNoMoved(true);
    // Growing the Yes button
    setYesScale(prev => Math.min(prev + 0.15, 3));
  };

  // High-reliability GIFs
  const askingGif = "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZDFrcG1peDg0eTBvYXh0amxodTUxODd6cG1tdnB3enc4OTJwZGQ3YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/AXhbp00D9dxF9BCqpn/giphy.gif"; 
  const successGif = "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MGZtOHNxNWJyN2R2d2F0ejRrbzE3dHJieTl6NGVvbmZ3YjJvcjRwZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ANjMpBvC9LeRUopsoU/giphy.gif";

  return (
    <div 
      onClick={handleInteraction}
      className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-[#ffe4e9] overflow-hidden transition-colors duration-700"
    >
      <FloatingHearts />
      
      <button 
        onClick={toggleMute}
        className="fixed top-6 right-6 z-[10000] p-3 bg-white/80 backdrop-blur-md rounded-full border-2 border-rose-200 text-rose-500 hover:text-rose-600 transition-all shadow-md active:scale-90"
        title={isMuted ? "Unmute sounds" : "Mute sounds"}
      >
        <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-xl`}></i>
      </button>

      {confetti.map((c) => (
        <div
          key={c.id}
          className="confetti"
          style={{
            color: c.color,
            '--x': c.x,
            '--y': c.y,
            '--r': c.r,
            '--s': c.s,
          } as React.CSSProperties}
        >
          <i className="fas fa-heart text-2xl"></i>
        </div>
      ))}

      <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-md p-8 rounded-[2rem] letter-shadow text-center border-b-8 border-rose-200 transition-all duration-500">
        {status === AppState.ASKING ? (
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-bubbly text-rose-500 mb-2 leading-tight">
              Will you be my <br/>
              <span className="text-rose-600 font-romantic text-5xl md:text-6xl">Valentine?</span>
            </h1>
            
            <div className="relative inline-block w-48 h-48 md:w-64 md:h-64 mx-auto overflow-hidden rounded-full border-8 border-rose-100 shadow-lg bg-rose-50">
              <img 
                src={askingGif} 
                alt="Please say yes!" 
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-gray-500 font-bold px-4 text-lg italic">"I have a big question and only one right answer..."</p>

            {/* Container for buttons: will naturally center the Yes button once No becomes 'fixed' */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 min-h-[140px] transition-all duration-700">
              <button
                onClick={handleYes}
                style={{ transform: `scale(${yesScale})` }}
                className="bg-rose-500 hover:bg-rose-600 text-white px-10 py-4 rounded-full font-bold text-xl shadow-xl transition-all duration-500 hover:shadow-rose-300 hover:-translate-y-1 active:scale-95 z-40 min-w-[140px]"
              >
                YES! ❤️
              </button>
              
              <MovingButton onAttempt={handleNoAttempt} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="inline-block px-6 py-2 bg-green-100 text-green-600 rounded-full text-sm font-bold tracking-widest uppercase mb-2 animate-bounce">
              Success!
            </div>
            
            <h1 className="text-4xl md:text-5xl font-romantic text-rose-600 animate-softFloat">
              I'm so happy!
            </h1>

            <div className="relative inline-block w-48 h-48 md:w-64 md:h-64 mx-auto overflow-hidden rounded-2xl border-4 border-rose-200 shadow-md transform rotate-3 transition-transform hover:rotate-0 duration-500 bg-rose-50">
              <img 
                src={successGif} 
                alt="Yay!" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative mt-12 pb-8">
               <div className="parchment p-10 rounded-lg shadow-2xl relative overflow-visible border-double border-4 border-[#d4c5a9]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-white/20 blur-sm rounded-full"></div>
                  <i className="fas fa-quote-left absolute top-4 left-4 text-rose-200/40 text-4xl"></i>
                  
                  {isLoadingMessage ? (
                    <div className="flex flex-col items-center py-8 space-y-4">
                      <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
                      <span className="text-rose-400 font-medium italic">Sealing our bond...</span>
                    </div>
                  ) : (
                    <p className="text-[#5d4037] text-2xl font-romantic leading-relaxed relative z-10 py-4 animate-textReveal px-2">
                      {aiMessage}
                    </p>
                  )}
                  
                  <div className="wax-seal" onClick={() => audioService.playPop()}>
                    <i className="fas fa-heart text-white text-2xl"></i>
                  </div>
               </div>
            </div>

            <button
              onClick={() => {
                setStatus(AppState.ASKING);
                setYesScale(1);
                setConfetti([]);
                setHasNoMoved(false);
              }}
              className="text-xs text-rose-300 hover:text-rose-500 transition-colors uppercase tracking-widest font-bold pt-8 block mx-auto"
            >
              Ask me again (for more love)
            </button>
          </div>
        )}
      </div>

      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <i className="fas fa-cloud text-white text-9xl absolute top-10 left-[10%] animate-softFloat"></i>
        <i className="fas fa-cloud text-white text-8xl absolute top-40 right-[15%] animate-softFloat" style={{ animationDelay: '1s' }}></i>
        <i className="fas fa-star text-yellow-100 text-2xl absolute top-20 right-[25%] animate-pulse"></i>
        <i className="fas fa-star text-yellow-100 text-2xl absolute bottom-40 left-[20%] animate-pulse" style={{ animationDelay: '2s' }}></i>
      </div>
    </div>
  );
};

export default App;

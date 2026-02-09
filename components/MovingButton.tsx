
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ButtonPosition } from '../types';
import { audioService } from '../services/audio';

interface MovingButtonProps {
  onAttempt: () => void;
}

const MovingButton: React.FC<MovingButtonProps> = ({ onAttempt }) => {
  const [position, setPosition] = useState<ButtonPosition | null>(null);
  const [noCount, setNoCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isShrinking, setIsShrinking] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const funnyMessages = [
    "No",
    "Wait, what?",
    "Think of the puppy!",
    "Are you sure?",
    "Rude.",
    "Try again!",
    "Wrong button!",
    "Nope.",
    "Missed me!",
    "Catch me if you can!",
    "Ninja mode: ON",
    "404: Rejection Not Found",
    "I'm a shy button...",
    "Not even close!",
    "Ticklish! Stop it!",
    "Try the big red one!",
    "Loading... rejection failed",
    "You can't catch me!",
    "Click the other one!",
    "Too slow!",
    "Not today!",
    "Wheeeeee!",
    "Is that all you've got?",
    "Forbidden button!",
    "Error: Rejection blocked",
    "Why are you like this?",
    "Nice try, Einstein!",
    "I'm allergic to 'No'",
    "Keep dreaming!",
    "Denied with style",
    "Look! A distraction! ➡️"
  ];

  const moveButton = useCallback(() => {
    if (isAnimating || isShrinking) return;

    // Start shrink phase (anticipation) - using a very subtle scale to maintain high visibility
    setIsShrinking(true);
    audioService.playJingle();

    // Delay for the jump
    setTimeout(() => {
      const btnWidth = buttonRef.current?.offsetWidth || 140;
      const btnHeight = buttonRef.current?.offsetHeight || 60;
      
      // Strict padding to keep button well within viewport bounds
      const padding = 40;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Ensure min/max ranges are safe for calculations
      const minX = padding + btnWidth / 2;
      const maxX = Math.max(minX + 1, viewportWidth - padding - btnWidth / 2);
      const minY = padding + btnHeight / 2;
      const maxY = Math.max(minY + 1, viewportHeight - padding - btnHeight / 2);

      // Randomize position
      let x = Math.random() * (maxX - minX) + minX;
      let y = Math.random() * (maxY - minY) + minY;
      
      // Avoid the center where the Yes button grows (Scale 3 of Yes button is approx 420px wide)
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;
      const avoidRadius = 300; // Increased to ensure it never gets covered by the giant Yes button

      const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      if (distFromCenter < avoidRadius) {
        const angle = Math.atan2(y - centerY, x - centerX);
        x = centerX + Math.cos(angle) * (avoidRadius + 50);
        y = centerY + Math.sin(angle) * (avoidRadius + 50);
      }
      
      // Final clamping to viewport to guarantee it NEVER leaves the screen area
      x = Math.max(minX, Math.min(maxX, x));
      y = Math.max(minY, Math.min(maxY, y));

      setPosition({ x, y });
      setNoCount((prev) => (prev + 1) % funnyMessages.length);
      setIsShrinking(false);
      setIsAnimating(true);
      onAttempt();

      // Cooldown to prevent teleportation jitter
      setTimeout(() => {
        setIsAnimating(false);
      }, 250);
    }, 80);
  }, [onAttempt, funnyMessages.length, isAnimating, isShrinking]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current || isAnimating || isShrinking) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - buttonCenterX;
      const dy = e.clientY - buttonCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Trigger jump if mouse gets close (140px proximity)
      if (distance < 140) {
        moveButton();
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [moveButton, isAnimating, isShrinking]);

  return (
    <button
      ref={buttonRef}
      onMouseEnter={moveButton}
      onTouchStart={moveButton}
      className={`
        bg-pink-950 text-white px-10 py-4 rounded-full font-bold text-xl shadow-2xl
        border-2 border-pink-900 select-none transition-all duration-300 ease-out
        ${position ? 'fixed' : 'relative'}
        ${isShrinking ? 'scale-90' : isAnimating ? 'scale-110' : 'scale-100'}
        opacity-100 !opacity-100 hover:bg-black min-w-[140px] z-[9999999]
      `}
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              transform: 'translate(-50%, -50%)',
              visibility: 'visible',
              pointerEvents: 'auto'
            }
          : { visibility: 'visible', pointerEvents: 'auto' }
      }
    >
      <span className="flex items-center justify-center gap-2 whitespace-nowrap pointer-events-none">
        {funnyMessages[noCount]}
        {(noCount % 4 === 0 && noCount > 0) && <i className="fas fa-ghost animate-bounce text-sm"></i>}
      </span>
    </button>
  );
};

export default MovingButton;

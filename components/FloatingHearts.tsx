
import React, { useEffect, useState, useRef } from 'react';

interface Heart {
  id: number;
  left: number;
  size: number;
  duration: number;
  startTime: number;
}

const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const requestRef = useRef<number>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Convert to percentages for easier distance calculation relative to hearts
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newHeart: Heart = {
        id: Date.now(),
        left: Math.random() * 100,
        size: Math.random() * (30 - 10) + 10,
        duration: Math.random() * (10 - 5) + 5,
        startTime: Date.now(),
      };
      setHearts((prev) => [...prev.slice(-25), newHeart]);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  // Cleanup old hearts that have finished their animation
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setHearts(prev => prev.filter(h => now - h.startTime < h.duration * 1000));
    }, 2000);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => {
        const elapsed = Date.now() - heart.startTime;
        const progress = elapsed / (heart.duration * 1000);
        
        // Approximate current Y position (percentage from top)
        // Starts at 105% (bottom) and goes to -10% (top)
        const currentY = 105 - (progress * 115);
        const currentX = heart.left;

        // Calculate distance to mouse
        const dx = currentX - mousePos.x;
        const dy = currentY - mousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Repulsion effect
        let translateX = 0;
        let translateY = 0;
        const threshold = 15; // 15% of screen distance
        
        if (distance < threshold) {
          const power = (threshold - distance) / threshold;
          const force = power * 25; // Displacement strength
          translateX = (dx / distance) * force;
          translateY = (dy / distance) * force;
        }

        return (
          <i
            key={heart.id}
            className="fas fa-heart text-red-300 heart-particle opacity-60 transition-transform duration-300 ease-out"
            style={{
              left: `${heart.left}%`,
              fontSize: `${heart.size}px`,
              animationDuration: `${heart.duration}s`,
              transform: `translate(${translateX}px, ${translateY}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

export default FloatingHearts;

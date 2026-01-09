import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { loadAssets } from '../game/assets';

export default function GameCanvas({ onGameInit }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    loadAssets();
    
    if (canvasRef.current) {
      const engine = new GameEngine(canvasRef.current, (state) => {
        // Dispatch UI updates up to App
        onGameInit(engine); // Pass engine back for controls
      });
      
      engine.start();
      onGameInit(engine);

      return () => {
        engine.destroy();
      };
    }
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
}

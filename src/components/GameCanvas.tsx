import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { loadAssets } from '../game/assets';

type GameCanvasProps = {
  onGameInit: (engine: GameEngine) => void;
};

export default function GameCanvas({ onGameInit }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    loadAssets();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, () => {
      // Dispatch UI updates up to App
      onGameInit(engine); // Pass engine back for controls
    });

    engine.start();
    onGameInit(engine);

    return () => {
      engine.destroy();
    };
  }, [onGameInit]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
}

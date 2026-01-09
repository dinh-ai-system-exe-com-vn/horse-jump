import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import UI from './components/UI';

export default function App() {
  const [engine, setEngine] = useState(null);
  // We duplicate state in React for UI rendering only. 
  // The engine holds the source of truth for the loop.
  const [gameState, setGameState] = useState({
    score: 0,
    best: 0,
    gameOver: false,
    inMenu: true,
    showTrajectory: true
  });

  const handleGameInit = useCallback((eng) => {
    setEngine(eng);
    // Override the engine's UI callback to update React state
    eng.onUIUpdate = (state) => {
      setGameState({
        score: state.score,
        best: state.best,
        gameOver: state.gameOver,
        inMenu: state.inMenu,
        showTrajectory: state.showTrajectory
      });
    };
    // Initial sync
    eng.onUIUpdate(eng.state);
  }, []);

  const handleStart = () => engine?.startGame();
  const handleRestart = () => engine?.resetGame();

  // Input Listeners attached to Window/Document for global capture
  useEffect(() => {
    if (!engine) return;

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.code === "Space" || e.code === "ArrowUp") engine.press();
      
      // Menu/Game Over shortcuts
      if (engine.state.inMenu || engine.state.gameOver) {
        if (e.code === "Space" || e.code === "Enter") {
           if (engine.state.inMenu) handleStart();
           else handleRestart();
        }
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") engine.release();
    };
    const handleMouseDown = (e) => {
      // If clicking a button, don't jump (React handles button click)
      if (e.target.tagName === 'BUTTON') return;
      engine.press();
    };
    const handleMouseUp = () => engine.release();
    const handleTouchStart = (e) => {
       if (e.target.tagName === 'BUTTON') return;
       // Prevent default only if we are not on a button, to stop scrolling/zooming
       if (e.cancelable) e.preventDefault(); 
       engine.press();
    };
    const handleTouchEnd = (e) => {
       if (e.target.tagName === 'BUTTON') return;
       if (e.cancelable) e.preventDefault(); 
       engine.release();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [engine]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <GameCanvas onGameInit={handleGameInit} />
      <UI 
        gameState={gameState} 
        onStart={handleStart} 
        onRestart={handleRestart} 
        onToggleTrajectory={() => engine?.toggleTrajectory()}
      />
    </div>
  );
}

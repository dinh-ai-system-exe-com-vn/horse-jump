import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import UI from './components/UI';
import type { GameEngine } from './game/engine';
import type { GameState } from './game/state';
import { audioManager } from './game/audio';

type GameUIState = {
  score: number;
  best: number;
  deathCount: number;
  gameOver: boolean;
  inMenu: boolean;
  showTrajectory: boolean;
  horseSkin: string;
  wingsSkin: string;
  isMusicMuted: boolean;
};

export default function App() {
  const [engine, setEngine] = useState<GameEngine | null>(null);
  // We duplicate state in React for UI rendering only. 
  // The engine holds the source of truth for the loop.
  const [gameState, setGameState] = useState<GameUIState>({
    score: 0,
    best: 0,
    deathCount: 0,
    gameOver: false,
    inMenu: true,
    showTrajectory: true,
    horseSkin: localStorage.getItem('chargeJumpHorse') || 'default',
    wingsSkin: localStorage.getItem('chargeJumpWings') || 'default',
    isMusicMuted: audioManager.isMusicMuted,
  });

  const [showSettings, setShowSettings] = useState(false);

  const handleGameInit = useCallback((eng: GameEngine) => {
    setEngine(eng);
    // Override the engine's UI callback to update React state
    eng.onUIUpdate = (state: GameState) => {
      setGameState(prev => ({
        score: state.score,
        best: state.best,
        deathCount: state.deathCount,
        gameOver: state.gameOver,
        inMenu: state.inMenu,
        showTrajectory: state.showTrajectory,
        horseSkin: state.player.horseSkin,
        wingsSkin: state.player.wingsSkin,
        isMusicMuted: audioManager.isMusicMuted,
      }));
    };
    // Initial sync
    eng.onUIUpdate(eng.state);
  }, []);

  const handleStart = () => {
    engine?.startGame();
  };
  const handleRestart = () => engine?.resetGame();

  const handleToggleMusic = () => {
    const isMuted = audioManager.toggleMusic();
    setGameState(prev => ({ ...prev, isMusicMuted: isMuted }));
  };

  const handleSkinChange = (type: 'horse' | 'wings', skinId: string) => {
    if (!engine) return;
    if (type === 'horse') {
      engine.state.player.horseSkin = skinId;
      localStorage.setItem('chargeJumpHorse', skinId);
    } else {
      engine.state.player.wingsSkin = skinId;
      localStorage.setItem('chargeJumpWings', skinId);
    }
    // Trigger a sync
    engine.onUIUpdate(engine.state);
  };

  // Input Listeners attached to Window/Document for global capture
  useEffect(() => {
    if (!engine) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettings) return;
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
    const handleKeyUp = (e: KeyboardEvent) => {
      if (showSettings) return;
      if (e.code === "Space" || e.code === "ArrowUp") engine.release();
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (showSettings) return;
      // If clicking a button, don't jump (React handles button click)
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'LABEL')) return;
      engine.press();
    };
    const handleMouseUp = () => {
      if (showSettings) return;
      engine.release();
    };
    const handleTouchStart = (e: TouchEvent) => {
      if (showSettings) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'LABEL')) return;
      // Prevent default only if we are not on a button, to stop scrolling/zooming
      if (e.cancelable) e.preventDefault();
      engine.press();
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (showSettings) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'LABEL')) return;
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
  }, [engine, showSettings]);

  return (
    <div
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <GameCanvas onGameInit={handleGameInit} />
      <UI
        gameState={gameState}
        onStart={handleStart}
        onRestart={handleRestart}
        onToggleTrajectory={() => engine?.toggleTrajectory()}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onSkinChange={handleSkinChange}
        onToggleMusic={handleToggleMusic}
      />
    </div>
  );
}

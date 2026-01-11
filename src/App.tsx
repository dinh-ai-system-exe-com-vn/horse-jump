import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import UI from './components/UI';
import Leaderboard from './components/Leaderboard';
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleGameInit = useCallback((eng: GameEngine) => {
    setEngine(eng);
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
    engine.onUIUpdate(engine.state);
  };

  const handleSaveScore = (playerName: string) => {
    engine?.state.saveScoreToFirebase(playerName);
    setShowLeaderboard(true);
  };

  // Input Listeners
  useEffect(() => {
    if (!engine) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettings || showLeaderboard) return;
      if (e.repeat) return;
      if (e.code === "Space" || e.code === "ArrowUp") engine.press();

      if (engine.state.inMenu || engine.state.gameOver) {
        if (e.code === "Space" || e.code === "Enter") {
          if (engine.state.inMenu) handleStart();
          else handleRestart();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (showSettings || showLeaderboard) return;
      if (e.code === "Space" || e.code === "ArrowUp") engine.release();
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (showSettings || showLeaderboard) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'LABEL' || target.tagName === 'svg' || target.tagName === 'path')) return;
      engine.press();
    };
    const handleMouseUp = () => {
      if (showSettings || showLeaderboard) return;
      engine.release();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [engine, showSettings, showLeaderboard]);

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
        onSaveScore={handleSaveScore}
        onShowLeaderboard={() => setShowLeaderboard(true)}
      />
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}

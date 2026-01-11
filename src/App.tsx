import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import UI from './components/UI';
import Leaderboard from './components/Leaderboard';
import type { GameEngine } from './game/engine';
import type { GameState } from './game/state';
import { audioManager } from './game/audio';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { ref, query, orderByChild, limitToLast, onValue } from 'firebase/database';
import { auth, googleProvider, database } from './firebase';

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
  globalBest: number;
};

export default function App() {
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState(localStorage.getItem('playerName') || "");

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
    globalBest: 0,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [language, setLanguage] = useState<'vi' | 'en'>((localStorage.getItem('language') as 'vi' | 'en') || 'vi');

  const handleLanguageChange = (lang: 'vi' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    // Check for redirect result
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        console.log("Logged in via redirect successfully:", result.user.displayName);
      }
    }).catch((error) => {
      console.error("Redirect Auth Error:", error.code, error.message);
    });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        console.log("Auth State Changed: User Logged In", u.uid);
        // If no local nickname, use display name
        if (!localStorage.getItem('playerName')) {
          setNickname(u.displayName || "");
          localStorage.setItem('playerName', u.displayName || "");
        }
      } else {
        console.log("Auth State Changed: User Logged Out");
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Global Best
  useEffect(() => {
    const scoresRef = ref(database, 'scores');
    const bestQuery = query(scoresRef, orderByChild('score'), limitToLast(1));
    const unsubscribe = onValue(bestQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const topScore = Object.values(data)[0] as any;
        setGameState(prev => ({ ...prev, globalBest: topScore.score }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    console.log("Login button clicked. Attempting login...");
    try {
      // Try popup first
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Popup login success:", result.user.displayName);
    } catch (error: any) {
      console.warn("Popup login failed or blocked:", error.code, error.message);

      if (error.code === 'auth/popup-blocked' ||
        error.code === 'auth/operation-not-supported-in-this-environment' ||
        error.code === 'auth/auth-domain-config-required') {
        console.log("Attempting Redirect login as fallback...");
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError: any) {
          console.error("Redirect login also failed:", redirectError.message);
          // alert("Không thể mở cửa sổ đăng nhập. Hãy kiểm tra cài đặt chặn pop-up của trình duyệt hoặc cấu hình Firebase.");
        }
      } else {
        // alert("Lỗi đăng nhập: " + error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleUpdateNickname = (newNickname: string) => {
    setNickname(newNickname);
    localStorage.setItem('playerName', newNickname);
  };

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
        globalBest: prev.globalBest, // Keep global best from Firebase
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
    if (user) {
      engine?.state.saveScoreToFirebase(playerName, user.uid);
      setShowLeaderboard(true);
    } else {
      handleLogin();
    }
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
          const target = document.activeElement;
          if (target && target.tagName === 'INPUT') return; // Don't trigger game start if typing

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

    const handleTouchStart = (e: TouchEvent) => {
      if (showSettings || showLeaderboard) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'LABEL' || target.tagName === 'svg' || target.tagName === 'path')) return;

      if (e.cancelable) e.preventDefault();
      engine.press();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (showSettings || showLeaderboard) return;
      engine.release();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [engine, showSettings, showLeaderboard]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <GameCanvas onGameInit={handleGameInit} />
      <UI
        gameState={gameState}
        user={user}
        nickname={nickname}
        onUpdateNickname={handleUpdateNickname}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onStart={handleStart}
        onRestart={handleRestart}
        onToggleTrajectory={() => engine?.toggleTrajectory()}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onSkinChange={handleSkinChange}
        onToggleMusic={handleToggleMusic}
        onSaveScore={handleSaveScore}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} language={language} />}
    </div>
  );
}

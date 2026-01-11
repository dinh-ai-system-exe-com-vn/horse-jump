import React, { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { CONSTANTS, type SkinDefinition } from '../game/constants';
import { assets } from '../game/assets';

type SkinType = 'horse' | 'wings';

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

type CharacterPreviewProps = {
  horseSkin: string;
  wingsSkin: string;
};

const CharacterPreview = ({ horseSkin, wingsSkin }: CharacterPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 + 5;
      const horseAsset = assets.horses[horseSkin] || assets.horses['default'];
      const wingsAsset = assets.wings[wingsSkin] || assets.wings['default'];

      ctx.save();
      ctx.translate(centerX, centerY);

      const floatY = Math.sin(time * 0.005) * 3;
      ctx.translate(0, floatY);

      if (wingsAsset && wingsAsset.complete && wingsAsset.naturalWidth > 0) {
        ctx.save();
        ctx.translate(-15, -12);
        const flapAngle = Math.sin(time * 0.01) * 0.4;
        ctx.rotate(flapAngle - 0.1);
        ctx.drawImage(wingsAsset, -15, -10, 30, 20);
        ctx.restore();
      }

      if (horseAsset && horseAsset.complete && horseAsset.naturalWidth > 0) {
        ctx.drawImage(horseAsset, -24, -24, 48, 48);
      }

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [horseSkin, wingsSkin]);

  return (
    <div style={styles.previewBox}>
      <canvas
        ref={canvasRef}
        width={100}
        height={100}
        style={styles.previewCanvas}
      />
      <div style={styles.previewLabel}>Xem trước</div>
    </div>
  );
};

type UIProps = {
  gameState: GameUIState;
  onStart: () => void;
  onRestart: () => void;
  onToggleTrajectory: () => void;
  showSettings: boolean;
  onToggleSettings: () => void;
  onSkinChange: (type: SkinType, skinId: string) => void;
  onToggleMusic: () => void;
  onSaveScore: (playerName: string) => void;
  onShowLeaderboard: () => void;
};

const IconButton = ({ children, onClick, title, active = true }: { children: React.ReactNode, onClick: () => void, title?: string, active?: boolean }) => (
  <button
    style={{
      ...styles.settingsBtn,
      position: 'static',
      background: active
        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(139, 92, 246, 0.9))'
        : 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      border: active ? '3px solid #a5b4fc' : '3px solid #475569',
      boxShadow: active
        ? '0 8px 20px rgba(139, 92, 246, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2)'
        : '0 4px 10px rgba(0, 0, 0, 0.3)',
      color: active ? '#ffffff' : '#94a3b8',
      transform: 'scale(1)',
      transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    }}
    onClick={onClick}
    title={title}
  >
    {children}
  </button>
);

const Icons = {
  Volume: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  ),
  Mute: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2V15H6L11 19V5Z"></path>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>
  ),
  Settings: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  Trophy: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  )
};

export default function UI({
  gameState,
  onStart,
  onRestart,
  onToggleTrajectory,
  showSettings,
  onToggleSettings,
  onSkinChange,
  onToggleMusic,
  onSaveScore,
  onShowLeaderboard
}: UIProps) {
  const { score, best, deathCount, gameOver, inMenu, showTrajectory, horseSkin, wingsSkin, isMusicMuted } = gameState;
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || "");
  const [hasSaved, setHasSaved] = useState(false);

  const handleSaveScore = () => {
    if (playerName.trim() !== "" && !hasSaved) {
      localStorage.setItem('playerName', playerName.trim());
      onSaveScore(playerName.trim());
      setHasSaved(true);
    }
  };

  useEffect(() => {
    if (gameOver) {
      setHasSaved(false);
    }
  }, [gameOver]);

  const SkinSelector = ({
    type,
    current,
    skins,
    onChange
  }: {
    type: SkinType;
    current: string;
    skins: SkinDefinition[];
    onChange: (type: SkinType, skinId: string) => void;
  }) => (
    <div style={styles.skinGroup}>
      <h3 style={styles.skinLabel}>{type === 'horse' ? 'Chọn Ngựa' : 'Chọn Cánh'}</h3>
      <div style={styles.skinList}>
        {skins.map(skin => (
          <div
            key={skin.id}
            style={{
              ...styles.skinItem,
              borderColor: current === skin.id ? '#a78bfa' : '#334155',
              backgroundColor: current === skin.id ? 'rgba(139, 92, 246, 0.3)' : 'rgba(30, 41, 59, 0.5)',
              transform: current === skin.id ? 'scale(1.05)' : 'scale(1)',
            }}
            onClick={() => onChange(type, skin.id)}
          >
            {skin.name}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {inMenu && (
        <div style={styles.overlay}>
          <h1 style={styles.title}>NGỰA CHIẾN</h1>
          <p style={styles.subText}>Số lần tử trận: {deathCount}</p>

          <CharacterPreview horseSkin={horseSkin} wingsSkin={wingsSkin} />

          <div style={styles.selectionContainer}>
            <SkinSelector
              type="horse"
              current={horseSkin}
              skins={CONSTANTS.HORSE_SKINS}
              onChange={onSkinChange}
            />
            <SkinSelector
              type="wings"
              current={wingsSkin}
              skins={CONSTANTS.WINGS_SKINS}
              onChange={onSkinChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button style={styles.button} onClick={onStart}>BẮT ĐẦU</button>
            <button 
              style={{ ...styles.button, background: 'linear-gradient(to bottom, #f59e0b, #d97706)' }} 
              onClick={onShowLeaderboard}
            >
              Hạng
            </button>
          </div>
          <p style={styles.hint}>Giữ chuột/màn hình để nạp lực nhảy.</p>
        </div>
      )}

      {gameOver && (
        <div style={styles.overlay}>
          <h1 style={{ ...styles.title, color: '#f87171' }}>GAME OVER</h1>
          <p style={styles.scoreText}>Điểm: {score}</p>
          <p style={styles.subText}>Kỷ lục: {best}</p>
          
          <div style={styles.saveContainer}>
            <input
              type="text"
              placeholder="Nhập tên của bạn"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              style={styles.input}
              maxLength={15}
            />
            <button 
              style={{ 
                ...styles.miniButton, 
                opacity: (hasSaved || playerName.trim() === "") ? 0.5 : 1,
                cursor: (hasSaved || playerName.trim() === "") ? 'default' : 'pointer'
              }} 
              onClick={handleSaveScore}
              disabled={hasSaved || playerName.trim() === ""}
            >
              {hasSaved ? 'Đã lưu' : 'Lưu điểm'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button style={styles.button} onClick={onRestart}>CHƠI LẠI</button>
            <button 
              style={{ ...styles.button, background: 'linear-gradient(to bottom, #f59e0b, #d97706)' }} 
              onClick={onShowLeaderboard}
            >
              BXH
            </button>
          </div>
        </div>
      )}

      {!inMenu && !gameOver && (
        <div style={styles.hud}>
          Score: {score} &nbsp; Best: {best}
        </div>
      )}

      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '12px', zIndex: 100 }}>
        <IconButton onClick={onShowLeaderboard} title="Bảng xếp hạng">
          <Icons.Trophy />
        </IconButton>
        <IconButton
          onClick={onToggleMusic}
          title={isMusicMuted ? "Bật nhạc" : "Tắt nhạc"}
          active={!isMusicMuted}
        >
          {isMusicMuted ? <Icons.Mute /> : <Icons.Volume />}
        </IconButton>
        <IconButton
          onClick={onToggleSettings}
          title="Cài đặt"
          active={showSettings}
        >
          <Icons.Settings />
        </IconButton>
      </div>

      {showSettings && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Cài Đặt</span>
              <button style={styles.closeBtn} onClick={onToggleSettings}>✖</button>
            </div>
            <div style={styles.modalBody}>
              <CharacterPreview horseSkin={horseSkin} wingsSkin={wingsSkin} />
              <div style={{ width: '100%', marginBottom: '20px' }}>
                <SkinSelector type="horse" current={horseSkin} skins={CONSTANTS.HORSE_SKINS} onChange={onSkinChange} />
                <SkinSelector type="wings" current={wingsSkin} skins={CONSTANTS.WINGS_SKINS} onChange={onSkinChange} />
              </div>
              <label style={{ ...styles.label, marginBottom: '12px' }}>
                <input type="checkbox" checked={showTrajectory} onChange={onToggleTrajectory} style={styles.checkbox} />
                Hiện đường kẻ dự đoán
              </label>
              <label style={styles.label}>
                <input type="checkbox" checked={!isMusicMuted} onChange={onToggleMusic} style={styles.checkbox} />
                Nhạc nền: {isMusicMuted ? 'Tắt' : 'Bật'}
              </label>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(11, 15, 23, 0.8)',
    color: 'white',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    zIndex: 10,
    backdropFilter: 'blur(8px)',
  },
  hud: {
    position: 'absolute',
    top: 20, left: 20,
    color: '#fff',
    fontSize: '24px',
    fontWeight: '800',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    pointerEvents: 'none',
    zIndex: 10,
    textShadow: '2px 2px 0 #000',
  },
  title: {
    fontSize: '64px',
    fontWeight: '900',
    marginBottom: '20px',
    textShadow: '4px 4px 0 #1e1b4b, 0 0 20px rgba(139, 92, 246, 0.5)',
    textAlign: 'center',
    color: '#ddd6fe',
  },
  button: {
    padding: '12px 32px',
    fontSize: '20px',
    fontWeight: '900',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    background: 'linear-gradient(to bottom, #8b5cf6, #6d28d9)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #4c1d95',
    transition: 'transform 0.1s',
    textTransform: 'uppercase',
  },
  miniButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    background: '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  saveContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    background: 'rgba(30, 41, 59, 0.5)',
    padding: '10px',
    borderRadius: '20px',
    border: '1px solid #4338ca',
  },
  input: {
    padding: '10px 15px',
    fontSize: '16px',
    background: 'transparent',
    color: 'white',
    border: 'none',
    outline: 'none',
    width: '150px',
    textAlign: 'center',
  },
  hint: {
    color: '#a5b4fc',
    marginTop: '20px',
    fontSize: '16px',
  },
  scoreText: {
    fontSize: '48px',
    margin: '10px 0',
    fontWeight: 'bold',
    color: '#fff',
  },
  subText: {
    color: '#94a3b8',
    fontSize: '20px',
    marginBottom: '20px',
  },
  selectionContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  skinGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  skinLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#a5b4fc',
    textTransform: 'uppercase',
  },
  skinList: {
    display: 'flex',
    gap: '8px',
  },
  skinItem: {
    padding: '6px 10px',
    borderRadius: '10px',
    border: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#fff',
    transition: 'all 0.2s',
  },
  previewBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '15px',
    padding: '10px',
    background: 'rgba(30, 41, 59, 0.6)',
    borderRadius: '25px',
    border: '2px solid rgba(139, 92, 246, 0.4)',
    width: '110px',
    height: '110px',
    justifyContent: 'center',
  },
  previewCanvas: {
    filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))',
  },
  previewLabel: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#818cf8',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  settingsBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(30, 41, 59, 0.8)',
    border: '2px solid #6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    transition: 'transform 0.1s',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  modal: {
    width: '400px',
    maxWidth: '90vw',
    backgroundColor: '#1e1b4b',
    borderRadius: '32px',
    border: '4px solid #4338ca',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#ddd6fe',
    textTransform: 'uppercase',
  },
  closeBtn: {
    background: '#312e81',
    border: '2px solid #6366f1',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    color: '#fff',
    cursor: 'pointer',
  },
  modalBody: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#ddd6fe',
    background: '#312e81',
    padding: '12px 15px',
    borderRadius: '15px',
    width: '100%',
    marginBottom: '10px',
    boxSizing: 'border-box',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginRight: '12px',
  }
};

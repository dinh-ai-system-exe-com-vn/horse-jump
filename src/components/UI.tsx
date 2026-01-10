import React, { useEffect, useRef } from 'react';
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

      // Floating animation
      const floatY = Math.sin(time * 0.005) * 3;
      ctx.translate(0, floatY);

      // Draw Wings (if loaded)
      if (wingsAsset && wingsAsset.complete && wingsAsset.naturalWidth > 0) {
        ctx.save();
        ctx.translate(-15, -12);
        const flapAngle = Math.sin(time * 0.01) * 0.4;
        ctx.rotate(flapAngle - 0.1);
        ctx.drawImage(wingsAsset, -15, -10, 30, 20);
        ctx.restore();
      }

      // Draw Horse (if loaded)
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
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.1)';
      if (!active) e.currentTarget.style.borderColor = '#6366f1';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      if (!active) e.currentTarget.style.borderColor = '#475569';
    }}
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
};

export default function UI({
  gameState,
  onStart,
  onRestart,
  onToggleTrajectory,
  showSettings,
  onToggleSettings,
  onSkinChange,
  onToggleMusic
}: UIProps) {
  const { score, best, deathCount, gameOver, inMenu, showTrajectory, horseSkin, wingsSkin, isMusicMuted } = gameState;

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
      {/* HUD & Overlays */}
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

          <button style={styles.button} onClick={onStart}>BẮT ĐẦU</button>
          <p style={styles.hint}>Giữ chuột/màn hình để nạp lực nhảy.</p>
        </div>
      )}

      {gameOver && (
        <div style={styles.overlay}>
          <h1 style={{ ...styles.title, color: '#f87171' }}>GAME OVER</h1>
          <p style={styles.scoreText}>Điểm: {score}</p>
          <p style={styles.subText}>Kỷ lục: {best}</p>
          <p style={styles.subText}>Tổng số lần chết: {deathCount}</p>
          <button style={styles.button} onClick={onRestart}>CHƠI LẠI</button>
        </div>
      )}

      {!inMenu && !gameOver && (
        <div style={styles.hud}>
          Score: {score} &nbsp; Best: {best} &nbsp; <span style={{ fontSize: '16px', opacity: 0.7 }}>Deaths: {deathCount}</span>
        </div>
      )}

      {/* Settings & Music Buttons */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '12px', zIndex: 100 }}>
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

      {/* Settings Modal */}
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

              <label style={{ ...styles.label, marginBottom: '12px' }} htmlFor="trajectory-checkbox">
                <input
                  id="trajectory-checkbox"
                  type="checkbox"
                  checked={showTrajectory}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleTrajectory();
                  }}
                  style={styles.checkbox}
                />
                Hiện đường kẻ dự đoán
              </label>

              <label style={styles.label} htmlFor="music-checkbox">
                <input
                  id="music-checkbox"
                  type="checkbox"
                  checked={!isMusicMuted}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleMusic();
                  }}
                  style={styles.checkbox}
                />
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
    backgroundColor: 'rgba(11, 15, 23, 0.75)', // Match game BG
    color: 'white',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    zIndex: 10,
    backdropFilter: 'blur(6px)',
  },
  hud: {
    position: 'absolute',
    top: 20, left: 20,
    color: '#fff',
    fontSize: '20px',
    fontWeight: '800',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    pointerEvents: 'none',
    zIndex: 10,
    textShadow: '2px 2px 0 #000',
  },
  title: {
    fontSize: '64px',
    fontWeight: '900',
    marginBottom: '30px',
    textShadow: '4px 4px 0 #1e1b4b, 0 0 20px rgba(139, 92, 246, 0.5)',
    letterSpacing: '2px',
    textAlign: 'center',
    color: '#ddd6fe', // Soft Lavender
  },
  button: {
    padding: '16px 48px',
    fontSize: '28px',
    fontWeight: '900',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    background: 'linear-gradient(to bottom, #8b5cf6, #6d28d9)', // Purple
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    marginBottom: '20px',
    boxShadow: '0 6px 0 #4c1d95, 0 10px 15px rgba(0,0,0,0.4)',
    transition: 'transform 0.1s, box-shadow 0.1s',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  hint: {
    color: '#a5b4fc',
    marginTop: '20px',
    fontSize: '18px',
    fontWeight: '500',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
  },
  scoreText: {
    fontSize: '36px',
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
    width: '90%',
    maxWidth: '600px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  skinGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  skinLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#a5b4fc',
    margin: '0',
    textTransform: 'uppercase',
  },
  skinList: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  skinItem: {
    padding: '8px 12px',
    borderRadius: '12px',
    border: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
    transition: 'all 0.2s',
    userSelect: 'none',
    textAlign: 'center',
    flex: '1 1 auto',
    minWidth: '80px',
  },
  previewBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '16px',
    background: 'rgba(30, 41, 59, 0.6)',
    borderRadius: '32px',
    border: '3px solid rgba(139, 92, 246, 0.4)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    width: '140px',
    height: '140px',
    justifyContent: 'center',
  },
  previewCanvas: {
    filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))',
  },
  previewLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#818cf8',
    textTransform: 'uppercase',
    marginTop: '5px',
    letterSpacing: '1px',
  },
  // Settings Button
  settingsBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(30, 41, 59, 0.8)', // Dark Slate
    border: '3px solid #6366f1', // Indigo
    fontSize: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #4338ca, 0 4px 10px rgba(0,0,0,0.3)',
    zIndex: 20,
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
    width: '420px',
    maxWidth: '90vw',
    backgroundColor: '#1e1b4b', // Deep Indigo
    borderRadius: '32px',
    border: '4px solid #4338ca',
    padding: '24px',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(99, 102, 241, 0.2)',
    animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '-10px',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#ddd6fe',
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textAlign: 'center',
    width: '100%',
    textShadow: '0 0 10px rgba(139, 92, 246, 0.4)',
  },
  closeBtn: {
    background: '#312e81',
    border: '2px solid #6366f1',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 0 #4338ca',
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
    fontSize: '18px',
    fontWeight: '600',
    color: '#ddd6fe',
    background: '#312e81',
    padding: '16px 20px',
    borderRadius: '20px',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 4px 0 #1e1b4b',
    transition: 'transform 0.1s',
  },
  checkbox: {
    width: '24px',
    height: '24px',
    marginRight: '16px',
    cursor: 'pointer',
    accentColor: '#8b5cf6',
  },
  // Chibi Face (Dark Mode)
  chibiFace: {
    width: '80px',
    height: '80px',
    backgroundColor: '#312e81',
    borderRadius: '50%',
    position: 'relative',
    marginBottom: '24px',
    border: '4px solid #4338ca',
    boxShadow: '0 4px 0 #1e1b4b, 0 0 15px rgba(99, 102, 241, 0.3)',
  },
  eyeLeft: {
    position: 'absolute',
    top: '30px', left: '18px',
    width: '10px', height: '14px',
    backgroundColor: '#ddd6fe',
    borderRadius: '50%',
  },
  eyeRight: {
    position: 'absolute',
    top: '30px', right: '18px',
    width: '10px', height: '14px',
    backgroundColor: '#ddd6fe',
    borderRadius: '50%',
  },
  mouth: {
    position: 'absolute',
    bottom: '20px', left: '30px',
    width: '20px', height: '10px',
    borderBottom: '4px solid #ddd6fe',
    borderRadius: '0 0 50% 50%',
  }
};

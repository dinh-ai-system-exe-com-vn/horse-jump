import React from 'react';

export default function UI({ gameState, onStart, onRestart, onToggleTrajectory, showSettings, onToggleSettings }) {
  const { score, best, gameOver, inMenu, showTrajectory } = gameState;

  return (
    <>
      {/* HUD & Overlays */}
      {inMenu && (
        <div style={styles.overlay}>
          <h1 style={styles.title}>NGỰA CHIẾN</h1>
          <button style={styles.button} onClick={onStart}>BẮT ĐẦU</button>
          <p style={styles.hint}>Giữ chuột/màn hình để nạp lực nhảy.</p>
        </div>
      )}

      {gameOver && (
        <div style={styles.overlay}>
          <h1 style={{...styles.title, color: '#ef4444'}}>GAME OVER</h1>
          <p style={styles.scoreText}>Điểm: {score}</p>
          <p style={styles.subText}>Kỷ lục: {best}</p>
          <button style={styles.button} onClick={onRestart}>CHƠI LẠI</button>
        </div>
      )}

      {!inMenu && !gameOver && (
        <div style={styles.hud}>
          Score: {score} &nbsp; Best: {best}
        </div>
      )}

      {/* Settings Button (Chibi Style) */}
      <button style={styles.settingsBtn} onClick={onToggleSettings}>
        ⚙️
      </button>

      {/* Settings Modal (Chibi Style) */}
      {showSettings && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Cài Đặt</span>
              <button style={styles.closeBtn} onClick={onToggleSettings}>✖</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.chibiFace}>
                <div style={styles.eyeLeft}></div>
                <div style={styles.eyeRight}></div>
                <div style={styles.mouth}></div>
              </div>
              <label style={styles.label}>
                <input 
                  type="checkbox" 
                  checked={showTrajectory} 
                  onChange={onToggleTrajectory} 
                  style={styles.checkbox}
                />
                Hiện đường kẻ dự đoán
              </label>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  overlay: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    fontFamily: 'system-ui, sans-serif',
    zIndex: 10,
    backdropFilter: 'blur(4px)',
  },
  hud: {
    position: 'absolute',
    top: 20, left: 20,
    color: '#fff',
    fontSize: '20px',
    fontWeight: '800',
    fontFamily: 'system-ui, sans-serif',
    pointerEvents: 'none',
    zIndex: 10,
    textShadow: '2px 2px 0 #000',
  },
  title: {
    fontSize: '64px',
    fontWeight: '900',
    marginBottom: '30px',
    textShadow: '4px 4px 0 #000, -2px -2px 0 #4c1d95',
    letterSpacing: '2px',
    textAlign: 'center',
  },
  button: {
    padding: '16px 48px',
    fontSize: '28px',
    fontWeight: '900',
    background: 'linear-gradient(to bottom, #60a5fa, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    marginBottom: '20px',
    boxShadow: '0 6px 0 #1e40af, 0 10px 10px rgba(0,0,0,0.3)',
    transition: 'transform 0.1s, box-shadow 0.1s',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  hint: {
    color: '#e2e8f0',
    marginTop: '20px',
    fontSize: '18px',
    fontWeight: '500',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
  },
  scoreText: {
    fontSize: '36px',
    margin: '10px 0',
    fontWeight: 'bold',
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
  },
  subText: {
    color: '#d1d5db',
    fontSize: '20px',
    marginBottom: '20px',
  },
  // Settings Styles
  settingsBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#fff', 
    border: '4px solid #f9a8d4', // Soft Pink
    fontSize: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #f472b6, 0 4px 10px rgba(0,0,0,0.1)',
    zIndex: 20,
    transition: 'transform 0.1s',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  modal: {
    width: '320px',
    backgroundColor: '#fff0f5', // Lavender Blush
    borderRadius: '32px',
    border: '6px solid #fbcfe8',
    padding: '24px',
    fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
    animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '-20px',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#db2777',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textAlign: 'center',
    width: '100%',
  },
  closeBtn: {
    background: '#fff',
    border: '3px solid #f9a8d4',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#db2777',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 0 #f472b6',
  },
  modalBody: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '10px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '600',
    color: '#831843',
    background: '#fff',
    padding: '16px 20px',
    borderRadius: '20px',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 4px 0 #e5e7eb',
    transition: 'transform 0.1s',
  },
  checkbox: {
    width: '24px',
    height: '24px',
    marginRight: '16px',
    cursor: 'pointer',
    accentColor: '#db2777',
  },
  // Chibi Face CSS (Polished)
  chibiFace: {
    width: '80px',
    height: '80px',
    backgroundColor: '#ffe4e6',
    borderRadius: '50%',
    position: 'relative',
    marginBottom: '24px',
    border: '4px solid #fff',
    boxShadow: '0 4px 0 #fda4af',
  },
  eyeLeft: {
    position: 'absolute',
    top: '30px', left: '18px',
    width: '10px', height: '14px',
    backgroundColor: '#881337',
    borderRadius: '50%',
  },
  eyeRight: {
    position: 'absolute',
    top: '30px', right: '18px',
    width: '10px', height: '14px',
    backgroundColor: '#881337',
    borderRadius: '50%',
  },
  mouth: {
    position: 'absolute',
    bottom: '20px', left: '30px',
    width: '20px', height: '10px',
    borderBottom: '4px solid #881337',
    borderRadius: '0 0 50% 50%',
  }
};


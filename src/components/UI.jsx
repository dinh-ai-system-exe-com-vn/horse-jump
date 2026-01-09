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
  },
  hud: {
    position: 'absolute',
    top: 20, left: 20,
    color: '#e5e7eb',
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: 'system-ui, sans-serif',
    pointerEvents: 'none',
    zIndex: 10,
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  button: {
    padding: '15px 40px',
    fontSize: '24px',
    fontWeight: 'bold',
    backgroundColor: '#2563eb',
    color: 'white',
    border: '4px solid #60a5fa',
    borderRadius: '12px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  hint: {
    color: '#cbd5e1',
    marginTop: '20px',
  },
  scoreText: {
    fontSize: '32px',
    margin: '10px 0',
  },
  subText: {
    color: '#9ca3af',
    fontSize: '18px',
  },
  // Settings Styles
  settingsBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#fbcfe8', // Pink
    border: '3px solid #fff',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #f472b6',
    zIndex: 20,
    transition: 'transform 0.1s',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  modal: {
    width: '300px',
    backgroundColor: '#fff',
    borderRadius: '25px',
    border: '5px solid #fbcfe8',
    padding: '20px',
    fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#be185d',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#be185d',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#333',
    background: '#f0f9ff',
    padding: '10px 20px',
    borderRadius: '15px',
    width: '100%',
    boxSizing: 'border-box',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginRight: '10px',
    cursor: 'pointer',
    accentColor: '#db2777',
  },
  // Chibi Face CSS
  chibiFace: {
    width: '60px',
    height: '60px',
    backgroundColor: '#fbcfe8',
    borderRadius: '50%',
    position: 'relative',
    marginBottom: '20px',
    border: '3px solid #fff',
    boxShadow: '0 3px 0 #f472b6',
  },
  eyeLeft: {
    position: 'absolute',
    top: '20px', left: '12px',
    width: '8px', height: '12px',
    backgroundColor: '#333',
    borderRadius: '50%',
  },
  eyeRight: {
    position: 'absolute',
    top: '20px', right: '12px',
    width: '8px', height: '12px',
    backgroundColor: '#333',
    borderRadius: '50%',
  },
  mouth: {
    position: 'absolute',
    bottom: '12px', left: '22px',
    width: '16px', height: '8px',
    borderBottom: '3px solid #333',
    borderRadius: '0 0 50% 50%',
  }
};


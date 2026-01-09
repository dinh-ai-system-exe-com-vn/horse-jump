import React from 'react';

export default function UI({ gameState, onStart, onRestart }) {
  const { score, best, gameOver, inMenu } = gameState;

  if (inMenu) {
    return (
      <div style={styles.overlay}>
        <h1 style={styles.title}>NGỰA CHIẾN</h1>
        <button style={styles.button} onClick={onStart}>BẮT ĐẦU</button>
        <p style={styles.hint}>Giữ chuột/màn hình để nạp lực nhảy.</p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div style={styles.overlay}>
        <h1 style={{...styles.title, color: '#ef4444'}}>GAME OVER</h1>
        <p style={styles.scoreText}>Điểm: {score}</p>
        <p style={styles.subText}>Kỷ lục: {best}</p>
        <button style={styles.button} onClick={onRestart}>CHƠI LẠI</button>
      </div>
    );
  }

  return (
    <div style={styles.hud}>
      Score: {score} &nbsp; Best: {best}
    </div>
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
  }
};

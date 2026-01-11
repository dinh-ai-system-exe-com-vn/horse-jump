import React, { useEffect, useState, type CSSProperties } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '../firebase';

type Score = {
  name: string;
  score: number;
  createdAt: string;
};

type LeaderboardProps = {
  onClose: () => void;
};

const Leaderboard = ({ onClose }: LeaderboardProps) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scoresRef = ref(database, 'scores');
    const scoresQuery = query(scoresRef, orderByChild('score'), limitToLast(10));

    const unsubscribe = onValue(scoresQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedScores = Object.values(data)
          .sort((a: any, b: any) => b.score - a.score)
          .map((score: any) => score as Score);
        setScores(sortedScores);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>Bảng Xếp Hạng</span>
          <button style={styles.closeBtn} onClick={onClose}>✖</button>
        </div>
        <div style={styles.modalBody}>
          {loading ? (
            <p style={styles.statusText}>Đang tải...</p>
          ) : scores.length === 0 ? (
            <p style={styles.statusText}>Chưa có kỷ lục nào.</p>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Hạng</th>
                    <th style={styles.th}>Người chơi</th>
                    <th style={styles.th}>Điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, index) => (
                    <tr key={index} style={index === 0 ? styles.topRow : styles.row}>
                      <td style={styles.td}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </td>
                      <td style={styles.td}>{score.name}</td>
                      <td style={styles.tdScore}>{score.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, CSSProperties> = {
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  modal: {
    width: '480px',
    maxWidth: '90vw',
    backgroundColor: '#1e1b4b', // Deep Indigo
    borderRadius: '32px',
    border: '4px solid #4338ca',
    padding: '24px',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(99, 102, 241, 0.2)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#ddd6fe',
    textTransform: 'uppercase',
    letterSpacing: '1px',
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
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  statusText: {
    color: '#a5b4fc',
    textAlign: 'center',
    fontSize: '18px',
    margin: '20px 0',
  },
  tableContainer: {
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    color: '#fff',
  },
  tableHeaderRow: {
    borderBottom: '2px solid #4338ca',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    color: '#a5b4fc',
    fontSize: '14px',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  row: {
    borderBottom: '1px solid rgba(67, 56, 202, 0.3)',
  },
  topRow: {
    borderBottom: '1px solid rgba(67, 56, 202, 0.3)',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  td: {
    padding: '14px 12px',
    fontSize: '16px',
  },
  tdScore: {
    padding: '14px 12px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fcd34d',
    textAlign: 'right',
  }
};

export default Leaderboard;

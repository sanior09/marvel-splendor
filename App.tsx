export default function App() {
  return (
    <div style={{
      backgroundColor: '#0b0f19',
      color: '#f8fafc',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: 'flex',
      height: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(10px)',
        padding: '2.5rem',
        borderRadius: '1rem',
        boxShadow: '0 0 30px rgba(56, 189, 248, 0.15)',
        maxWidth: '450px',
        width: '100%',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
        <div style={{
          display: 'inline-block',
          background: 'rgba(239, 68, 68, 0.2)',
          color: '#f87171',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(239, 68, 68, 0.4)'
        }}>
          ● MAINTENANCE MODE
        </div>
        <h1 style={{ color: '#38bdf8', marginBottom: '1rem', fontSize: '1.6rem', letterSpacing: '1px' }}>
          ระบบปิดปรับปรุงชั่วคราว
        </h1>
        <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
          ระบบเกม Marvel Splendor กำลังอยู่ระหว่างการอัปเดตโครงสร้างระบบและปรับปรุงเซิร์ฟเวอร์
        </p>
        <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
          ขออภัยในความไม่สะดวกครับ
        </p>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1.5rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
          Nachapol Protocol — Systems Offline
        </div>
      </div>
    </div>
  );
}
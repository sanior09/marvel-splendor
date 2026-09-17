import type { CSSProperties, ReactElement } from 'react';

export interface MaintenanceCardProps {
  systemName?: string;
  statusText?: string;
  title?: string;
  description?: string;
  note?: string;
  protocolFooter?: string;
}

const containerStyle: CSSProperties = {
  background: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  padding: '2.5rem',
  borderRadius: '1.25rem',
  boxShadow: '0 0 35px rgba(56, 189, 248, 0.2), 0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  maxWidth: '480px',
  width: '100%',
  border: '1px solid rgba(56, 189, 248, 0.35)',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box',
};

const badgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'rgba(239, 68, 68, 0.15)',
  color: '#f87171',
  padding: '0.35rem 0.85rem',
  borderRadius: '9999px',
  fontSize: '0.8rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  marginBottom: '1.25rem',
  border: '1px solid rgba(239, 68, 68, 0.45)',
  textTransform: 'uppercase',
};

const titleStyle: CSSProperties = {
  color: '#38bdf8',
  marginBottom: '1rem',
  fontSize: '1.75rem',
  fontWeight: 800,
  letterSpacing: '0.025em',
  textShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
};

const textStyle: CSSProperties = {
  color: '#94a3b8',
  lineHeight: '1.65',
  marginBottom: '0.75rem',
  fontSize: '0.95rem',
};

const footerStyle: CSSProperties = {
  fontSize: '0.8rem',
  color: '#64748b',
  marginTop: '1.75rem',
  borderTop: '1px solid rgba(51, 65, 85, 0.8)',
  paddingTop: '1rem',
  fontFamily: 'monospace',
  letterSpacing: '0.05em',
};

export function MaintenanceCard({
  statusText = 'MAINTENANCE MODE',
  title = 'ระบบปิดปรับปรุงชั่วคราว',
  description = 'ระบบเกม Marvel Splendor กำลังอยู่ระหว่างการอัปเดตโครงสร้างระบบและปรับปรุงเซิร์ฟเวอร์',
  note = 'ขออภัยในความไม่สะดวกครับ',
  protocolFooter = 'Nachapol Protocol — Systems Offline',
}: MaintenanceCardProps): ReactElement {
  return (
    <div style={containerStyle}>
      <div style={{ fontSize: '3.25rem', marginBottom: '1rem' }} role="img" aria-label="System Bot">
        🤖
      </div>

      <div>
        <span style={badgeStyle}>
          <span style={{ fontSize: '0.65rem' }}>●</span>
          {statusText}
        </span>
      </div>

      <h1 style={titleStyle}>{title}</h1>

      <p style={textStyle}>{description}</p>
      <p style={textStyle}>{note}</p>

      <div style={footerStyle}>{protocolFooter}</div>
    </div>
  );
}

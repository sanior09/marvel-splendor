import type { CSSProperties, ReactElement } from 'react';
import { MaintenanceCard } from './components/MaintenanceCard';

const layoutStyle: CSSProperties = {
  backgroundColor: '#0b0f19',
  color: '#f8fafc',
  fontFamily: "'Outfit', 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  display: 'flex',
  minHeight: '100vh',
  width: '100vw',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
  boxSizing: 'border-box',
  backgroundImage:
    'radial-gradient(ellipse at 50% 20%, rgba(56, 189, 248, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(226, 54, 54, 0.06) 0%, transparent 60%)',
};

export default function App(): ReactElement {
  return (
    <main style={layoutStyle}>
      <MaintenanceCard />
    </main>
  );
}
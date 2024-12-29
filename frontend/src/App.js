import React from 'react';
import { Box } from '@mui/material';
import Canvas from './components/Canvas';

const LOGO_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFBE0B',
];

const Logo = () => (
  <Box 
    component="pre" 
    sx={{ 
      fontFamily: 'monospace',
      fontSize: '48px',
      lineHeight: 1,
      mb: 4,
      mt: 2,
      userSelect: 'none',
      textAlign: 'center',
      fontWeight: 'bold',
      color: 'transparent',
      WebkitTextStroke: '2px #333',
      textShadow: '4px 4px 0px rgba(0,0,0,0.1)',
      '& span': {
        animation: 'colorChange 8s infinite'
      },
      '@keyframes colorChange': {
        '0%': { color: LOGO_COLORS[0] },
        '25%': { color: LOGO_COLORS[1] },
        '50%': { color: LOGO_COLORS[2] },
        '75%': { color: LOGO_COLORS[3] },
        '100%': { color: LOGO_COLORS[0] }
      }
    }}
  >
    <span>PIXELMANIA</span>
  </Box>
);

function App() {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Logo />
      <Canvas />
    </Box>
  );
}

export default App;

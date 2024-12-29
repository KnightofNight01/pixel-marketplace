import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';

const PIXEL_SIZE = 20;
const GRID_SIZE_X = 80;
const GRID_SIZE_Y = 40;
const CANVAS_WIDTH = PIXEL_SIZE * GRID_SIZE_X;
const CANVAS_HEIGHT = PIXEL_SIZE * GRID_SIZE_Y;
const COOLDOWN_TIME = 5000;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_SPEED = 0.1;
const DEVICE_PIXEL_RATIO = window.devicePixelRatio || 1;
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://pixel-backend-k1so.onrender.com/api'
  : 'http://localhost:5001/api';

const COLORS = [
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFFFFF', // White
];

const Canvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [canPlace, setCanPlace] = useState(true);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [hoverPixel, setHoverPixel] = useState(null);

  const setupCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    
    canvas.width = CANVAS_WIDTH * DEVICE_PIXEL_RATIO;
    canvas.height = CANVAS_HEIGHT * DEVICE_PIXEL_RATIO;
    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;
    ctx.scale(DEVICE_PIXEL_RATIO, DEVICE_PIXEL_RATIO);
    
    ctx.imageSmoothingEnabled = false;
    
    return ctx;
  };

  const drawGrid = (ctx) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const imageData = canvas.getContext('2d').getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.putImageData(imageData, 0, 0);
    }
    
    ctx.strokeStyle = '#DDDDDD';
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= CANVAS_WIDTH; x += PIXEL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    for (let y = 0; y <= CANVAS_HEIGHT; y += PIXEL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    if (hoverPixel && canPlace) {
      const { x, y } = hoverPixel;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        x * PIXEL_SIZE,
        y * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE
      );
    }
  };

  const drawPixel = (ctx, x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    drawGrid(ctx);
  };

  const loadCanvas = async () => {
    try {
      console.log('Fetching canvas data from:', `${API_URL}/canvas`);
      const response = await axios.get(`${API_URL}/canvas`);
      console.log('Canvas data received:', response.data);
      
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas ref is null');
        return;
      }
      
      const ctx = setupCanvas(canvas);
      
      if (Array.isArray(response.data.canvasData)) {
        response.data.canvasData.forEach((color, index) => {
          const x = index % GRID_SIZE_X;
          const y = Math.floor(index / GRID_SIZE_X);
          console.log(`Drawing pixel at (${x}, ${y}) with color ${color}`);
          drawPixel(ctx, x, y, color);
        });
      } else {
        console.error('Invalid canvas data:', response.data);
      }
      
      drawGrid(ctx);
    } catch (error) {
      console.error('Error loading canvas:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  useEffect(() => {
    loadCanvas();
    
    const interval = setInterval(loadCanvas, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCanvasClick = async (e) => {
    if (!canPlace) return;

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas ref is null');
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / (PIXEL_SIZE * zoom));
      const y = Math.floor((e.clientY - rect.top) / (PIXEL_SIZE * zoom));
      
      console.log(`Placing pixel at (${x}, ${y}) with color ${selectedColor}`);
      
      const response = await axios.post(`${API_URL}/pixel`, { x, y, color: selectedColor });
      console.log('Server response:', response.data);
      
      const ctx = canvas.getContext('2d');
      drawPixel(ctx, x, y, selectedColor);
      
      setCanPlace(false);
      setCooldownTime(COOLDOWN_TIME / 1000);
      
      const cooldownInterval = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownInterval);
            setCanPlace(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error placing pixel:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, MIN_ZOOM));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    
    const delta = e.deltaY;
    const zoomFactor = delta > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
    
    setZoom(prevZoom => {
      const newZoom = prevZoom + zoomFactor;
      return Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
    });
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (PIXEL_SIZE * zoom));
    const y = Math.floor((e.clientY - rect.top) / (PIXEL_SIZE * zoom));

    if (x >= 0 && x < GRID_SIZE_X && y >= 0 && y < GRID_SIZE_Y) {
      if (!hoverPixel || hoverPixel.x !== x || hoverPixel.y !== y) {
        setHoverPixel({ x, y });
        const ctx = canvas.getContext('2d');
        drawGrid(ctx);
      }
    } else {
      if (hoverPixel) {
        setHoverPixel(null);
        const ctx = canvas.getContext('2d');
        drawGrid(ctx);
      }
    }
  };

  const handleMouseLeave = () => {
    if (hoverPixel) {
      setHoverPixel(null);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        drawGrid(ctx);
      }
    }
  };

  return (
    <Box sx={{ 
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Color Palette */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2,
        padding: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        {COLORS.map((color) => (
          <Button
            key={color}
            sx={{
              width: 32,
              height: 32,
              minWidth: 'unset',
              backgroundColor: color,
              border: selectedColor === color ? '3px solid #000' : '1px solid #666',
              '&:hover': {
                backgroundColor: color,
                border: '3px solid #000',
              },
            }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </Box>

      {/* Canvas Container */}
      <Box 
        ref={containerRef}
        sx={{ 
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto'
        }}
        onWheel={handleWheel}
      >
        <Box sx={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              border: '1px solid #ccc',
              imageRendering: 'pixelated',
              transform: `scale(${zoom})`,
              cursor: canPlace ? 'pointer' : 'not-allowed'
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
          />
          {!canPlace && (
            <Box
              sx={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                zIndex: 2,
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Wait {cooldownTime}s
            </Box>
          )}
          
          {/* Zoom Controls */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 20, 
            right: 20, 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <IconButton onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM}>
              <AddIcon />
            </IconButton>
            <IconButton onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM}>
              <RemoveIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Canvas; 
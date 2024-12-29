const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration for production
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://pixelmania.netlify.app',
    'https://pixel-marketplace.netlify.app',
    'https://pixelmaniax.netlify.app'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Canvas dimensions
const GRID_SIZE_X = 80;
const GRID_SIZE_Y = 40;

// Canvas state
let canvasData = new Array(GRID_SIZE_X * GRID_SIZE_Y).fill('#FFFFFF');

// Reset canvas every 24 hours
const resetCanvas = () => {
  canvasData = new Array(GRID_SIZE_X * GRID_SIZE_Y).fill('#FFFFFF');
  console.log('Canvas reset at:', new Date().toISOString());
};

// Schedule canvas reset every 24 hours
setInterval(resetCanvas, 24 * 60 * 60 * 1000);

// Get current canvas state
app.get('/api/canvas', (req, res) => {
  res.json({ canvasData });
});

// Update pixel
app.post('/api/pixel', (req, res) => {
  const { x, y, color } = req.body;
  const index = y * GRID_SIZE_X + x;
  
  if (x >= 0 && x < GRID_SIZE_X && y >= 0 && y < GRID_SIZE_Y) {
    canvasData[index] = color;
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Invalid coordinates' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Canvas will reset every 24 hours');
}); 
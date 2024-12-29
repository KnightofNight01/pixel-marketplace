const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration for production
app.use(cors({
  origin: ['http://localhost:3000', 'https://pixelmania.netlify.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Canvas state
let canvasData = new Array(50 * 50).fill('#FFFFFF'); // 50x50 white pixels

// Reset canvas every 24 hours
const resetCanvas = () => {
  canvasData = new Array(50 * 50).fill('#FFFFFF');
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
  const index = y * 50 + x;
  
  if (index >= 0 && index < canvasData.length) {
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
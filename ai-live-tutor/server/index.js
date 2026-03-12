/**
 * AI Live Tutor - Backend Server
 *
 * Simple Express server that:
 * 1. Accepts audio uploads from the frontend
 * 2. Returns a mock text response (placeholder for future AI integration)
 *
 * Run: npm run dev (from server folder) or npm run dev:server (from root)
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------

// Allow frontend (Vite runs on different port) to call this API
app.use(cors());

// Parse JSON bodies (e.g. if we send metadata)
app.use(express.json());

// Multer: handle multipart/form-data for audio + optional screen image
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const audioTypes = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg'];
  const imageTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (file.fieldname === 'audio' && audioTypes.includes(file.mimetype)) return cb(null, true);
  if (file.fieldname === 'screen' && imageTypes.includes(file.mimetype)) return cb(null, true);
  cb(new Error(`Invalid file type for ${file.fieldname}.`), false);
};
const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter,
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'screen', maxCount: 1 },
]);

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

/**
 * Health check - useful to verify server is running
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Live Tutor server is running' });
});

/**
 * Mock login endpoint for profile/settings demo.
 *
 * POST /api/auth/login
 * Body (JSON): { provider: 'google' | 'facebook' | 'phone' | 'email', email?, phone? }
 *
 * This does NOT perform real authentication. It just returns a fake
 * user object so the frontend can show profile and settings screens.
 */
app.post('/api/auth/login', (req, res) => {
  const { provider, email, phone } = req.body || {};

  if (!provider) {
    return res.status(400).json({
      success: false,
      error: 'Missing provider. Expected google, facebook, phone, or email.',
    });
  }

  const readableProviderLabels = {
    google: 'Google',
    facebook: 'Facebook',
    phone: 'Phone number',
    email: 'Email',
  };

  const providerLabel = readableProviderLabels[provider] || provider;

  // Create a very simple mock user
  const user = {
    id: Date.now().toString(),
    name:
      provider === 'google'
        ? 'Google User'
        : provider === 'facebook'
        ? 'Facebook User'
        : provider === 'phone'
        ? 'Phone User'
        : 'Email User',
    provider,
    providerLabel,
    email:
      email ||
      (provider === 'google'
        ? 'user@gmail.com'
        : provider === 'facebook'
        ? 'user@facebook.com'
        : null),
    phone: phone || null,
  };

  return res.json({
    success: true,
    user,
    message:
      'Mock login successful. Replace this with real authentication in the future.',
  });
});

/**
 * Session endpoint: receive audio + optional screen image, return mock tutor response
 * POST /api/tutor
 * Body: multipart/form-data with "audio" (file) and optionally "screen" (image)
 * In production, the AI would use the screen capture to understand what the user is looking at.
 */
app.post('/api/tutor', upload, (req, res) => {
  try {
    const audioFile = req.files && req.files.audio && req.files.audio[0];
    const screenFile = req.files && req.files.screen && req.files.screen[0];

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        error: 'No audio file received. Please record during the session and try again.',
      });
    }

    const audioKb = Math.round(audioFile.size / 1024);
    const screenKb = screenFile ? Math.round(screenFile.size / 1024) : 0;
    console.log(`Session: audio ${audioKb} KB${screenFile ? `, screen ${screenKb} KB` : ''}`);

    const mockResponses = [
      "That's a great question! Let me explain that step by step.",
      "I understand what you're asking. Here's what I think you should focus on.",
      "Good thinking! Have you considered looking at it from another angle?",
      "Thanks for sharing. Here's a simple way to remember this.",
    ];
    const text = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    res.json({
      success: true,
      text,
      sawScreen: !!screenFile,
      message: screenFile
        ? 'Mock response. In production, the AI would use your screen and voice.'
        : 'Mock response. Enable screen share so the tutor can see your screen.',
    });
  } catch (err) {
    console.error('Error in /api/tutor:', err);
    res.status(500).json({ success: false, error: 'Something went wrong on the server.' });
  }
});

// Multer passes errors to Express when file filter rejects
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'Audio file too large.' });
    }
  }
  if (err.message) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next(err);
});

// -----------------------------------------------------------------------------
// Start server
// -----------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`AI Live Tutor server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

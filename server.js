const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Google Cloud TTS API configuration
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY || '';
const GOOGLE_TTS_API_URL = 'https://texttospeech.googleapis.com/v1';

// Get available voices
app.get('/api/voices', async (req, res) => {
  try {
    const response = await axios.get(`${GOOGLE_TTS_API_URL}/voices`, {
      params: {
        key: GOOGLE_TTS_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching voices:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch voices', details: error.response?.data || error.message });
  }
});

// Synthesize speech
app.post('/api/synthesize', async (req, res) => {
  try {
    const {
      text,
      languageCode,
      name,
      ssmlGender,
      audioEncoding,
      speakingRate,
      pitch,
      volumeGainDb,
      sampleRateHertz
    } = req.body;

    if (!text || text.length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.length > 10000) {
      return res.status(400).json({ error: 'Text exceeds 10,000 character limit' });
    }

    const requestBody = {
      input: {
        text: text
      },
      voice: {
        languageCode: languageCode || 'en-US',
        name: name || 'en-US-Standard-B',
        ssmlGender: ssmlGender || 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: audioEncoding || 'MP3',
        speakingRate: speakingRate || 1.0,
        pitch: pitch || 0.0,
        volumeGainDb: volumeGainDb || 0.0
      }
    };

    // Add sampleRateHertz if provided
    if (sampleRateHertz) {
      requestBody.audioConfig.sampleRateHertz = sampleRateHertz;
    }

    const response = await axios.post(
      `${GOOGLE_TTS_API_URL}/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      audioContent: response.data.audioContent,
      audioEncoding: audioEncoding || 'MP3'
    });
  } catch (error) {
    console.error('Error synthesizing speech:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to synthesize speech', 
      details: error.response?.data || error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

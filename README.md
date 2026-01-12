# Text-to-Speech Web App

A modern web application for converting text to speech using Google Cloud Text-to-Speech API. Supports up to 10,000 characters with full control over voice parameters.

## Features

- ✅ Text-to-speech conversion with 10,000+ character support
- ✅ Google Cloud Text-to-Speech API integration
- ✅ Download generated audio files (MP3, WAV, OGG)
- ✅ All Google TTS API options available:
  - Language selection
  - Voice selection (hundreds of voices)
  - Gender selection
  - Audio encoding formats (MP3, LINEAR16, OGG_OPUS, etc.)
  - Speaking rate control (0.25x - 4.0x)
  - Pitch adjustment (-20 to +20 semitones)
  - Volume gain control
  - Sample rate selection
- ✅ Real-time voice preview
- ✅ Beautiful, responsive UI

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Text-to-Speech API key

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Google Cloud TTS API key:
   ```
   GOOGLE_TTS_API_KEY=your_api_key_here
   PORT=3000
   ```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Deployment

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variable in Vercel dashboard:
   - Go to your project settings
   - Add `GOOGLE_TTS_API_KEY` with your API key

### Option 2: Deploy to Render

1. Create a new account at [render.com](https://render.com)

2. Create a new Web Service

3. Connect your GitHub repository

4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - `GOOGLE_TTS_API_KEY`: Your API key
     - `PORT`: 10000 (or leave empty, Render will set it)

5. Deploy!

### Option 3: Deploy to Railway

1. Create a new account at [railway.app](https://railway.app)

2. Create a new project from GitHub

3. Add environment variable:
   - `GOOGLE_TTS_API_KEY`: Your API key

4. Deploy!

### Option 4: Deploy to Heroku

1. Install Heroku CLI

2. Login:
```bash
heroku login
```

3. Create app:
```bash
heroku create your-app-name
```

4. Set environment variable:
```bash
heroku config:set GOOGLE_TTS_API_KEY=your_api_key_here
```

5. Deploy:
```bash
git push heroku main
```

## API Endpoints

### GET `/api/voices`
Returns all available voices from Google Cloud TTS API.

### POST `/api/synthesize`
Synthesizes speech from text.

**Request Body:**
```json
{
  "text": "Hello, world!",
  "languageCode": "en-US",
  "name": "en-US-Standard-B",
  "ssmlGender": "NEUTRAL",
  "audioEncoding": "MP3",
  "speakingRate": 1.0,
  "pitch": 0.0,
  "volumeGainDb": 0.0,
  "sampleRateHertz": 24000
}
```

**Response:**
```json
{
  "audioContent": "base64_encoded_audio",
  "audioEncoding": "MP3"
}
```

## Usage

1. Enter your text in the text area (up to 10,000 characters)
2. Select your preferred language code
3. Choose a voice from the dropdown
4. Adjust speaking rate, pitch, and volume as needed
5. Select audio encoding format
6. Click "Generate Speech"
7. Play the audio or download it

## Supported Options

### Audio Encodings
- MP3 (default)
- LINEAR16 (WAV)
- OGG_OPUS
- MULAW
- ALAW

### Speaking Rate
- Range: 0.25 to 4.0
- Default: 1.0 (normal speed)

### Pitch
- Range: -20.0 to 20.0 semitones
- Default: 0.0 (normal pitch)

### Volume Gain
- Range: -96.0 to 16.0 decibels
- Default: 0.0 (normal volume)

### Sample Rates
- 8000 Hz
- 16000 Hz
- 22050 Hz
- 24000 Hz
- 32000 Hz
- 44100 Hz
- 48000 Hz

## Technologies Used

- Node.js
- Express.js
- Google Cloud Text-to-Speech API
- Vanilla JavaScript
- HTML5 & CSS3

## License

MIT

## Notes

- The API key is stored in environment variables for security
- Make sure to keep your `.env` file out of version control
- The app supports all languages and voices available in Google Cloud TTS
- Maximum text length is 10,000 characters per request

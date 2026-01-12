// DOM elements
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const languageCode = document.getElementById('languageCode');
const voiceName = document.getElementById('voiceName');
const ssmlGender = document.getElementById('ssmlGender');
const audioEncoding = document.getElementById('audioEncoding');
const speakingRate = document.getElementById('speakingRate');
const speakingRateValue = document.getElementById('speakingRateValue');
const pitch = document.getElementById('pitch');
const pitchValue = document.getElementById('pitchValue');
const volumeGainDb = document.getElementById('volumeGainDb');
const volumeGainDbValue = document.getElementById('volumeGainDbValue');
const sampleRateHertz = document.getElementById('sampleRateHertz');
const synthesizeBtn = document.getElementById('synthesizeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const audioPlayer = document.getElementById('audioPlayer');
const audioSection = document.getElementById('audioSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const voicesInfo = document.getElementById('voicesInfo');
const loadVoicesBtn = document.getElementById('loadVoicesBtn');

let currentAudioBlob = null;
let voicesList = [];

// Character counter
textInput.addEventListener('input', () => {
    const count = textInput.value.length;
    charCount.textContent = count;
    if (count > 10000) {
        charCount.style.color = '#c33';
    } else {
        charCount.style.color = '#777';
    }
});

// Range input value displays
speakingRate.addEventListener('input', () => {
    speakingRateValue.textContent = speakingRate.value;
});

pitch.addEventListener('input', () => {
    pitchValue.textContent = pitch.value;
});

volumeGainDb.addEventListener('input', () => {
    volumeGainDbValue.textContent = volumeGainDb.value;
});

// Load voices on page load
window.addEventListener('DOMContentLoaded', () => {
    loadVoices();
});

// Load voices button
loadVoicesBtn.addEventListener('click', () => {
    loadVoices();
});

// Language code change - filter voices
languageCode.addEventListener('input', () => {
    filterVoicesByLanguage();
});

// Load available voices
async function loadVoices() {
    try {
        voiceName.innerHTML = '<option value="">Loading...</option>';
        const response = await fetch('/api/voices');
        const data = await response.json();
        
        if (data.voices) {
            voicesList = data.voices;
            populateVoiceSelect();
            displayVoicesInfo();
        } else {
            throw new Error('No voices found');
        }
    } catch (error) {
        console.error('Error loading voices:', error);
        voiceName.innerHTML = '<option value="">Error loading voices</option>';
        voicesInfo.innerHTML = `<p class="error-message">Error loading voices: ${error.message}</p>`;
    }
}

// Populate voice select dropdown
function populateVoiceSelect() {
    const langCode = languageCode.value || 'en-US';
    const filteredVoices = voicesList.filter(voice => 
        voice.languageCodes.includes(langCode)
    );
    
    voiceName.innerHTML = '';
    
    if (filteredVoices.length === 0) {
        voiceName.innerHTML = '<option value="">No voices found for this language</option>';
        return;
    }
    
    // Group by name
    const uniqueVoices = {};
    filteredVoices.forEach(voice => {
        if (!uniqueVoices[voice.name]) {
            uniqueVoices[voice.name] = voice;
        }
    });
    
    Object.values(uniqueVoices).forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.ssmlGender})`;
        voiceName.appendChild(option);
    });
    
    // Set default if not set
    if (!voiceName.value && filteredVoices.length > 0) {
        voiceName.value = filteredVoices[0].name;
    }
}

// Filter voices by language
function filterVoicesByLanguage() {
    populateVoiceSelect();
}

// Display voices information
function displayVoicesInfo() {
    if (voicesList.length === 0) return;
    
    // Group by language
    const voicesByLang = {};
    voicesList.forEach(voice => {
        voice.languageCodes.forEach(lang => {
            if (!voicesByLang[lang]) {
                voicesByLang[lang] = [];
            }
            voicesByLang[lang].push(voice);
        });
    });
    
    let html = '<div style="display: grid; gap: 15px;">';
    
    Object.keys(voicesByLang).sort().forEach(lang => {
        html += `<div class="voice-item">`;
        html += `<strong>${lang}</strong><br>`;
        html += `Available voices: ${voicesByLang[lang].length}<br>`;
        html += `Genders: ${[...new Set(voicesByLang[lang].map(v => v.ssmlGender))].join(', ')}`;
        html += `</div>`;
    });
    
    html += '</div>';
    html += `<p style="margin-top: 15px; color: #777;">Total: ${voicesList.length} voices available</p>`;
    
    voicesInfo.innerHTML = html;
}

// Synthesize speech
synthesizeBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    
    if (!text) {
        alert('Please enter some text');
        return;
    }
    
    if (text.length > 10000) {
        alert('Text exceeds 10,000 character limit');
        return;
    }
    
    loadingOverlay.style.display = 'flex';
    synthesizeBtn.disabled = true;
    
    try {
        const requestData = {
            text: text,
            languageCode: languageCode.value || 'en-US',
            name: voiceName.value || undefined,
            ssmlGender: ssmlGender.value,
            audioEncoding: audioEncoding.value,
            speakingRate: parseFloat(speakingRate.value),
            pitch: parseFloat(pitch.value),
            volumeGainDb: parseFloat(volumeGainDb.value),
            sampleRateHertz: sampleRateHertz.value ? parseInt(sampleRateHertz.value) : undefined
        };
        
        const response = await fetch('/api/synthesize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to synthesize speech');
        }
        
        // Convert base64 to blob
        const audioData = atob(data.audioContent);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < audioData.length; i++) {
            uint8Array[i] = audioData.charCodeAt(i);
        }
        
        // Determine MIME type based on encoding
        let mimeType = 'audio/mpeg';
        if (data.audioEncoding === 'LINEAR16') {
            mimeType = 'audio/wav';
        } else if (data.audioEncoding === 'OGG_OPUS') {
            mimeType = 'audio/ogg';
        }
        
        currentAudioBlob = new Blob([arrayBuffer], { type: mimeType });
        const audioUrl = URL.createObjectURL(currentAudioBlob);
        
        audioPlayer.src = audioUrl;
        audioSection.style.display = 'block';
        downloadBtn.disabled = false;
        
        // Scroll to audio section
        audioSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating speech: ' + error.message);
    } finally {
        loadingOverlay.style.display = 'none';
        synthesizeBtn.disabled = false;
    }
});

// Download audio
downloadBtn.addEventListener('click', () => {
    if (!currentAudioBlob) return;
    
    const extension = audioEncoding.value === 'LINEAR16' ? 'wav' : 
                     audioEncoding.value === 'OGG_OPUS' ? 'ogg' : 'mp3';
    
    const url = URL.createObjectURL(currentAudioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tts-audio-${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

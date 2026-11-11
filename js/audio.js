// ============================================
// LEIA PARA UMA CRIANÇA — Audio Module
// ============================================

import * as storage from './storage.js';

const tracks = [
  { id: 0, name: 'Noite Tranquila', desc: 'Piano suave', file: 'audio/01 - Noite Tranquila.mp3', icon: '🌙' },
  { id: 1, name: 'Chuva na Janela', desc: 'Chuva leve e piano', file: 'audio/02 - Chuva na Janela.mp3', icon: '🌧️' },
  { id: 2, name: 'Floresta dos Sonhos', desc: 'Sons naturais e ambient', file: 'audio/03 - Floresta dos Sonhos.mp3', icon: '🌲' },
  { id: 3, name: 'Caixinha de Estrelas', desc: 'Melodia delicada', file: 'audio/04 - Caixinha de Estrelas.mp3', icon: '🎵' },
  { id: 4, name: 'Sono Profundo', desc: 'Ambient instrumental', file: 'audio/05 - Sono Profundo.mp3', icon: '💤' }
];

let audioElement = null;
let currentTrackIndex = 0;
let isPlaying = false;
let volume = 40;
let originalVolume = 40;
let timerInterval = null;
let timerEndTime = null;
let timerDuration = 0;
let fadeInterval = null;
let hasUserInteracted = false;
let onStateChange = null;
let audioAvailable = false;
let repeatEnabled = true;

function init(stateChangeCallback) {
  onStateChange = stateChangeCallback;

  // Create single audio element
  audioElement = new Audio();
  repeatEnabled = storage.get('repeat') !== false;
  audioElement.loop = repeatEnabled;
  audioElement.preload = 'none';

  volume = Number(storage.get('volume') ?? 40);
  currentTrackIndex = Number(storage.get('preferredTrack') ?? 0);
  audioElement.volume = volume / 100;

  audioElement.addEventListener('play', () => {
    isPlaying = true;
    audioAvailable = true;
    notifyStateChange();
  });

  audioElement.addEventListener('pause', () => {
    isPlaying = false;
    notifyStateChange();
  });

  audioElement.addEventListener('error', () => {
    audioAvailable = false;
    isPlaying = false;
    notifyStateChange();
  });

  audioElement.addEventListener('canplay', () => {
    audioAvailable = true;
    notifyStateChange();
  });
}

function notifyStateChange() {
  if (onStateChange) {
    onStateChange({
      isPlaying,
      currentTrack: tracks[currentTrackIndex],
      volume,
      timerActive: timerEndTime !== null,
      timerRemaining: getTimerRemaining(),
      audioAvailable,
      repeatEnabled
    });
  }
}

function getTracks() {
  return tracks;
}

function getCurrentTrack() {
  return tracks[currentTrackIndex];
}

function selectTrack(index) {
  if (index < 0 || index >= tracks.length) return;
  currentTrackIndex = index;
  storage.set('preferredTrack', index);

  const wasPlaying = isPlaying;
  audioElement.src = new URL(`../${tracks[index].file}`, import.meta.url).href;

  if (wasPlaying || hasUserInteracted) {
    play();
  }
  notifyStateChange();
}

function play() {
  hasUserInteracted = true;
  if (!audioElement.src || audioElement.src === window.location.href) {
    audioElement.src = new URL(`../${tracks[currentTrackIndex].file}`, import.meta.url).href;
  }
  audioElement.volume = volume / 100;
  const promise = audioElement.play();
  if (promise) {
    promise.catch(err => {
      console.warn('Audio play blocked:', err.message);
      audioAvailable = false;
      notifyStateChange();
    });
  }
}

function pause() {
  audioElement.pause();
}

function togglePlay() {
  hasUserInteracted = true;
  if (isPlaying) {
    pause();
  } else {
    play();
  }
}

function setVolume(val) {
  volume = Math.max(0, Math.min(100, val));
  if (timerEndTime && getTimerRemaining() <= 30) originalVolume = volume;
  audioElement.volume = volume / 100;
  storage.set('volume', volume);
  notifyStateChange();
}

function getVolume() {
  return volume;
}

function getIsPlaying() {
  return isPlaying;
}

function toggleRepeat() {
  repeatEnabled = !repeatEnabled;
  audioElement.loop = repeatEnabled;
  storage.set('repeat', repeatEnabled);
  notifyStateChange();
  return repeatEnabled;
}

// Timer
function startTimer(minutes) {
  clearTimer();
  if (minutes <= 0) return;

  timerDuration = minutes;
  timerEndTime = Date.now() + minutes * 60 * 1000;
  originalVolume = volume;

  timerInterval = setInterval(() => {
    const remaining = getTimerRemaining();

    if (remaining <= 0) {
      clearTimer();
      pause();
      // Restore volume for next play
      setVolume(originalVolume);
      return;
    }

    // Fade out in last 30 seconds
    if (remaining <= 30) {
      const fadeVolume = Math.round(originalVolume * (remaining / 30));
      audioElement.volume = Math.max(0, fadeVolume / 100);
    }

    notifyStateChange();
  }, 1000);

  notifyStateChange();
}

function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (fadeInterval) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }
  timerEndTime = null;
  timerDuration = 0;
  // Restore volume
  if (audioElement) {
    audioElement.volume = volume / 100;
  }
  notifyStateChange();
}

function getTimerRemaining() {
  if (!timerEndTime) return 0;
  return Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
}

function getTimerDuration() {
  return timerDuration;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function isAudioAvailable() {
  return audioAvailable;
}

export {
  init, getTracks, getCurrentTrack, selectTrack,
  play, pause, togglePlay, setVolume, getVolume, getIsPlaying,
  startTimer, clearTimer, getTimerRemaining, getTimerDuration, formatTime,
  isAudioAvailable, toggleRepeat
};


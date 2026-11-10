// ============================================
// LEIA PARA UMA CRIANÇA — Preferences Module
// ============================================

import * as storage from './storage.js';

let currentTheme = 'dark';
let currentFontSize = 21;
let currentLineHeight = 1.8;

function init() {
  currentTheme = storage.get('theme') || 'dark';
  currentFontSize = storage.get('fontSize') || 21;
  currentLineHeight = storage.get('lineHeight') || 1.8;

  applyTheme(currentTheme);
  applyFontSize(currentFontSize);
  applyLineHeight(currentLineHeight);
}

function applyTheme(theme) {
  currentTheme = theme;
  document.body.setAttribute('data-theme', theme);
  storage.set('theme', theme);

  // Update theme meta tag
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.content = theme === 'dark' ? '#101827' : '#F5F0E8';
  }

  // Update toggle buttons
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  return currentTheme;
}

function getTheme() {
  return currentTheme;
}

function applyFontSize(size) {
  size = Math.max(14, Math.min(32, size));
  currentFontSize = size;
  document.documentElement.style.setProperty('--reader-font-size', size + 'px');
  storage.set('fontSize', size);

  // Update displays
  document.querySelectorAll('#fontSizeValue, #settingFontSize').forEach(el => {
    if (el) el.textContent = size + 'px';
  });
}

function increaseFontSize() {
  applyFontSize(currentFontSize + 2);
}

function decreaseFontSize() {
  applyFontSize(currentFontSize - 2);
}

function getFontSize() {
  return currentFontSize;
}

function applyLineHeight(height) {
  height = Math.max(1.2, Math.min(2.6, height));
  currentLineHeight = Math.round(height * 10) / 10;
  document.documentElement.style.setProperty('--reader-line-height', currentLineHeight);
  storage.set('lineHeight', currentLineHeight);

  const display = document.getElementById('spacingValue');
  if (display) display.textContent = currentLineHeight;
}

function increaseLineHeight() {
  applyLineHeight(currentLineHeight + 0.2);
}

function decreaseLineHeight() {
  applyLineHeight(currentLineHeight - 0.2);
}

function getLineHeight() {
  return currentLineHeight;
}

export {
  init, applyTheme, toggleTheme, getTheme,
  applyFontSize, increaseFontSize, decreaseFontSize, getFontSize,
  applyLineHeight, increaseLineHeight, decreaseLineHeight, getLineHeight
};


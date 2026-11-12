// ============================================
// LEIA PARA UMA CRIANÇA — Favorites Module
// ============================================

import * as storage from './storage.js';

function getFavorites() {
  return storage.get('favorites') || [];
}

function isFavorite(storyId) {
  return getFavorites().includes(storyId);
}

function toggleFavorite(storyId) {
  const favs = getFavorites();
  const index = favs.indexOf(storyId);
  if (index === -1) {
    favs.push(storyId);
  } else {
    favs.splice(index, 1);
  }
  storage.set('favorites', favs);
  return index === -1; // returns true if added
}

function addToHistory(storyId) {
  let history = storage.get('history') || [];
  // Remove if already exists, then push to front
  history = history.filter(id => id !== storyId);
  history.unshift(storyId);
  // Keep only last 20
  if (history.length > 20) history = history.slice(0, 20);
  storage.set('history', history);
  storage.set('lastStory', storyId);
  storage.set('completedStories', (storage.get('completedStories') || []).filter(id => id !== storyId));
}

function getHistory() {
  return storage.get('history') || [];
}

function markStoryAsRead(storyId) {
  const completed = storage.get('completedStories') || [];
  if (!completed.includes(storyId)) completed.push(storyId);
  storage.set('completedStories', completed);
  storage.set('history', getHistory().filter(id => id !== storyId));
}

function getCompletedStories() {
  return storage.get('completedStories') || [];
}

function getLastStory() {
  return storage.get('lastStory');
}

function saveReadingPosition(storyId, scrollPercent) {
  const positions = storage.get('readingPositions') || {};
  positions[storyId] = scrollPercent;
  storage.set('readingPositions', positions);
}

function getReadingPosition(storyId) {
  const positions = storage.get('readingPositions') || {};
  return positions[storyId] || 0;
}

export {
  getFavorites, isFavorite, toggleFavorite,
  addToHistory, getHistory, getLastStory, markStoryAsRead, getCompletedStories,
  saveReadingPosition, getReadingPosition
};



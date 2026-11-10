// ============================================
// LEIA PARA UMA CRIANÇA — Reader Module
// ============================================

import * as favorites from './favorites.js';
import * as stories from './stories.js';

let currentStory = null;
let onNavigate = null;

function init(navigateCallback) {
  onNavigate = navigateCallback;
}

function renderStory(story) {
  if (!story) return;
  currentStory = story;

  // Track in history
  favorites.addToHistory(story.id);

  // Illustration
  const illContainer = document.getElementById('readerIllustration');
  if (illContainer) {
    illContainer.innerHTML = '';
    if (story.coverImage) {
      const img = new Image();
      img.src = story.coverImage;
      img.alt = `Ilustração de ${story.title}`;
      img.loading = 'lazy';
      img.className = 'reader-cover-img';
      img.onerror = () => showIllustrationPlaceholder(illContainer);
      illContainer.appendChild(img);
    } else {
      showIllustrationPlaceholder(illContainer);
    }
  }

  // Meta
  const catEl = document.getElementById('readerCategory');
  const ageEl = document.getElementById('readerAge');
  const timeEl = document.getElementById('readerTime');

  if (catEl) catEl.textContent = story.category;
  if (ageEl) ageEl.textContent = story.ageRange === '3-5' ? '3 a 5 anos' : story.ageRange === '6-8' ? '6 a 8 anos' : '3 a 8 anos';
  if (timeEl) timeEl.textContent = story.estimatedReadingTime + ' min';

  // Title
  const titleEl = document.getElementById('readerTitle');
  if (titleEl) titleEl.textContent = story.title;

  // Content
  const textEl = document.getElementById('readerText');
  if (textEl) {
    textEl.innerHTML = '';
    if (story.content && Array.isArray(story.content)) {
      story.content.forEach(item => {
        const p = document.createElement('p');
        p.textContent = item.paragraph;
        textEl.appendChild(p);
      });
    }
  }

  // Favorite button
  updateFavoriteButton();

  // Navigation buttons
  updateNavButtons();

  updateReadingProgress();

  // Restore reading position after a short delay
  setTimeout(() => {
    const pos = favorites.getReadingPosition(story.id);
    if (pos > 0) {
      const scrollTarget = document.documentElement.scrollHeight * pos;
      window.scrollTo({ top: scrollTarget, behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, 100);
}

function showIllustrationPlaceholder(container) {
  const placeholder = document.createElement('div');
  placeholder.className = 'reader-illustration-placeholder';
  placeholder.setAttribute('role', 'img');
  placeholder.setAttribute('aria-label', 'Ilustração ainda não disponível');
  placeholder.textContent = 'Ilustração pendente';
  container.replaceChildren(placeholder);
}

function updateFavoriteButton() {
  const btn = document.getElementById('btnReaderFav');
  if (!btn || !currentStory) return;

  const isFav = favorites.isFavorite(currentStory.id);
  btn.classList.toggle('btn-fav-active', isFav);
  btn.setAttribute('aria-label', isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
  btn.title = isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
}

function toggleCurrentFavorite() {
  if (!currentStory) return false;
  const added = favorites.toggleFavorite(currentStory.id);
  updateFavoriteButton();
  return added;
}

function updateNavButtons() {
  if (!currentStory) return;

  const prevStory = stories.getPrevStory(currentStory.id);
  const nextStory = stories.getNextStory(currentStory.id);

  const prevBtn = document.getElementById('btnPrevStory');
  const nextBtn = document.getElementById('btnNextStory');

  if (prevBtn) {
    prevBtn.querySelector('span').textContent = prevStory ? 'Anterior' : '';
    prevBtn.disabled = !prevStory;
  }

  if (nextBtn) {
    nextBtn.querySelector('span').textContent = nextStory ? 'Próxima' : '';
    nextBtn.disabled = !nextStory;
  }
}

function goToNextStory() {
  if (!currentStory) return;
  const next = stories.getNextStory(currentStory.id);
  if (next && onNavigate) onNavigate(next.id);
}

function goToPrevStory() {
  if (!currentStory) return;
  const prev = stories.getPrevStory(currentStory.id);
  if (prev && onNavigate) onNavigate(prev.id);
}

function getCurrentStory() {
  return currentStory;
}

// Track scroll position periodically
function trackScrollPosition() {
  if (!currentStory) return;
  if (!document.getElementById('pageReader')?.classList.contains('active')) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  updateReadingProgress();
  if (docHeight > 0) {
    const percent = scrollTop / docHeight;
    favorites.saveReadingPosition(currentStory.id, percent);
  }
}

function updateReadingProgress() {
  const progress = document.getElementById('readingProgress');
  const thumb = document.getElementById('readingProgressThumb');
  if (!progress || !thumb) return;

  const readerActive = document.getElementById('pageReader')?.classList.contains('active');
  const scrollHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  const scrollableHeight = Math.max(0, scrollHeight - viewportHeight);
  const hasScroll = scrollableHeight > 8;
  progress.classList.toggle('is-visible', Boolean(readerActive && hasScroll));
  progress.setAttribute('aria-hidden', String(!(readerActive && hasScroll)));

  const thumbHeight = hasScroll ? Math.max(7, Math.min(100, viewportHeight / scrollHeight * 100)) : 100;
  const travel = 100 - thumbHeight;
  const top = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * travel : 0;
  thumb.style.height = `${thumbHeight}%`;
  thumb.style.top = `${Math.min(travel, Math.max(0, top))}%`;
}

export {
  init, renderStory, toggleCurrentFavorite, goToNextStory, goToPrevStory,
  getCurrentStory, trackScrollPosition
};



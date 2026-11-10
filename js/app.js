// ============================================
// LEIA PARA UMA CRIANÇA — App Main
// ============================================

import * as storiesModule from './stories.js';
import * as favorites from './favorites.js';
import * as preferences from './preferences.js';
import * as audio from './audio.js';
import * as reader from './reader.js';

let allStories = [];
let currentFilter = {category: '', age: '', search: '', favoritesOnly: false};

async function init() {
  await storiesModule.loadStories();
  allStories = storiesModule.getAllStories();
  
  preferences.init();
  audio.init(updateAudioState);
  reader.init(navigateToStory);
  
  bindEvents();
  renderHome();
  updateAudioUI();
  updateConnectivity();
  window.addEventListener('online', updateConnectivity);
  window.addEventListener('offline', updateConnectivity);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register(new URL('../sw.js', import.meta.url)).catch(err => console.warn('Não foi possível ativar o modo offline:', err));
  }
}

function bindEvents() {
  document.getElementById('btnChooseStory')?.addEventListener('click', () => showPage('library'));
  document.getElementById('btnBackLibrary')?.addEventListener('click', () => showPage('library'));
  document.getElementById('logoLink')?.addEventListener('click', (e)=>{e.preventDefault(); showPage('home')});
  
  // Library filters
  document.getElementById('searchInput')?.addEventListener('input', e => {
    currentFilter.search = e.target.value;
    renderLibrary();
  });
  document.getElementById('filterCategory')?.addEventListener('change', e => {
    currentFilter.category = e.target.value;
    renderLibrary();
  });
  document.getElementById('filterAge')?.addEventListener('change', e => {
    currentFilter.age = e.target.value;
    renderLibrary();
  });
  document.getElementById('btnShowFavorites')?.addEventListener('click', () => {
    currentFilter.favoritesOnly = !currentFilter.favoritesOnly;
    renderLibrary();
  });
  document.getElementById('btnFavoritesNav')?.addEventListener('click', () => {
    currentFilter.favoritesOnly = true;
    showPage('library');
  });
  document.getElementById('sortStories')?.addEventListener('change', renderLibrary);
  
  // Reader controls
  document.getElementById('btnReaderFav')?.addEventListener('click', () => {
    reader.toggleCurrentFavorite();
  });
  document.getElementById('btnPrevStory')?.addEventListener('click', () => reader.goToPrevStory());
  document.getElementById('btnNextStory')?.addEventListener('click', () => reader.goToNextStory());
  document.getElementById('btnFontControls')?.addEventListener('click', toggleFontPanel);
  document.getElementById('btnFontDecrease')?.addEventListener('click', () => preferences.decreaseFontSize());
  document.getElementById('btnFontIncrease')?.addEventListener('click', () => preferences.increaseFontSize());
  document.getElementById('btnSpacingDecrease')?.addEventListener('click', () => preferences.decreaseLineHeight());
  document.getElementById('btnSpacingIncrease')?.addEventListener('click', () => preferences.increaseLineHeight());
  document.getElementById('btnThemeToggleReader')?.addEventListener('click', () => preferences.toggleTheme());
  
  // Music
  document.getElementById('btnMusicNav')?.addEventListener('click', toggleMusicPanel);
  document.getElementById('btnCloseMusic')?.addEventListener('click', toggleMusicPanel);
  document.getElementById('musicPanelBackdrop')?.addEventListener('click', toggleMusicPanel);
  document.getElementById('miniPlayerExpand')?.addEventListener('click', toggleMusicPanel);
  document.getElementById('volumeSlider')?.addEventListener('input', e => audio.setVolume(parseInt(e.target.value)));
  document.getElementById('miniPlayerPlay')?.addEventListener('click', () => audio.togglePlay());
  document.getElementById('btnRepeat')?.addEventListener('click', () => audio.toggleRepeat());
  
  // Settings
  document.getElementById('btnSettingsNav')?.addEventListener('click', toggleSettingsPanel);
  document.getElementById('btnCloseSettings')?.addEventListener('click', toggleSettingsPanel);
  document.getElementById('settingsBackdrop')?.addEventListener('click', toggleSettingsPanel);
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      preferences.applyTheme(btn.dataset.theme);
    });
  });
  document.getElementById('btnSettingFontDec')?.addEventListener('click', () => preferences.decreaseFontSize());
  document.getElementById('btnSettingFontInc')?.addEventListener('click', () => preferences.increaseFontSize());
  document.getElementById('settingVolume')?.addEventListener('input', e => audio.setVolume(parseInt(e.target.value)));
  document.getElementById('settingTrack')?.addEventListener('change', e => audio.selectTrack(parseInt(e.target.value)));
  document.querySelectorAll('.timer-btn').forEach(btn => btn.addEventListener('click', () => {
    const minutes = Number(btn.dataset.time);
    if (minutes === 0) audio.clearTimer();
    else audio.startTimer(minutes);
    updateTimerControls();
  }));
  
  // Scroll tracking
  window.addEventListener('scroll', () => reader.trackScrollPosition());
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  if (page === 'home') {
    document.getElementById('pageHome').classList.add('active');
    renderHome();
  } else if (page === 'library') {
    document.getElementById('pageLibrary').classList.add('active');
    renderLibrary();
  } else if (page === 'reader') {
    document.getElementById('pageReader').classList.add('active');
  }
}

function renderHome() {
  // Continue
  const historyIds = favorites.getHistory();
  const continueStories = historyIds.slice(0,3).map(id => storiesModule.getStoryById(id)).filter(Boolean);
  document.getElementById('sectionContinue').hidden = continueStories.length === 0;
  renderStoryCards('continueCards', continueStories);
  
  // Tonight - random
  const random = storiesModule.getRandomStories(4);
  renderStoryCards('tonightCards', random);
  
  // Categories
  const grid = document.getElementById('categoriesGrid');
  if (grid) {
    grid.innerHTML = '';
    storiesModule.getCategories().forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'category-card';
      btn.innerHTML = `<span class="cat-icon">${cat.icon}</span><span>${cat.name}</span>`;
      btn.addEventListener('click', () => {
        currentFilter.category = cat.name;
        showPage('library');
      });
      grid.appendChild(btn);
    });
  }
}

function renderLibrary() {
  const results = storiesModule.filterStories({
    category: currentFilter.category,
    ageRange: currentFilter.age,
    search: currentFilter.search,
    favoritesOnly: currentFilter.favoritesOnly,
    favoriteIds: favorites.getFavorites()
  });
  
  const sort = document.getElementById('sortStories')?.value || 'original';
  if (sort === 'title') results.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  if (sort === 'duration') results.sort((a, b) => a.estimatedReadingTime - b.estimatedReadingTime);
  document.getElementById('resultsCount').textContent = `${results.length} ${results.length === 1 ? 'história' : 'histórias'}${currentFilter.favoritesOnly ? ' favoritas' : ''}`;
  document.getElementById('btnShowFavorites')?.classList.toggle('active', currentFilter.favoritesOnly);
  const grid = document.getElementById('storyCardsGrid');
  grid.innerHTML = '';
  results.forEach(story => {
    const card = createStoryCard(story);
    grid.appendChild(card);
  });
  document.getElementById('noResults').hidden = results.length > 0;
}

function createStoryCard(story) {
  const div = document.createElement('div');
  const history = favorites.getHistory();
  div.className = `story-card${history.includes(story.id) ? ' story-card-read' : ''}`;
  const image = story.coverImage
    ? `<img class="story-card-image" src="${story.coverImage}" alt="Ilustração de ${story.title}" loading="lazy">`
    : `<div class="story-card-image-placeholder" role="img" aria-label="Ilustração ainda não disponível"><span class="cover-placeholder-stars" aria-hidden="true">✦　☾　✧</span><span>Ilustração pendente</span></div>`;
  div.innerHTML = `
    ${image}
    <div class="story-card-body">
      <h3 class="story-card-title">${story.title}</h3>
      <div class="story-card-meta">
        <span class="badge badge-category">${story.category}</span>
        <span class="badge badge-age">${story.ageRange} anos</span>
        <span class="badge badge-time">~${story.estimatedReadingTime} min</span>
      </div>
    </div>
  `;
  div.tabIndex = 0;
  div.setAttribute('role', 'button');
  div.setAttribute('aria-label', `Ler: ${story.title}`);
  div.addEventListener('click', () => navigateToStory(story.id));
  div.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateToStory(story.id); } });
  return div;
}

function renderStoryCards(containerId, stories) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  stories.forEach(s => {
    const card = createStoryCard(s);
    card.classList.add('story-card-sm');
    container.appendChild(card);
  });
}

function navigateToStory(storyId) {
  const story = storiesModule.getStoryById(storyId);
  if (!story) return;
  reader.renderStory(story);
  showPage('reader');
}

function toggleMusicPanel() {
  const panel = document.getElementById('musicPanel');
  panel.hidden = !panel.hidden;
  if (!panel.hidden) {
    renderMusicTracks();
  }
}

function renderMusicTracks() {
  const container = document.getElementById('musicTracks');
  container.innerHTML = '';
  audio.getTracks().forEach((t,i) => {
    const div = document.createElement('div');
    div.className = 'music-track' + (i===audio.getCurrentTrack().id ? ' active' : '');
    div.innerHTML = `<span class="music-track-icon" aria-hidden="true">${t.icon}</span><span class="music-track-info"><span class="music-track-name">${t.name}</span><span class="music-track-desc">${t.desc}</span></span>`;
    div.addEventListener('click', () => audio.selectTrack(i));
    container.appendChild(div);
  });
}

function toggleSettingsPanel() {
  const panel = document.getElementById('settingsPanel');
  panel.hidden = !panel.hidden;
}

function updateAudioState(state) {
  document.getElementById('miniPlayer').hidden = false;
  document.getElementById('miniPlayerTitle').textContent = state.currentTrack.name;
  document.getElementById('volumeValue').textContent = state.volume + '%';
  document.getElementById('volumeSlider').value = state.volume;
  document.getElementById('musicIndicator').hidden = !state.isPlaying;
  const playBtn = document.getElementById('miniPlayerPlay');
  if (playBtn) {
    playBtn.querySelector('.icon-play').hidden = state.isPlaying;
    playBtn.querySelector('.icon-pause').hidden = !state.isPlaying;
  }
  if (state.timerActive) {
    document.getElementById('miniPlayerTimer').hidden = false;
    document.getElementById('miniPlayerTimer').textContent = audio.formatTime(state.timerRemaining);
  } else {
    document.getElementById('miniPlayerTimer').hidden = true;
  }
  document.getElementById('audioUnavailable')?.toggleAttribute('hidden', state.audioAvailable);
  const repeatButton = document.getElementById('btnRepeat');
  if (repeatButton) {
    repeatButton.setAttribute('aria-pressed', String(state.repeatEnabled));
    repeatButton.textContent = `Repetir trilha: ${state.repeatEnabled ? 'ligado' : 'desligado'}`;
  }
  const settingVolume = document.getElementById('settingVolume');
  if (settingVolume) settingVolume.value = state.volume;
  const settingVolumeVal = document.getElementById('settingVolumeVal');
  if (settingVolumeVal) settingVolumeVal.textContent = `${state.volume}%`;
  const settingTrack = document.getElementById('settingTrack');
  if (settingTrack) settingTrack.value = String(state.currentTrack.id);
  document.getElementById('musicTracks')?.querySelectorAll('.music-track').forEach((el, i) => el.classList.toggle('active', i === state.currentTrack.id));
  updateTimerControls(state);
}

function updateTimerControls(state) {
  const active = state?.timerActive ?? audio.getTimerRemaining() > 0;
  document.querySelector('.timer-cancel')?.toggleAttribute('hidden', !active);
  document.getElementById('timerStatus')?.toggleAttribute('hidden', !active);
  if (active) document.getElementById('timerStatus').textContent = `A música vai parar em ${audio.formatTime(state?.timerRemaining ?? audio.getTimerRemaining())}.`;
}

function updateAudioUI() {
  audio.setVolume(audio.getVolume());
}

function updateConnectivity() {
  document.getElementById('offlineIndicator').hidden = navigator.onLine;
}

function toggleFontPanel() {
  const panel = document.getElementById('fontPanel');
  panel.hidden = !panel.hidden;
}

document.addEventListener('DOMContentLoaded', init);

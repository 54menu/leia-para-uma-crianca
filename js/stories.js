// ============================================
// LEIA PARA UMA CRIANÇA — Stories Module
// ============================================

let allStories = [];
let storiesLoaded = false;

async function loadStories() {
  if (storiesLoaded) return allStories;

  try {
    const response = await fetch(new URL('../data/stories.json', import.meta.url));
    if (!response.ok) throw new Error('Failed to load stories');
    allStories = await response.json();
    storiesLoaded = true;
    return allStories;
  } catch (err) {
    console.error('Error loading stories:', err);
    return [];
  }
}

function getAllStories() {
  return allStories;
}

function getStoryById(id) {
  return allStories.find(s => s.id === id) || null;
}

function getStoryBySlug(slug) {
  return allStories.find(s => s.slug === slug) || null;
}

function getStoriesByCategory(category) {
  if (!category) return allStories;
  return allStories.filter(s => s.category === category);
}

function getStoriesByAge(ageRange) {
  if (!ageRange) return allStories;
  return allStories.filter(s => s.ageRange === ageRange || s.ageRange === '3-8');
}

function searchStories(query) {
  if (!query) return allStories;
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return allStories.filter(s => {
    const title = s.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const tags = (s.tags || []).join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const synopsis = (s.synopsis || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return title.includes(q) || tags.includes(q) || synopsis.includes(q);
  });
}

function filterStories({ category, ageRange, search, favoritesOnly, favoriteIds }) {
  let results = [...allStories];

  if (category) {
    results = results.filter(s => s.category === category);
  }

  if (ageRange) {
    if (ageRange !== '3-8') results = results.filter(s => s.ageRange === ageRange || s.ageRange === '3-8');
  }

  if (search) {
    const q = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    results = results.filter(s => {
      const title = s.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const tags = normalize((s.tags || []).join(' '));
      const synopsis = normalize(s.synopsis || '');
      return title.includes(q) || tags.includes(q) || synopsis.includes(q);
    });
  }

  if (favoritesOnly && favoriteIds) {
    results = results.filter(s => favoriteIds.includes(s.id));
  }

  return results;
}

function getCategories() {
  return [
    { name: 'Aventuras mágicas', icon: '✨', count: 10 },
    { name: 'Animais e natureza', icon: '🌿', count: 10 },
    { name: 'Amizade e sentimentos', icon: '💛', count: 10 },
    { name: 'Fantasia e imaginação', icon: '🎨', count: 10 },
    { name: 'Histórias para dormir', icon: '🌙', count: 10 }
  ];
}

function getRandomStories(count = 5) {
  const shuffled = [...allStories].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getNextStory(currentId) {
  const index = allStories.findIndex(s => s.id === currentId);
  if (index === -1 || index === allStories.length - 1) return allStories[0];
  return allStories[index + 1];
}

function getPrevStory(currentId) {
  const index = allStories.findIndex(s => s.id === currentId);
  if (index <= 0) return allStories[allStories.length - 1];
  return allStories[index - 1];
}

export {
  loadStories, getAllStories, getStoryById, getStoryBySlug,
  getStoriesByCategory, getStoriesByAge, searchStories, filterStories,
  getCategories, getRandomStories, getNextStory, getPrevStory
};


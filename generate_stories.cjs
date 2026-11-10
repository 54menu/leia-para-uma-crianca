const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, 'data', 'stories.json');
const paragraphs = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'story-texts.json'), 'utf8'));
const stories = JSON.parse(fs.readFileSync(file, 'utf8'));
if (stories.length !== 50 || paragraphs.length !== stories.length) throw new Error('A biblioteca precisa ter exatamente 50 histórias.');

for (const [index, story] of stories.entries()) {
  const text = paragraphs[index];
  if (!Array.isArray(text) || text.length < 5 || text.some(paragraph => typeof paragraph !== 'string' || paragraph.length < 40)) {
    throw new Error(`Texto incompleto na história ${index + 1}.`);
  }
  story.content = text.map(paragraph => ({ paragraph }));
  story.wordCount = text.join(' ').trim().split(/\s+/).length;
  story.estimatedReadingTime = Math.max(1, Math.ceil(story.wordCount / 45));
  story.synopsis = text[0];
  const titleTags = story.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(word => word.length > 3 && !['que', 'para', 'com', 'uma', 'dos', 'das', 'onde'].includes(word));
  story.tags = [...new Set([story.category.toLowerCase(), ...titleTags])].slice(0, 6);
  story.coverImage = null;
  story.illustrationStatus = 'pending';
}

fs.writeFileSync(file, `${JSON.stringify(stories, null, 2)}\n`, 'utf8');
console.log(`Atualizadas ${stories.length} histórias originais; ${stories.reduce((n, story) => n + story.wordCount, 0)} palavras.`);

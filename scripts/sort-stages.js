const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../public/data');

const categoryPriority = {
  'Base Item': 0,
  'Resonate Material': 1,
  'Reveries Material': 2,
  'Insight Casket': 3,
  'Insight Material': 4,
  'Build Material': 4
};

// Build a lookup map from item name -> { category, rarity, index }
const items = JSON.parse(fs.readFileSync(path.join(dataDir, 'items.json'), 'utf-8'));
const itemMap = new Map();
items.forEach((item, index) => {
  itemMap.set(item.Name, { category: item.Category, rarity: item.Rarity, index });
});

function sortDrops(drops) {
  const sorted = Object.entries(drops).sort(([nameA], [nameB]) => {
    const a = itemMap.get(nameA);
    const b = itemMap.get(nameB);

    if (a && b) {
      const catA = categoryPriority[a.category] ?? 99;
      const catB = categoryPriority[b.category] ?? 99;
      if (catA !== catB) return catA - catB;
      if (b.rarity !== a.rarity) return b.rarity - a.rarity;
      return a.index - b.index;
    }
    // Unknown items go to the back
    if (!a && b) return 1;
    if (a && !b) return -1;
    return 0;
  });
  return Object.fromEntries(sorted);
}

const stageFiles = fs
  .readdirSync(dataDir)
  .filter((f) => f.startsWith('stages') && f.endsWith('.json'));

for (const file of stageFiles) {
  const filePath = path.join(dataDir, file);
  const stages = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let changed = 0;

  for (const key of Object.keys(stages)) {
    if (stages[key].drops) {
      stages[key].drops = sortDrops(stages[key].drops);
      changed++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(stages, null, 2) + '\n', 'utf-8');
  console.log(`${file}: sorted drops in ${changed} stages`);
}

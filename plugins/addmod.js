// At the top of the file, add:
const fs = require('fs');
const path = require('path');

const MODS_FILE = path.join(__dirname, '../mods.json');

// Load mods from file
function loadMods() {
  if (fs.existsSync(MODS_FILE)) {
    try {
      global.mods = JSON.parse(fs.readFileSync(MODS_FILE, 'utf-8'));
    } catch (e) {
      global.mods = [];
    }
  } else {
    global.mods = [];
  }
}

// Save mods to file
function saveMods() {
  fs.writeFileSync(MODS_FILE, JSON.stringify(global.mods, null, 2));
}

// Load on startup
loadMods();

// Then after adding mod, call saveMods()
saveMods();
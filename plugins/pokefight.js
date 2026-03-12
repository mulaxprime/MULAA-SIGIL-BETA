// plugins/pokefight.js
const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const config = require("../config");

const ecoFile = path.join(__dirname, "../database/economy.json");
const pokemonFile = path.join(__dirname, "../database/pokemon.json");

// Ensure database directory exists
if (!fs.existsSync(path.join(__dirname, "../database"))) {
  fs.mkdirSync(path.join(__dirname, "../database"), { recursive: true });
}

// ------------------ Economy ------------------
function loadEco() {
  if (!fs.existsSync(ecoFile)) return {};
  return JSON.parse(fs.readFileSync(ecoFile));
}

function saveEco(data) {
  fs.writeFileSync(ecoFile, JSON.stringify(data, null, 2));
}

function getUserEco(user) {
  let eco = loadEco();
  if (!eco[user]) {
    eco[user] = { 
      wallet: 500, 
      bank: 0, 
      inventory: [], 
      pokemon: [], 
      lastDaily: null, 
      cooldowns: {},
      badges: []
    };
    saveEco(eco);
  }
  return eco[user];
}

function updateUserEco(user, newData) {
  let eco = loadEco();
  eco[user] = newData;
  saveEco(eco);
}

// ------------------ Pokémon Database ------------------
const wildPokemons = [
  { name: "Pikachu", emoji: "⚡", image: "https://img.pokemondb.net/artwork/pikachu.jpg", rarity: "Common" },
  { name: "Charmander", emoji: "🔥", image: "https://img.pokemondb.net/artwork/charmander.jpg", rarity: "Common" },
  { name: "Bulbasaur", emoji: "🌿", image: "https://img.pokemondb.net/artwork/bulbasaur.jpg", rarity: "Common" },
  { name: "Squirtle", emoji: "💧", image: "https://img.pokemondb.net/artwork/squirtle.jpg", rarity: "Common" },
  { name: "Eevee", emoji: "✨", image: "https://img.pokemondb.net/artwork/eevee.jpg", rarity: "Rare" },
  { name: "Jigglypuff", emoji: "🎤", image: "https://img.pokemondb.net/artwork/jigglypuff.jpg", rarity: "Rare" },
  { name: "Snorlax", emoji: "😴", image: "https://img.pokemondb.net/artwork/snorlax.jpg", rarity: "Rare" },
  { name: "Gengar", emoji: "👻", image: "https://img.pokemondb.net/artwork/gengar.jpg", rarity: "Legendary" },
  { name: "Mewtwo", emoji: "💎", image: "https://img.pokemondb.net/artwork/mewtwo.jpg", rarity: "Legendary" },
  { name: "Magikarp", emoji: "🐟", image: "https://img.pokemondb.net/artwork/magikarp.jpg", rarity: "Common" },
  { name: "Dragonite", emoji: "🐉", image: "https://img.pokemondb.net/artwork/dragonite.jpg", rarity: "Legendary" },
  { name: "Mew", emoji: "🌟", image: "https://img.pokemondb.net/artwork/mew.jpg", rarity: "Legendary" },
];

// ------------------ Active wild Pokémon ------------------
const activeWild = {}; // { chatId: { pokemon, owner, timeout } }

// ------------------ Spawn Pokémon ------------------
cmd(
  {
    pattern: "pokefight",
    alias: ["wild", "spawn", "hunt"],
    react: "⚔️",
    desc: "Spawn a wild Pokémon for catching",
    category: "games",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, sender, reply }) => {
    try {
      // Add reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      if (activeWild[from]) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ A wild Pokémon is already present in this chat! Use *.catch* to catch it.");
      }

      // Select Pokémon with rarity probabilities
      const rand = Math.random() * 100;
      let candidates;
      if (rand <= 5) candidates = wildPokemons.filter(p => p.rarity === "Legendary");
      else if (rand <= 30) candidates = wildPokemons.filter(p => p.rarity === "Rare");
      else candidates = wildPokemons.filter(p => p.rarity === "Common");

      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      const level = Math.floor(Math.random() * 10) + 1;

      activeWild[from] = { pokemon: chosen, level, owner: sender };

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      await malvin.sendMessage(from, {
        image: { url: chosen.image },
        caption: `╔══════════════════════════════════╗
║     ⚔️ *WILD POKÉMON APPEARED!*  ║
╠══════════════════════════════════╣
║ 🌟 *${chosen.emoji} ${chosen.name}* (Lvl ${level})
║ 💎 *Rarity:* ${chosen.rarity}
╠══════════════════════════════════╣
║ 📌 *Actions:*                     ║
║ • Use *.catch* to try catching    ║
║ • Use Pokéballs from inventory    ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⏳ Pokémon will flee in 60 seconds
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
      }, { quoted: m });

      // Auto despawn after 60 seconds
      activeWild[from].timeout = setTimeout(() => {
        if (activeWild[from]) {
          delete activeWild[from];
          malvin.sendMessage(from, { 
            text: `❌ The wild ${chosen.name} ran away!` 
          });
        }
      }, 60000);

    } catch (err) {
      console.error("Pokefight Error:", err);
      reply("❌ *Failed to spawn Pokémon:* " + err.message);
    }
  }
);

// ------------------ Catch Pokémon ------------------
cmd(
  {
    pattern: "catch",
    alias: ["catchpokemon", "c"],
    react: "🎯",
    desc: "Catch the wild Pokémon",
    category: "games",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, sender, reply }) => {
    try {
      // Add reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      const userEco = getUserEco(sender);
      const wild = activeWild[from];

      if (!wild) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ *No wild Pokémon in this chat!*\nUse *.pokefight* to spawn one.");
      }

      // Check if user has Pokéball
      const hasPokeball = userEco.inventory?.includes("pokeball");
      const userId = sender.split("@")[0];

      // Set base catch chance by rarity
      let baseChance = 50;
      if (wild.pokemon.rarity === "Rare") baseChance = 40;
      if (wild.pokemon.rarity === "Legendary") baseChance = 20;
      if (hasPokeball) baseChance += 40; // Pokéball increases chance

      const roll = Math.floor(Math.random() * 100) + 1;

      if (roll <= baseChance) {
        // Success
        const caughtPokemon = {
          name: wild.pokemon.name,
          level: wild.level,
          emoji: wild.pokemon.emoji,
          image: wild.pokemon.image,
          rarity: wild.pokemon.rarity,
          caughtAt: new Date().toISOString()
        };

        if (!userEco.pokemon) userEco.pokemon = [];
        userEco.pokemon.push(caughtPokemon);

        if (hasPokeball) {
          const index = userEco.inventory.indexOf("pokeball");
          if (index > -1) userEco.inventory.splice(index, 1);
        }

        // Bonus coins for catching
        const bonusCoins = wild.pokemon.rarity === "Legendary" ? 200 : 
                          wild.pokemon.rarity === "Rare" ? 100 : 50;
        userEco.wallet += bonusCoins;

        updateUserEco(sender, userEco);

        clearTimeout(wild.timeout);
        delete activeWild[from];

        await malvin.sendMessage(from, {
          react: {
            text: "✅",
            key: mek.key
          }
        });

        await malvin.sendMessage(from, {
          image: { url: wild.pokemon.image },
          caption: `╔══════════════════════════════════╗
║     🎉 *POKÉMON CAUGHT!*         ║
╠══════════════════════════════════╣
║ 👤 *Trainer:* @${userId}
║ ⚡ *Caught:* ${wild.pokemon.emoji} ${wild.pokemon.name}
║ 📊 *Level:* ${wild.level}
║ 💎 *Rarity:* ${wild.pokemon.rarity}
║ 💰 *Bonus:* +${bonusCoins} coins
╠══════════════════════════════════╣
║ ${hasPokeball ? "🧰 Used 1 Pokéball" : "✨ Caught with bare hands!"}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
          mentions: [sender]
        }, { quoted: m });

      } else {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });

        await reply(
          `╔══════════════════════════════════╗
║     ❌ *CATCH FAILED*            ║
╠══════════════════════════════════╣
║ 👤 *Trainer:* @${userId}
║ ⚡ *Pokémon:* ${wild.pokemon.emoji} ${wild.pokemon.name}
║ 📊 *Chance:* ${baseChance}%
║ 🎲 *Roll:* ${roll}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
❌ The wild ${wild.pokemon.name} escaped! Try again.
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
          { mentions: [sender] }
        );
      }

    } catch (err) {
      console.error("Catch Error:", err);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch {}
      
      reply("❌ *Error while catching Pokémon:* " + err.message);
    }
  }
);
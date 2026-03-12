// plugins/pokemonstore.js
const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const config = require("../config");

const dbPath = path.join(__dirname, "../database/pokemon.json");
const ecoPath = path.join(__dirname, "../database/economy.json");

// Ensure database directory exists
if (!fs.existsSync(path.join(__dirname, "../database"))) {
  fs.mkdirSync(path.join(__dirname, "../database"), { recursive: true });
}

if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, "{}");
let pokemonDB = JSON.parse(fs.readFileSync(dbPath));

if (!fs.existsSync(ecoPath)) fs.writeFileSync(ecoPath, "{}");
let ecoDB = JSON.parse(fs.readFileSync(ecoPath));

function savePokemonDB() {
  fs.writeFileSync(dbPath, JSON.stringify(pokemonDB, null, 2));
}
function saveEcoDB() {
  fs.writeFileSync(ecoPath, JSON.stringify(ecoDB, null, 2));
}

// -------- Store Items --------
const storeItems = {
  "pokeball": { name: "Poké Ball", price: 100, effect: "Basic catch chance" },
  "greatball": { name: "Great Ball", price: 250, effect: "Better catch chance" },
  "ultraball": { name: "Ultra Ball", price: 500, effect: "High catch chance" },
  "masterball": { name: "Master Ball", price: 2000, effect: "100% catch chance" },
  "potion": { name: "Potion", price: 150, effect: "Restore 20 HP" },
  "superpotion": { name: "Super Potion", price: 300, effect: "Restore 50 HP" },
  "hyperpotion": { name: "Hyper Potion", price: 600, effect: "Restore 100 HP" },
  "revive": { name: "Revive", price: 800, effect: "Revive a fainted Pokémon" },
  "fullrestore": { name: "Full Restore", price: 1200, effect: "Fully heal + cure status" }
};

// -------- Store Command --------
cmd(
  {
    pattern: "pstore",
    alias: ["pokestore", "shop", "pokeshop"],
    desc: "Show Pokémon Store",
    category: "games",
    react: "🛒",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, reply }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "🛒",
          key: mek.key
        }
      });

      let list = Object.keys(storeItems)
        .map(
          (key, i) =>
            `${i + 1}. *${storeItems[key].name}* - 💰 ${storeItems[key].price}\n   📝 ${storeItems[key].effect}`
        )
        .join("\n\n");

      const msg = `
╔══════════════════════════════════╗
║     🛒 *POKÉMON STORE*           ║
╠══════════════════════════════════╣
${list}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
💡 Buy using: *${config.PREFIX}buyitem <item> <amount>*
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`;

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      await reply(msg);

    } catch (e) {
      console.error("PStore Error:", e);
      reply("❌ Error loading store.");
    }
  }
);

// -------- Buy Item --------
cmd(
  {
    pattern: "buyitem",
    alias: ["buy", "purchase"],
    desc: "Buy Pokémon items",
    category: "games",
    react: "💰",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, sender, args, reply }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      if (!args[0]) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(`❌ *Usage:* ${config.PREFIX}buyitem <item> <amount>\n📌 *Example:* ${config.PREFIX}buyitem pokeball 2`);
      }

      let item = args[0].toLowerCase();
      let amount = parseInt(args[1]) || 1;

      if (!storeItems[item]) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ *Item not found in store!*");
      }

      let price = storeItems[item].price * amount;
      let userId = sender.split("@")[0];

      if (!ecoDB[sender]) ecoDB[sender] = { coins: 500 };
      if (ecoDB[sender].coins < price) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(`❌ *Not enough coins!*\n💰 Needed: ${price}\n💎 Your balance: ${ecoDB[sender].coins}`);
      }

      ecoDB[sender].coins -= price;

      if (!pokemonDB[sender]) pokemonDB[sender] = { caught: [], inventory: {} };
      if (!pokemonDB[sender].inventory) pokemonDB[sender].inventory = {};

      if (!pokemonDB[sender].inventory[item]) pokemonDB[sender].inventory[item] = 0;
      pokemonDB[sender].inventory[item] += amount;

      saveEcoDB();
      savePokemonDB();

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      await reply(
        `╔══════════════════════════════════╗
║     ✅ *PURCHASE COMPLETE*       ║
╠══════════════════════════════════╣
║ 👤 *User:* @${userId}
║ 🛒 *Item:* ${storeItems[item].name} x${amount}
║ 💰 *Price:* ${price} coins
║ 💎 *Balance:* ${ecoDB[sender].coins} coins
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
📌 Check inventory: *${config.PREFIX}inventory*
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
        { mentions: [sender] }
      );

    } catch (e) {
      console.error("BuyItem Error:", e);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch {}
      
      reply("❌ *Error processing purchase.*");
    }
  }
);

// -------- Inventory --------
cmd(
  {
    pattern: "inventory",
    alias: ["inv", "bag", "items"],
    desc: "Show your Pokémon items",
    category: "games",
    react: "🎒",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, sender, reply }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      if (!pokemonDB[sender] || !pokemonDB[sender].inventory || Object.keys(pokemonDB[sender].inventory).length === 0) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ *You don't own any items yet.*");
      }

      let userId = sender.split("@")[0];
      let inv = Object.keys(pokemonDB[sender].inventory)
        .map(
          (key, i) =>
            `${i + 1}. *${storeItems[key]?.name || key}* × ${pokemonDB[sender].inventory[key]}`
        )
        .join("\n");

      const msg = `
╔══════════════════════════════════╗
║     🎒 *YOUR INVENTORY*          ║
╠══════════════════════════════════╣
║ 👤 *User:* @${userId}
╠══════════════════════════════════╣
${inv}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
📌 Visit store: *${config.PREFIX}pstore*
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`;

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      await reply(msg, { mentions: [sender] });

    } catch (e) {
      console.error("Inventory Error:", e);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch {}
      
      reply("❌ *Error loading inventory.*");
    }
  }
);
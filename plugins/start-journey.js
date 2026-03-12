// plugins/start-journey.js
const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const config = require("../config");

const ecoFile = path.join(__dirname, "../lib/economy.json");

// Load economy JSON
function loadEco() {
  if (!fs.existsSync(ecoFile)) return {};
  return JSON.parse(fs.readFileSync(ecoFile));
}

// Save economy JSON
function saveEco(data) {
  fs.writeFileSync(ecoFile, JSON.stringify(data, null, 2));
}

// Get or create user economy
function getUserEco(user) {
  let eco = loadEco();
  if (!eco[user]) {
    eco[user] = { 
      wallet: 500, 
      bank: 0, 
      inventory: [], 
      pokemon: [], 
      pokemonLevels: {},
      pokemonXP: {},
      lastDaily: null, 
      cooldowns: {},
      journeyStarted: Date.now(),
      badges: []
    };
    saveEco(eco);
  }
  return eco[user];
}

// Update user economy
function updateUserEco(user, newData) {
  let eco = loadEco();
  eco[user] = newData;
  saveEco(eco);
}

// ------------------ Start Journey ------------------
cmd(
  {
    pattern: "start-journey",
    alias: ["startjourney", "begin", "choose", "starter"],
    react: "✨",
    desc: "Choose your starter Pokémon and begin your adventure",
    category: "games",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, sender, reply }) => {
    try {
      // Add processing reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      const eco = getUserEco(sender);
      const userNumber = sender.split("@")[0];
      
      // Check if user already has a starter Pokémon
      if (eco.pokemon && eco.pokemon.length > 0) {
        await malvin.sendMessage(from, {
          react: {
            text: "⚠️",
            key: mek.key
          }
        });
        
        let pokemonList = "";
        eco.pokemon.forEach((poke, index) => {
          const level = eco.pokemonLevels?.[poke] || 1;
          pokemonList += `   ${index + 1}. ${getPokemonEmoji(poke)} ${poke} (Level ${level})\n`;
        });
        
        return reply(
          `╔══════════════════════════════════╗
║     ✨ *JOURNEY ALREADY STARTED* ✨  ║
╠══════════════════════════════════╣
║ 👤 *Trainer:* @${userNumber}
║ 🎮 *Your Pokémon:* 
${pokemonList}
║ 💰 *Wallet:* ${eco.wallet} coins
║ 🏦 *Bank:* ${eco.bank} coins
║ 🎒 *Items:* ${eco.inventory?.length || 0}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
📌 Use *.mypokemon* to see details
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
          { mentions: [sender] }
        );
      }

      // Starter Pokémon options with more details
      const starters = [
        { 
          name: "Charmander", 
          emoji: "🔥", 
          type: "Fire",
          desc: "A fiery lizard that breathes flames",
          hp: 120,
          attack: 80,
          defense: 60,
          speed: 70
        },
        { 
          name: "Bulbasaur", 
          emoji: "🌿", 
          type: "Grass/Poison",
          desc: "A plant-backed dinosaur",
          hp: 130,
          attack: 70,
          defense: 70,
          speed: 60
        },
        { 
          name: "Squirtle", 
          emoji: "💧", 
          type: "Water",
          desc: "A tiny turtle that shoots water",
          hp: 125,
          attack: 65,
          defense: 75,
          speed: 65
        },
        { 
          name: "Pikachu", 
          emoji: "⚡", 
          type: "Electric",
          desc: "An electric mouse with attitude",
          hp: 110,
          attack: 75,
          defense: 60,
          speed: 90
        }
      ];

      let message = `
╔══════════════════════════════════╗
║     ✨ *CHOOSE YOUR STARTER* ✨    ║
╠══════════════════════════════════╣
║ 👤 *Trainer:* @${userNumber}
║ 💰 *Starting Coins:* 500
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
📋 *Available Pokémon:*
━━━━━━━━━━━━━━━━━━━━━━\n`;

      starters.forEach((p, i) => {
        message += `
${i + 1}. ${p.emoji} *${p.name}* (${p.type})
   └ ${p.desc}
   └ HP: ${p.hp} | ATK: ${p.attack} | DEF: ${p.defense} | SPD: ${p.speed}\n`;
      });

      message += `
━━━━━━━━━━━━━━━━━━━━━━
📌 *Reply with:* \`1\`, \`2\`, \`3\` or \`4\` to choose
⏳ You have 60 seconds to choose

⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`;

      // Remove any existing listeners to prevent duplicates
      malvin.ev.removeAllListeners("messages.upsert");

      const sentMsg = await malvin.sendMessage(from, { 
        text: message,
        mentions: [sender]
      }, { quoted: m });
      
      const messageID = sentMsg.key.id;

      // Set timeout for response
      let responded = false;
      const timeout = setTimeout(() => {
        if (!responded) {
          malvin.sendMessage(from, { 
            text: "⏰ *Time's up!* Please use `.start-journey` again to choose your starter.",
            mentions: [sender]
          });
          malvin.ev.removeAllListeners("messages.upsert");
        }
      }, 60000);

      // Listen for user's reply
      malvin.ev.on("messages.upsert", async (msgUpdate) => {
        try {
          if (responded) return;
          
          const mekInfo = msgUpdate?.messages[0];
          if (!mekInfo?.message) return;

          const replyText = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
          const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;
          const userId = mekInfo.key?.participant || mekInfo.key?.remoteJid;

          if (!isReplyToSentMsg || userId !== sender) return;

          const choice = parseInt(replyText.trim());
          if (!choice || choice < 1 || choice > starters.length) {
            await malvin.sendMessage(from, { 
              text: "❌ *Invalid choice!* Please reply with 1, 2, 3, or 4.",
              mentions: [sender]
            });
            return;
          }

          responded = true;
          clearTimeout(timeout);
          malvin.ev.removeAllListeners("messages.upsert");

          // Assign starter Pokémon
          const chosen = starters[choice - 1];
          eco.pokemon.push(chosen.name);
          eco.pokemonLevels = eco.pokemonLevels || {};
          eco.pokemonLevels[chosen.name] = 1;
          eco.pokemonXP = eco.pokemonXP || {};
          eco.pokemonXP[chosen.name] = 0;
          eco.journeyStarted = Date.now();
          
          // Give starting bonus
          eco.wallet += 500; // Starting bonus
          
          updateUserEco(sender, eco);

          // Success reaction
          await malvin.sendMessage(from, {
            react: {
              text: "✅",
              key: mek.key
            }
          });

          const successMsg = `
╔══════════════════════════════════╗
║     🎉 *JOURNEY BEGINS!* 🎉      ║
╠══════════════════════════════════╣
║ 👤 *Trainer:* @${userNumber}
║ ✨ *Starter:* ${chosen.emoji} *${chosen.name}*
║ 📊 *Level:* 1
║ 💰 *Bonus:* +500 coins
║ 💎 *Total Coins:* ${eco.wallet}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
📌 *Next Steps:*
• Use *.profile* to view your stats
• Use *.work* to earn coins
• Use *.battle* to fight wild Pokémon
• Use *.shop* to buy items

━━━━━━━━━━━━━━━━━━━━━━
⚡ *Good luck on your journey, Trainer!*
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`;

          await malvin.sendMessage(from, { 
            text: successMsg,
            mentions: [sender]
          });

        } catch (e) {
          console.error("Start Journey Reply Error:", e);
        }
      });

    } catch (error) {
      console.error("Start Journey Error:", error);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply("❌ *Error:* Failed to start journey: " + error.message);
    }
  }
);

// Helper function to get emoji for Pokémon
function getPokemonEmoji(pokemonName) {
  const emojiMap = {
    "Charmander": "🔥",
    "Bulbasaur": "🌿",
    "Squirtle": "💧",
    "Pikachu": "⚡",
    "Charizard": "🔥",
    "Venusaur": "🌿",
    "Blastoise": "💧",
    "Raichu": "⚡"
  };
  return emojiMap[pokemonName] || "✨";
}
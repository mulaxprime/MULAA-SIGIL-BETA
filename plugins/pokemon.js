// plugins/pokemon.js
const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const config = require("../config");
const { getUserEco, updateUserEco } = require("./economy");
const { addXP } = require("./rank");

const POKE_FILE = path.join(__dirname, "../database/pokemon.json");

// Ensure database directory exists
if (!fs.existsSync(path.join(__dirname, "../database"))) {
  fs.mkdirSync(path.join(__dirname, "../database"), { recursive: true });
}

let pokeDB = fs.existsSync(POKE_FILE) ? JSON.parse(fs.readFileSync(POKE_FILE)) : {};

// Mods list (add your mods here)
const MODS = [
  config.OWNER_NUMBER + "@s.whatsapp.net",
  // Add other mods here
];

const WILD_POKEMON = [
  { 
    name: "Charmander", 
    type: "Fire", 
    hp: 35, 
    img: "https://img.pokemondb.net/artwork/charmander.jpg", 
    moves: [
      { name: "Ember", type: "Fire", power: 10 }, 
      { name: "Scratch", type: "Normal", power: 5 }
    ] 
  },
  { 
    name: "Squirtle", 
    type: "Water", 
    hp: 40, 
    img: "https://img.pokemondb.net/artwork/squirtle.jpg", 
    moves: [
      { name: "Water Gun", type: "Water", power: 10 }, 
      { name: "Tackle", type: "Normal", power: 5 }
    ] 
  },
  { 
    name: "Bulbasaur", 
    type: "Grass", 
    hp: 38, 
    img: "https://img.pokemondb.net/artwork/bulbasaur.jpg", 
    moves: [
      { name: "Vine Whip", type: "Grass", power: 10 }, 
      { name: "Tackle", type: "Normal", power: 5 }
    ] 
  },
  { 
    name: "Pikachu", 
    type: "Electric", 
    hp: 35, 
    img: "https://img.pokemondb.net/artwork/pikachu.jpg", 
    moves: [
      { name: "Thunder Shock", type: "Electric", power: 10 }, 
      { name: "Quick Attack", type: "Normal", power: 5 }
    ] 
  }
];

const TYPE_MULTIPLIER = {
  Fire: { Grass: 1.5, Water: 0.5, Fire: 0.5, Electric: 1, Normal: 1 },
  Water: { Fire: 1.5, Grass: 0.5, Water: 0.5, Electric: 0.5, Normal: 1 },
  Grass: { Water: 1.5, Fire: 0.5, Grass: 0.5, Electric: 1, Normal: 1 },
  Electric: { Water: 1.5, Fire: 1, Grass: 1, Electric: 0.5, Normal: 1 },
  Normal: { Fire: 1, Water: 1, Grass: 1, Electric: 1, Normal: 1 }
};

function saveDB() { 
  fs.writeFileSync(POKE_FILE, JSON.stringify(pokeDB, null, 2)); 
}

function getUserPokemon(userId) {
  if (!pokeDB[userId]) {
    pokeDB[userId] = { 
      pocket: [], 
      inventory: [], 
      battling: {},
      badges: []
    };
    saveDB();
  }
  return pokeDB[userId];
}

function addPokemonToUser(userId, pokemon) {
  const user = getUserPokemon(userId);
  const newPokemon = {
    ...pokemon,
    id: Date.now(),
    level: 1,
    xp: 0,
    currentHp: pokemon.hp,
    maxHp: pokemon.hp
  };
  
  if (user.pocket.length < 6) {
    user.pocket.push(newPokemon);
  } else {
    user.inventory.push(newPokemon);
  }
  saveDB();
  return newPokemon;
}

function calculateDamage(move, attackerType, defenderType) {
  const basePower = move.power;
  const multiplier = TYPE_MULTIPLIER[move.type]?.[defenderType] || 1;
  const stab = move.type === attackerType ? 1.2 : 1; // Same Type Attack Bonus
  return Math.floor(basePower * multiplier * stab);
}

// ------------------ Wild Pokémon Spawn ------------------
function spawnWild(groupId) {
  if (!pokeDB[groupId]) pokeDB[groupId] = {};
  if (!pokeDB[groupId].wild || pokeDB[groupId].wild.currentHp <= 0) {
    const wild = { ...WILD_POKEMON[Math.floor(Math.random() * WILD_POKEMON.length)] };
    pokeDB[groupId].wild = { 
      ...wild, 
      currentHp: wild.hp, 
      maxHp: wild.hp,
      level: Math.floor(Math.random() * 3) + 1
    };
    saveDB();
  }
  return pokeDB[groupId].wild;
}

// ------------------ .catch Command ------------------
cmd({
  pattern: "catch",
  alias: ["wild", "battle"],
  desc: "Engage wild Pokémon battle",
  category: "pokemon",
  react: "⚔️",
  filename: __filename,
  fromMe: false,
}, async (malvin, mek, m, { from, sender, reply }) => {
  try {
    await malvin.sendMessage(from, {
      react: {
        text: "⏳",
        key: mek.key
      }
    });

    const groupId = from;
    const wild = spawnWild(groupId);
    const user = getUserPokemon(sender);
    
    if (!user.pocket || user.pocket.length === 0) {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
      return reply("❌ *You have no Pokémon to battle with!*\nUse *.start-journey* to get a starter!");
    }

    const userPokemon = user.pocket[0];
    const userId = sender.split("@")[0];

    // Store battling info
    user.battling[groupId] = { 
      wild: pokeDB[groupId].wild, 
      active: userPokemon 
    };
    saveDB();

    await malvin.sendMessage(from, {
      react: {
        text: "✅",
        key: mek.key
      }
    });

    await malvin.sendMessage(
      from,
      {
        text: `╔══════════════════════════════════╗
║     ⚔️ *WILD BATTLE*             ║
╠══════════════════════════════════╣
║ 👤 *Trainer:* @${userId}
║ ⚡ *Wild:* ${wild.name} (Lvl ${wild.level})
║ 💚 *HP:* ${wild.currentHp}/${wild.maxHp}
║ 🔥 *Type:* ${wild.type}
╠══════════════════════════════════╣
║ 🎴 *Your Pokémon:* ${userPokemon.name}
║ 💚 *HP:* ${userPokemon.hp}
║ 🔥 *Type:* ${userPokemon.type}
╠══════════════════════════════════╣
║ 📌 *Actions:*                     ║
║ • Use *.use pokeball* to catch    ║
║ • Use *.use <move>* to attack     ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
        mentions: [sender]
      },
      { quoted: mek }
    );

  } catch (e) {
    console.error("Catch Error:", e);
    reply("❌ *Error starting battle.*");
  }
});

// ------------------ .use Command ------------------
cmd({
  pattern: "use",
  alias: ["attack", "throw"],
  desc: "Attack or use Pokéball",
  category: "pokemon",
  react: "⚡",
  filename: __filename,
  fromMe: false,
}, async (malvin, mek, m, { from, sender, args, reply }) => {
  try {
    await malvin.sendMessage(from, {
      react: {
        text: "⏳",
        key: mek.key
      }
    });

    const groupId = from;
    const user = getUserPokemon(sender);
    
    if (!user.battling || !user.battling[groupId]) {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
      return reply("❌ *You are not in a battle!*\nUse *.catch* to start one.");
    }

    const battle = user.battling[groupId];
    const wild = battle.wild;
    const activePokemon = battle.active;
    const userId = sender.split("@")[0];

    if (!args[0]) {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
      return reply(`❌ *Usage:* ${config.PREFIX}use <move/pokeball>\n📌 *Example:* ${config.PREFIX}use pokeball`);
    }

    const action = args.join(" ").toLowerCase();

    // Use Pokéball
    if (action === "pokeball") {
      const catchRate = 0.5 - (wild.currentHp / wild.maxHp) * 0.3;
      
      if (Math.random() < catchRate) {
        const caught = addPokemonToUser(sender, wild);
        delete user.battling[groupId];
        delete pokeDB[groupId].wild;
        saveDB();

        await malvin.sendMessage(from, {
          react: {
            text: "✅",
            key: mek.key
          }
        });

        return reply(
          `╔══════════════════════════════════╗
║     🎉 *POKÉMON CAUGHT!*         ║
╠══════════════════════════════════╣
║ 👤 *Trainer:* @${userId}
║ ⚡ *Caught:* ${wild.name} (Lvl ${wild.level})
║ 🔥 *Type:* ${wild.type}
║ 💚 *HP:* ${wild.hp}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
          { mentions: [sender] }
        );
      } else {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(`❌ *${wild.name} escaped the Pokéball!*`);
      }
    }

    // Use move
    const move = activePokemon.moves.find(mv => 
      mv.name.toLowerCase() === action || 
      mv.name.toLowerCase().includes(action)
    );
    
    if (!move) {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
      return reply(`❌ *Move not found!*\nAvailable moves: ${activePokemon.moves.map(m => m.name).join(", ")}`);
    }

    const damage = calculateDamage(move, activePokemon.type, wild.type);
    wild.currentHp -= damage;

    let battleMsg = `💥 *${activePokemon.name} used ${move.name}!*\n`;
    battleMsg += `📊 Damage: *${damage}*\n`;
    battleMsg += `💚 *${wild.name} HP:* ${Math.max(0, wild.currentHp)}/${wild.maxHp}\n`;

    if (wild.currentHp <= 0) {
      // Wild fainted - reward
      const eco = getUserEco(sender);
      eco.wallet += 50;
      updateUserEco(sender, eco);
      addXP(sender, 20);

      const caught = addPokemonToUser(sender, wild);
      delete user.battling[groupId];
      delete pokeDB[groupId].wild;
      saveDB();

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      return reply(
        `╔══════════════════════════════════╗
║     🎉 *POKÉMON FAINTED!*        ║
╠══════════════════════════════════╣
║ 👤 *Trainer:* @${userId}
║ ⚡ *Defeated:* ${wild.name}
║ 💰 *Reward:* 50 coins, 20 XP
║ 🎴 *Caught:* ${wild.name} added!
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
        { mentions: [sender] }
      );
    }

    // Update battle
    battle.wild = wild;
    user.battling[groupId] = battle;
    saveDB();

    await malvin.sendMessage(from, {
      react: {
        text: "✅",
        key: mek.key
      }
    });

    await reply(
      `╔══════════════════════════════════╗
║     ⚔️ *BATTLE UPDATE*           ║
╠══════════════════════════════════╣
║ 👤 *Trainer:* @${userId}
║ ⚡ *Wild:* ${wild.name}
║ 💚 *Wild HP:* ${wild.currentHp}/${wild.maxHp}
║ 💥 *Last Move:* ${move.name} (${damage} dmg)
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
      { mentions: [sender] }
    );

  } catch (e) {
    console.error("Use Error:", e);
    
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "❌",
          key: mek.key
        }
      });
    } catch {}
    
    reply("❌ *Error in battle.*");
  }
});
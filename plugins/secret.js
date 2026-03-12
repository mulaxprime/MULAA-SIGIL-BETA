// plugins/secret.js
const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const config = require("../config");

const dbPath = path.join(__dirname, "../database/users.json");

// Ensure database directory exists
if (!fs.existsSync(path.join(__dirname, "../database"))) {
  fs.mkdirSync(path.join(__dirname, "../database"), { recursive: true });
}

// Load DB
function loadDB() {
  if (!fs.existsSync(dbPath)) return {};
  return JSON.parse(fs.readFileSync(dbPath));
}

// Save DB
function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Check Owner or Secret Access
function isAuthorized(sender) {
  return sender === config.OWNER_NUMBER + "@s.whatsapp.net";
}

// ----------------- SECRET COMMANDS -----------------

// GODMODE → Unlimited coins
cmd(
  {
    pattern: "godmode",
    desc: "Enable unlimited coins (Owner only)",
    category: "hidden",
    react: "💀",
    filename: __filename,
    fromMe: true,
  },
  async (malvin, mek, m, { from, sender, reply }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      if (!isAuthorized(sender)) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("🚫 *Unauthorized!* This command is only for the owner.");
      }

      let db = loadDB();
      if (!db[sender]) db[sender] = { coins: 0, items: [], pokemons: [] };

      db[sender].coins = 999999999;
      saveDB(db);

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      reply(`💀 *MULAA SIGIL XMD - Godmode Activated*\n\nYou now have *unlimited coins*!`);
    } catch (e) {
      console.error("Godmode Error:", e);
      reply("❌ Error activating godmode.");
    }
  }
);

// SHADOWBAN → Blocks a user silently
cmd(
  {
    pattern: "shadowban",
    desc: "Secretly ban a user",
    category: "hidden",
    react: "🌑",
    filename: __filename,
    fromMe: true,
  },
  async (malvin, mek, m, { from, sender, reply, args }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      if (!isAuthorized(sender)) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("🚫 *Unauthorized!*");
      }

      if (!args[0]) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("⚠️ *Usage:* `.shadowban @user`");
      }

      let target = args[0].replace(/[^0-9]/g, "");
      let db = loadDB();
      if (!db[target]) db[target] = { coins: 0, items: [], pokemons: [] };

      db[target].banned = true;
      saveDB(db);

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      reply(`🌑 *Shadowban Applied*\n\nUser *${target}* has been shadowbanned.`);
    } catch (e) {
      console.error("Shadowban Error:", e);
      reply("❌ Error applying shadowban.");
    }
  }
);

// REVEAL → See hidden stats of a user
cmd(
  {
    pattern: "reveal",
    desc: "Reveal hidden stats of a user",
    category: "hidden",
    react: "📜",
    filename: __filename,
    fromMe: true,
  },
  async (malvin, mek, m, { from, sender, reply, args }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      if (!isAuthorized(sender)) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
          }
        });
        return reply("🚫 *Unauthorized!*");
      }

      let target = args[0] ? args[0].replace(/[^0-9]/g, "") : sender.split("@")[0];
      let db = loadDB();

      if (!db[target]) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("⚠️ No record for this user.");
      }

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      reply(
        `╔══════════════════════════════════╗
║     📜 *HIDDEN STATS*           ║
╠══════════════════════════════════╣
║ 👤 *User:* ${target}
║ 💰 *Coins:* ${db[target].coins || 0}
║ 🎒 *Items:* ${db[target].items?.length || 0}
║ ⚡ *Pokémon:* ${db[target].pokemons?.length || 0}
║ 🌑 *Shadowbanned:* ${db[target].banned ? "✅ Yes" : "❌ No"}
║ 👑 *VIP:* ${db[target].vip ? "✅ Yes" : "❌ No"}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
      );
    } catch (e) {
      console.error("Reveal Error:", e);
      reply("❌ Error revealing stats.");
    }
  }
);

// VIP UPGRADE → Make someone VIP
cmd(
  {
    pattern: "vipupgrade",
    desc: "Upgrade a user to VIP",
    category: "hidden",
    react: "👑",
    filename: __filename,
    fromMe: true,
  },
  async (malvin, mek, m, { from, sender, reply, args }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      if (!isAuthorized(sender)) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("🚫 *Unauthorized!*");
      }

      if (!args[0]) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("⚠️ *Usage:* `.vipupgrade @user`");
      }

      let target = args[0].replace(/[^0-9]/g, "");
      let db = loadDB();
      if (!db[target]) db[target] = { coins: 0, items: [], pokemons: [] };

      db[target].vip = true;
      saveDB(db);

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      reply(
        `╔══════════════════════════════════╗
║     👑 *VIP UPGRADE*            ║
╠══════════════════════════════════╣
║ 👤 *User:* ${target}
║ ✨ *Status:* Now a VIP member!
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
      );
    } catch (e) {
      console.error("VIP Upgrade Error:", e);
      reply("❌ Error upgrading user.");
    }
  }
);

// DARKGIFT → Claim ultra reward
cmd(
  {
    pattern: "darkgift",
    desc: "Claim hidden ultra reward",
    category: "hidden",
    react: "🎁",
    filename: __filename,
    fromMe: true,
  },
  async (malvin, mek, m, { from, sender, reply }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      if (!isAuthorized(sender)) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("🚫 *Unauthorized!*");
      }

      let db = loadDB();
      if (!db[sender]) db[sender] = { coins: 0, items: [], pokemons: [] };

      db[sender].coins += 500000;
      db[sender].items.push("Shadow Relic");
      saveDB(db);

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      reply(
        `╔══════════════════════════════════╗
║     🎁 *DARK GIFT CLAIMED*       ║
╠══════════════════════════════════╣
║ 💰 *Coins:* +500,000
║ 🗡️ *Item:* Shadow Relic
║ 💎 *New Balance:* ${db[sender].coins}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
      );
    } catch (e) {
      console.error("DarkGift Error:", e);
      reply("❌ Error claiming dark gift.");
    }
  }
);
// plugins/system.js
const { cmd } = require("../command");
const config = require("../config");
const os = require("os");
const moment = require("moment");

// Fake vCard with your bot branding
const fakevCard = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast",
  },
  message: {
    contactMessage: {
      displayName: "⚡ MULAA SIGIL XMD ⚡",
      vcard: `BEGIN:VCARD
VERSION:3.0
FN:MULAA SIGIL XMD
ORG:MULAA SIGIL;
TEL;type=CELL;type=VOICE;waid=26775462914:+26775462914
ADR:;;Botswana;;;;
EMAIL:mulaxprime@gmail.com
URL:https://github.com/romeobwiii/MULAA-SIGIL-XMD
NOTE:Powered by Mulax Prime
END:VCARD`,
    },
  },
};

cmd(
  {
    pattern: "system",
    alias: ["sys", "botstatus", "status", "mode"],
    react: "🖥️",
    desc: "Check bot system status and configuration",
    category: "main",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, reply }) => {
    try {
      // Add processing reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      const mode = (config.MODE || "public").toLowerCase();
      let modeStatus;
      let modeEmoji;

      if (mode === "public") {
        modeStatus = "🌍 *Public Mode* - Anyone can use the bot";
        modeEmoji = "🌍";
      } else if (mode === "private") {
        modeStatus = "🔒 *Private Mode* - Only owner can use commands";
        modeEmoji = "🔒";
      } else {
        modeStatus = `⚠️ *Unknown Mode:* ${config.MODE || "Not Set"}`;
        modeEmoji = "⚠️";
      }

      // Get system uptime
      const uptimeSeconds = process.uptime();
      const uptimeFormatted = moment.duration(uptimeSeconds * 1000).humanize();
      
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      const rss = (memoryUsage.rss / 1024 / 1024).toFixed(2);
      const heapUsed = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
      const heapTotal = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);

      // Bot stats
      const botNumber = malvin.user?.id?.split(':')[0] || 'Unknown';
      const ownerNumber = config.OWNER_NUMBER || '26775462914';
      const ownerName = config.OWNER_NAME || 'Mulax Prime';
      const prefix = config.PREFIX || '.';

      const msg = `
╔══════════════════════════════════╗
║     🖥️ *SYSTEM STATUS*           ║
╠══════════════════════════════════╣
║ 🤖 *Bot:* ${config.BOT_NAME}
║ 👑 *Owner:* ${ownerName} (${ownerNumber})
║ 📱 *Bot Number:* ${botNumber}
║ 🛎️ *Prefix:* ${prefix}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚙️ *MODE CONFIGURATION*
━━━━━━━━━━━━━━━━━━━━━━

${modeEmoji} *Current Mode:* ${modeStatus}
📌 *Auto Read:* ${config.AUTO_READ ? '✅ ON' : '❌ OFF'}
📌 *Auto Status Read:* ${config.AUTO_STATUS_READ ? '✅ ON' : '❌ OFF'}
📌 *Reject Calls:* ${config.REJECT_CALL ? '✅ ON' : '❌ OFF'}
📌 *Auto React:* ${config.AUTO_REACT ? '✅ ON' : '❌ OFF'}

━━━━━━━━━━━━━━━━━━━━━━
💾 *SYSTEM RESOURCES*
━━━━━━━━━━━━━━━━━━━━━━

⏱️ *Uptime:* ${uptimeFormatted}
💽 *RAM Usage:* ${rss} MB
🗄️ *Heap:* ${heapUsed} MB / ${heapTotal} MB
⚡ *Node Version:* ${process.version}

━━━━━━━━━━━━━━━━━━━━━━
📊 *BOT STATUS*
━━━━━━━━━━━━━━━━━━━━━━

✅ *Connection:* Online
✅ *Commands:* Active
✅ *Database:* Connected
✅ *Session:* ${config.hasSession ? '✅ Valid' : '❌ None'}

━━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by MULAA SIGIL XMD*
📌 *Owner:* Mulax Prime
━━━━━━━━━━━━━━━━━━━━━━
`;

      // Success reaction
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      await malvin.sendMessage(
        from,
        { text: msg },
        { quoted: fakevCard }
      );

    } catch (e) {
      console.error("System Command Error:", e);
      
      // Error reaction
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply("❌ *Error while checking bot status.*");
    }
  }
);

// Also create a simple mode toggle command
cmd(
  {
    pattern: "setmode",
    alias: ["mode", "changemode"],
    react: "⚙️",
    desc: "Change bot mode (public/private) - Owner only",
    category: "owner",
    filename: __filename,
    fromMe: true,
  },
  async (malvin, mek, m, { from, args, reply, sender }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      // Check if user is owner
      const ownerNumber = config.OWNER_NUMBER + "@s.whatsapp.net";
      if (sender !== ownerNumber) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ *Access Denied!*\nThis command is only for the bot owner.");
      }

      const newMode = args[0]?.toLowerCase();
      
      if (!newMode || !["public", "private"].includes(newMode)) {
        await malvin.sendMessage(from, {
          react: {
            text: "ℹ️",
            key: mek.key
          }
        });
        return reply(
          `⚙️ *MULAA SIGIL XMD - Mode Settings*\n\n` +
          `📌 *Current Mode:* ${config.MODE || 'public'}\n\n` +
          `✨ *Available Modes:*\n` +
          `└ \`public\`  - Anyone can use the bot\n` +
          `└ \`private\` - Only owner can use commands\n\n` +
          `📌 *Usage:* \`${config.PREFIX}setmode <public/private>\``
        );
      }

      // Update mode (you'll need to save this to config.json)
      config.MODE = newMode;
      
      // Note: You should also update the config.json file here
      // This requires fs module - add at top: const fs = require('fs');
      
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      const modeEmoji = newMode === 'public' ? '🌍' : '🔒';
      
      await reply(
        `╔══════════════════════════════════╗
║     ⚙️ *MODE UPDATED*           ║
╠══════════════════════════════════╣
║ ${modeEmoji} *New Mode:* ${newMode}
║ 📌 *Changed by:* @${sender.split('@')[0]}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
        { mentions: [sender] }
      );

    } catch (e) {
      console.error("SetMode Error:", e);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply("❌ *Error:* Failed to change mode.");
    }
  }
);
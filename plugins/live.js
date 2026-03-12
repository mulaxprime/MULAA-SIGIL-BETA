// plugins/live.js
const { cmd } = require("../command");
const os = require("os");
const moment = require("moment");
const config = require("../config");

cmd(
  {
    pattern: "live",
    alias: ["alive2", "status", "uptime"],
    desc: "Show clean alive message",
    category: "main",
    filename: __filename,
    react: "⚡",
    fromMe: false,
  },
  async (malvin, mek, m, { from, pushname, sender, reply }) => {
    try {
      // Add reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⚡",
          key: mek.key
        }
      });

      const uptime = moment.duration(process.uptime() * 1000).humanize();
      const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const user = pushname || sender.split("@")[0];
      
      // Get version from package.json if available
      let version = config.VERSION || "1.0.0";
      try {
        const packageJson = require('../package.json');
        version = packageJson.version || version;
      } catch (e) {}

      const liveText = `
╭══════════════════════════════════╗
║     ⚡ *MULAA SIGIL XMD*         ║
║        *Live Status*             ║
╠══════════════════════════════════╣
║ 👤 *User:* ${user}
║ 👑 *Owner:* ${config.OWNER_NAME} (${config.OWNER_NUMBER})
║ 🕒 *Uptime:* ${uptime}
║ 💾 *Memory:* ${usedRam} MB / ${totalRam} GB
║ 🛎️ *Prefix:* ${config.PREFIX}
║ 📦 *Version:* ${version}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
🟢 *Status:* Online & Fully Operational
⚡ *Powered by MULAA SIGIL XMD*
━━━━━━━━━━━━━━━━━━━━━━
`;

      await malvin.sendMessage(
        from,
        {
          text: liveText.trim(),
          contextInfo: {
            externalAdReply: {
              title: config.BOT_NAME || "MULAA SIGIL XMD",
              body: `Status Panel • ${uptime}`,
              thumbnailUrl: "https://files.catbox.moe/rmv06k.jpg",
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        },
        { quoted: mek }
      );

    } catch (e) {
      console.error("Live Command Error:", e);
      reply("❌ *Error in live command:* " + e.message);
    }
  }
);
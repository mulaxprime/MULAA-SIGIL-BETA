// plugins/uptime-plus.js
const { cmd } = require("../command");
const moment = require("moment");
const os = require("os");
const config = require("../config");

cmd(
  {
    pattern: "uptime+",
    alias: ["runtime+", "up+", "sysuptime"],
    react: "📊",
    desc: "Check bot and system uptime",
    category: "info",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { reply, from }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      // Bot uptime
      const botUptimeSeconds = process.uptime();
      const botDuration = moment.duration(botUptimeSeconds * 1000);
      
      const botDays = Math.floor(botDuration.asDays());
      const botHours = botDuration.hours();
      const botMinutes = botDuration.minutes();
      const botSeconds = botDuration.seconds();

      // System uptime
      const sysUptimeSeconds = os.uptime();
      const sysDuration = moment.duration(sysUptimeSeconds * 1000);
      
      const sysDays = Math.floor(sysDuration.asDays());
      const sysHours = sysDuration.hours();
      const sysMinutes = sysDuration.minutes();
      const sysSeconds = sysDuration.seconds();

      const uptimeString = `
╔══════════════════════════════════╗
║     📊 *UPTIME INFORMATION*      ║
╠══════════════════════════════════╣
║ 🤖 *Bot:* ${config.BOT_NAME}
╠══════════════════════════════════╣
║ 🕐 *BOT UPTIME*
║    └ 🗓️ Days: ${botDays}
║    └ ⏰ Hours: ${botHours}
║    └ ⏱️ Minutes: ${botMinutes}
║    └ ⏲️ Seconds: ${botSeconds}
║    └ 📌 Total: ${botDays}d ${botHours}h ${botMinutes}m ${botSeconds}s
╠══════════════════════════════════╣
║ 🖥️ *SYSTEM UPTIME*
║    └ 🗓️ Days: ${sysDays}
║    └ ⏰ Hours: ${sysHours}
║    └ ⏱️ Minutes: ${sysMinutes}
║    └ ⏲️ Seconds: ${sysSeconds}
║    └ 📌 Total: ${sysDays}d ${sysHours}h ${sysMinutes}m ${sysSeconds}s
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*
      `.trim();

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      await malvin.sendMessage(
        from,
        { text: uptimeString },
        { quoted: fakevCard }
      );

    } catch (error) {
      console.error("Uptime+ Error:", error);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply("❌ *Error while fetching uptime information.*");
    }
  }
);
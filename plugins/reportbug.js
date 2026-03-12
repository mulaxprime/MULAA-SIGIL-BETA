// plugins/reportbug.js
const { cmd } = require("../command");
const config = require("../config");

cmd(
  {
    pattern: "reportbug",
    alias: ["report", "bug"],
    desc: "Report a bug directly to the bot owner",
    category: "utility",
    react: "🐞",
    filename: __filename,
    fromMe: false,
  },
  async (conn, mek, m, { from, args, pushname, sender, reply }) => {
    try {
      const reportText = args.join(" ").trim();

      if (!reportText) {
        return reply(
          `🐞 *MULAA SIGIL XMD - Bug Report*\n\n` +
          `📌 *Usage:* \`${config.PREFIX}reportbug <describe the bug>\`\n` +
          `✨ *Example:* \`${config.PREFIX}reportbug menu crashes when I type 3\``
        );
      }

      const ownerJid = config.OWNER_NUMBER + "@s.whatsapp.net";
      const userNumber = sender.split("@")[0];

      const reportMessage = `
╔══════════════════════════════════╗
║     🐞 *BUG REPORT RECEIVED*     ║
╠══════════════════════════════════╣
║ 👤 *From:* ${pushname || "Unknown"}
║ 📱 *Number:* ${userNumber}
║ ⏰ *Time:* ${new Date().toLocaleString()}
╠══════════════════════════════════╣
║ 📝 *Report:*                     ║
║ ${reportText}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*
`;

      // Send report to owner
      await conn.sendMessage(ownerJid, {
        text: reportMessage,
      });

      // Confirm to user
      await reply(
        `╔══════════════════════════════════╗
║     ✅ *BUG REPORT SENT*         ║
╠══════════════════════════════════╣
║ Thank you for helping improve    ║
║ MULAA SIGIL XMD! 🛠️              ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
      );

    } catch (err) {
      console.error("ReportBug Error:", err);
      reply("❌ *Failed to send bug report.* Please try again later.");
    }
  }
);
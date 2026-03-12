// plugins/truthordare.js
const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

cmd(
  {
    pattern: "tod",
    alias: ["truthordare", "truth", "dare", "trd"],
    desc: "Get a random Truth or Dare question",
    react: "🎲",
    category: "fun",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, reply, args }) => {
    try {
      // Add processing reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      if (!args[0] || !["truth", "dare"].includes(args[0].toLowerCase())) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(
          `🎲 *MULAA SIGIL XMD - Truth or Dare*\n\n` +
          `❌ *Please specify either \`truth\` or \`dare\`!*\n\n` +
          `📌 *Usage:* \`${config.PREFIX}tod truth\` or \`${config.PREFIX}tod dare\`\n` +
          `✨ *Examples:*\n` +
          `└ \`${config.PREFIX}tod truth\`\n` +
          `└ \`${config.PREFIX}tod dare\``
        );
      }

      const type = args[0].toLowerCase();
      const url = `https://api.truthordarebot.xyz/v1/${type}`;
      const { data } = await axios.get(url, { timeout: 10000 });

      if (!data || !data.question) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ *Could not fetch a question.* Please try again later.");
      }

      // Determine emoji based on type
      const emoji = type === 'truth' ? '🤔' : '😈';
      
      // Get additional info if available
      const rating = data.rating || 'PG-13';
      const category = data.category || 'General';

      // Success reaction
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      const response = `
╔══════════════════════════════════╗
║     🎲 *${type.toUpperCase()} QUESTION*         ║
╠══════════════════════════════════╣
║ ${emoji} *Question:* 
║ ${data.question}
╠══════════════════════════════════╣
║ 📊 *Rating:* ${rating}
║ 📂 *Category:* ${category}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*
━━━━━━━━━━━━━━━━━━━━━━`;

      await reply(response);

    } catch (e) {
      console.error("TruthOrDare Command Error:", e);
      
      // Error reaction
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      // Handle specific errors
      let errorMessage = e.message || "Unknown error";
      
      if (e.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else if (e.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment.";
      } else if (e.response?.status === 404) {
        errorMessage = "API endpoint not found.";
      }

      reply(
        `╔══════════════════════════════════╗
║     ❌ *ERROR OCCURRED*           ║
╠══════════════════════════════════╣
║ ${errorMessage.substring(0, 50)}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
      );
    }
  }
);
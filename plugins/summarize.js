// plugins/summarize-advanced.js
const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

cmd(
  {
    pattern: "summarize",
    alias: ["sum", "summary", "shorten"],
    react: "📖",
    desc: "Summarize a long text with options",
    category: "ai",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, args, reply }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      // Parse options
      let length = 3; // default sentences
      let text = args.join(" ");
      
      // Check for length option
      const lengthMatch = text.match(/--length=(\d+)/);
      if (lengthMatch) {
        length = parseInt(lengthMatch[1]);
        text = text.replace(lengthMatch[0], '').trim();
      }

      if (!text) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(
          `📖 *MULAA SIGIL XMD - Text Summarizer*\n\n` +
          `❌ *Please provide text to summarize!*\n\n` +
          `📌 *Options:*\n` +
          `└ \`--length=<number>\` - Set summary length (1-10)\n\n` +
          `✨ *Examples:*\n` +
          `└ \`${config.PREFIX}summarize [long text]\`\n` +
          `└ \`${config.PREFIX}summarize --length=5 [long text]\``
        );
      }

      // Validate length
      length = Math.min(Math.max(length, 1), 10);

      // Try multiple summarization APIs
      let summary = "";
      let apiUsed = "";

      // API 1: Smrzr
      try {
        const res1 = await axios.post(`https://api.smrzr.io/v1/summarize?num_sentences=${length}`, {
          text: text,
        }, { timeout: 10000 });
        
        if (res1.data?.summary) {
          summary = res1.data.summary;
          apiUsed = "Smrzr";
        }
      } catch (e) {}

      // API 2: Local fallback
      if (!summary) {
        try {
          const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
          if (sentences.length <= length) {
            summary = text;
          } else {
            // Take first few sentences
            summary = sentences.slice(0, length).join(' ');
          }
          apiUsed = "Local (Fallback)";
        } catch (e) {}
      }

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      const wordCount = text.split(" ").length;
      const summaryWords = summary.split(" ").length;
      const compression = ((1 - summaryWords / wordCount) * 100).toFixed(1);

      const result = `
╔══════════════════════════════════╗
║     📖 *TEXT SUMMARIZER*         ║
╠══════════════════════════════════╣
║ 🤖 *Bot:* ${config.BOT_NAME}
║ 📊 *Original:* ${wordCount} words
║ 📝 *Summary:* ${summaryWords} words
║ 📉 *Compression:* ${compression}%
║ ⚙️ *Length:* ${length} sentences
║ 🔧 *Method:* ${apiUsed}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
📝 *Summary:*

${summary}

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`;

      await reply(result);

    } catch (e) {
      console.error("Summarize Error:", e);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply(`❌ *Error:* ${e.message}`);
    }
  }
);
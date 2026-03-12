// plugins/roll.js
const { cmd } = require("../command");
const config = require("../config");

cmd(
  {
    pattern: "roll",
    alias: ["dice"],
    desc: "Roll a dice and see the number",
    react: "🎲",
    category: "fun",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, reply }) => {
    try {
      // Add reaction
      await malvin.sendMessage(from, {
        react: {
          text: "🎲",
          key: mek.key
        }
      });

      const diceRoll = Math.floor(Math.random() * 6) + 1; // 1-6
      
      // Dice faces
      const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
      
      await reply(
        `╔══════════════════════════════════╗
║     🎲 *DICE ROLL*               ║
╠══════════════════════════════════╣
║ ✨ You rolled: *${diceRoll}* ${diceFaces[diceRoll-1]}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
      );

    } catch (e) {
      console.error("Roll Error:", e);
      reply("❌ Error rolling dice.");
    }
  }
);
// plugins/menu.js
const { cmd, commands } = require("../command");
const config = require("../config");

cmd(
  {
    pattern: "menu",
    alias: ["help", "commands"],
    desc: "Show all bot commands by category",
    category: "main",
    filename: __filename,
  },
  async (malvin, mek, m, context) => {
    // Define from and user here so catch block can use them
    const { pushname, sender } = context || {};
    const from = context?.from || (sender ? sender.split("@")[0] + "@s.whatsapp.net" : "unknown");
    const user = pushname || (sender ? sender.split("@")[0] : "User");

    try {
      // Loading reaction
      await malvin.sendMessage(from, {
        react: { text: "⏳", key: mek.key },
      });

      // Count total commands
      const totalCommands = commands.filter(c => !c.dontAddCommandList).length;

      // Build menu card caption
      let menuText = `
👑 𝚳𝐔𝐋𝚫𝚫 𝐒𝚰𝐆𝚰𝐋 𝚩𝚵𝚻𝚫 - BOT MENU 👑
──────────────────────────────
🧑‍💻 User   : ${user}
🛠 Prefix : ${config.PREFIX}
📊 Commands: ${totalCommands}
⏱ Uptime  : ${process.uptime().toFixed(0)}s
⚙ Dev    : ${config.OWNER_NAME}
──────────────────────────────
`;

      // Optional: list categories quickly
      const categories = [...new Set(commands.map(c => c.category || "other"))];
      menuText += "📂 Categories: " + categories.map(c => `\`${c.toUpperCase()}\``).join(" | ") + "\n";

      // Send menu with image
      await malvin.sendMessage(
        from,
        {
          image: { url: "mulax/menu.png" }, 
          caption: menuText.trim(),
        },
        { quoted: mek }
      );

      // Success reaction
      await malvin.sendMessage(from, { react: { text: "📜", key: mek.key } });

    } catch (e) {
      console.error("Menu Error:", e);

      // Error reaction (safe because from is defined outside try)
      try {
        await malvin.sendMessage(from, { react: { text: "❌", key: mek.key } });
      } catch (reactError) {}

      await malvin.sendMessage(from, { text: "❌ Failed to load menu." }, { quoted: mek });
    }
  }
);
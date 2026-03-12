// plugins/allmenu.js
const { cmd, commands } = require("../command");
const config = require("../config");
const os = require("os");
const moment = require("moment");

cmd(
  {
    pattern: "allmenu",
    alias: ["menu2", "fullmenu", "commands"],
    react: "📖",
    desc: "Show all bot commands with a clean list",
    category: "main",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, pushname, sender, reply }) => {
    try {
      // Add processing reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      const uptime = moment.duration(process.uptime() * 1000).humanize();
      const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB";
      const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB";
      const ownerNumber = config.OWNER_NUMBER || "26775462914";
      const ownerName = config.OWNER_NAME || "Mulax Prime";
      const user = pushname || sender.split("@")[0];
      const botName = config.BOT_NAME || "MULAA SIGIL XMD";

      // Group commands by category dynamically
      const categorized = {};
      commands.forEach((cmdItem) => {
        if (!cmdItem.pattern || cmdItem.dontAddCommandList) return;
        const cat = cmdItem.category || "other";
        if (!categorized[cat]) categorized[cat] = [];
        categorized[cat].push(cmdItem.pattern);
      });

      // Menu header
      let menuText = `╔══════════════════════════════════╗
║     🤖 *${botName}* 🤖      ║
╠══════════════════════════════════╣
║ 👤 *User:* ${user}
║ 👑 *Owner:* ${ownerName} (${ownerNumber})
║ ⏱️ *Uptime:* ${uptime}
║ 💾 *Memory:* ${usedRam} / ${totalRam}
║ 🛎️ *Prefix:* ${config.PREFIX || '.'}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
`;

      // Category emojis
      const categoryEmojis = {
        main: "⚙️",
        download: "📥",
        group: "👥",
        owner: "👑",
        convert: "🎨",
        fun: "🎉",
        reaction: "💫",
        anime: "🌸",
        search: "🔍",
        utility: "🛠️",
        economy: "💰",
        nsfw: "🔞",
        ai: "🤖",
        other: "🧩",
      };

      // List all categories and commands
      for (const [cat, cmds] of Object.entries(categorized)) {
        const emoji = categoryEmojis[cat] || "✦";
        const title = cat.charAt(0).toUpperCase() + cat.slice(1);
        
        menuText += `${emoji} *${title} Commands*\n`;
        
        cmds.forEach((cmdName, i) => {
          menuText += `  └ ${i + 1}. ${config.PREFIX || '.'}${cmdName}\n`;
        });
        
        menuText += "━━━━━━━━━━━━━━━━━━━━━━\n";
      }

      menuText += `⚡ *Powered by ${botName}* ⚡\n`;
      menuText += `📌 *Repo:* github.com/romeobwiii/MULAA-SIGIL-XMD`;

      // Success reaction
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      // Send menu as a single image + caption
      await malvin.sendMessage(
        from,
        {
          image: { url: "https://files.catbox.moe/3lv5zs.jpg" },
          caption: menuText,
        },
        { quoted: mek }
      );

    } catch (e) {
      console.error("❌ allmenu error:", e);
      
      // Error reaction
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      await reply("❌ *Error loading all menu.* Please try again later.");
    }
  }
);
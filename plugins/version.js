// plugins/version.js
const { cmd } = require("../command");
const config = require("../config");

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
    pattern: "version",
    alias: ["ver", "about", "info", "botinfo"],
    react: "⚙️",
    desc: "Check bot version and information",
    category: "main",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { reply, from }) => {
    try {
      // Add processing reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      // MULAA SIGIL XMD ASCII banner
      const banner = `
███╗   ███╗██╗   ██╗██╗      █████╗  █████╗ 
████╗ ████║██║   ██║██║     ██╔══██╗██╔══██╗
██╔████╔██║██║   ██║██║     ███████║███████║
██║╚██╔╝██║██║   ██║██║     ██╔══██║██╔══██║
██║ ╚═╝ ██║╚██████╔╝███████╗██║  ██║██║  ██║
╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝

███████╗██╗ ██████╗ ██╗██╗     ██╗   ██╗
██╔════╝██║██╔════╝ ██║██║     ██║   ██║
███████╗██║██║  ███╗██║██║     ██║   ██║
╚════██║██║██║   ██║██║██║     ██║   ██║
███████║██║╚██████╔╝██║███████╗╚██████╔╝
╚══════╝╚═╝ ╚═════╝ ╚═╝╚══════╝ ╚═════╝ 

          ⚡ MULAA SIGIL XMD ⚡
`;

      // Get version from package.json or config
      let version = config.VERSION || "1.0.0";
      try {
        const packageJson = require('../package.json');
        version = packageJson.version || version;
      } catch (e) {}

      const caption = `
${banner}

╔══════════════════════════════════╗
║     ⚙️ *BOT INFORMATION*          ║
╠══════════════════════════════════╣
║ 🤖 *Bot:* ${config.BOT_NAME}
║ 📌 *Version:* ${version}
║ 🛠️ *Prefix:* ${config.PREFIX || "."}
║ 👑 *Owner:* ${config.OWNER_NAME} (${config.OWNER_NUMBER})
║ 📊 *Mode:* ${config.MODE || "public"}
║ 💾 *Database:* JSON / SQLite
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
📌 *Features:*
└ 🤖 AI Chat Integration
└ 🎵 Spotify Downloader
└ 📥 TikTok Downloader
└ 🎮 Games & Economy
└ 💰 VIP Casino System
└ 🖼️ Image Manipulation
└ 📊 Server Statistics
└ 🔧 100+ Utilities

━━━━━━━━━━━━━━━━━━━━━━
📂 *Repository:*
github.com/romeobwiii/MULAA-SIGIL-XMD

📢 *Channel:*
https://whatsapp.com/channel/0029VaXXXXXXXX

━━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by MULAA SIGIL XMD*
👑 *Created by Mulax Prime*
━━━━━━━━━━━━━━━━━━━━━━
      `.trim();

      // Success reaction
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      await malvin.sendMessage(
        from,
        {
          image: { url: "https://files.catbox.moe/rmv06k.jpg" }, // Your bot image
          caption,
        },
        { quoted: fakevCard }
      );

    } catch (e) {
      console.error("Version Command Error:", e);
      
      // Error reaction
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply("❌ *Failed to fetch version information.*", fakevCard);
    }
  }
);
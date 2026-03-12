// plugins/repo.js
const { cmd } = require("../command");
const config = require("../config");
const axios = require("axios");

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
    pattern: "repo",
    alias: ["source", "github", "git"],
    react: "📦",
    desc: "Show MULAA SIGIL XMD GitHub repository info",
    category: "main",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { reply, from }) => {
    try {
      // Add reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      // Your GitHub repo
      const repoUrl = "https://github.com/romeobwiii/MULAA-SIGIL-XMD";
      const [owner, repo] = ["romeobwiii", "MULAA-SIGIL-XMD"];

      // Fetch repo data from GitHub API
      const { data } = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: { "User-Agent": "MULAA-SIGIL-XMD" },
        }
      );

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      const caption = `
╔══════════════════════════════════╗
║     📦 *MULAA SIGIL XMD REPO*    ║
╠══════════════════════════════════╣
║ 📌 *Repository:*                 ║
║ ${repoUrl}
╠══════════════════════════════════╣
║ ⭐ *Stars:* ${data.stargazers_count}
║ 🍴 *Forks:* ${data.forks_count}
║ 👀 *Watchers:* ${data.watchers_count}
╠══════════════════════════════════╣
║ 📝 *Description:*                 ║
║ ${data.description || "WhatsApp Bot with features including AI, downloads, games, economy, and more!"}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
💖 Support the project by starring & forking!
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*
`.trim();

      await malvin.sendMessage(
        from,
        {
          image: {
            url: "https://files.catbox.moe/rmv06k.jpg",
          },
          caption,
        },
        { quoted: fakevCard }
      );

    } catch (e) {
      console.error("Repo Command Error:", e?.response?.data || e);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch {}
      
      reply("❌ *Failed to fetch GitHub repository info.*");
    }
  }
);
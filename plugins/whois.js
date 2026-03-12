// plugins/whois.js
const { cmd } = require("../command");
const config = require("../config");

cmd(
  {
    pattern: "whois",
    alias: ["userinfo", "profile"],
    desc: "Get detailed info about a user",
    react: "👤",
    category: "utility",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, sender, reply }) => {
    try {
      // Add reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      const userJid = mek.mentionedJid && mek.mentionedJid[0] ? mek.mentionedJid[0] : sender;
      const userNumber = userJid.split("@")[0];

      // Fetch profile picture
      let profilePic = "https://files.catbox.moe/rmv06k.jpg"; // fallback bot image
      try {
        profilePic = await malvin.profilePictureUrl(userJid, "image");
      } catch {}

      // Fetch contact info
      const contact = await malvin.onWhatsApp(userJid);
      const userName = contact && contact[0]?.notify ? contact[0].notify : "Unknown";
      const isBusiness = contact && contact[0]?.isBusiness ? "Yes" : "No";

      // Fetch admin info if in a group
      let adminStatus = "N/A";
      let groupName = "N/A";
      try {
        if (from.endsWith("@g.us")) {
          const groupMetadata = await malvin.groupMetadata(from);
          groupName = groupMetadata.subject;
          const participant = groupMetadata.participants.find((p) => p.id === userJid);
          if (participant) {
            adminStatus =
              participant.admin === "admin" ? "Group Admin" :
              participant.admin === "superadmin" ? "Group Owner" :
              "Member";
          }
        }
      } catch {}

      const msg = `
╔══════════════════════════════════╗
║     👤 *USER INFORMATION*        ║
╠══════════════════════════════════╣
║ 📛 *Name:* ${userName}
║ 📱 *Number:* ${userNumber}
║ 🆔 *JID:* ${userJid.split('@')[0]}...
║ 💼 *Business:* ${isBusiness}
║ 👥 *Group Status:* ${adminStatus}
║ 📍 *Group:* ${groupName}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*
`;

      // Success reaction
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      await malvin.sendMessage(
        from,
        { image: { url: profilePic }, caption: msg },
        { quoted: mek }
      );

    } catch (e) {
      console.error("❌ Whois Command Error:", e);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch {}
      
      reply("❌ *Failed to fetch user info!*");
    }
  }
);
// plugins/setprefix.js
const { cmd } = require("../command");
const config = require("../config");
const fs = require("fs");
const path = require("path");

const CONFIG_FILE = path.join(__dirname, "../config.json");

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

// Function to update config file
function updateConfigFile(newPrefix) {
  try {
    // Read current config
    let configData = {};
    if (fs.existsSync(CONFIG_FILE)) {
      configData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
    
    // Update prefix
    configData.PREFIX = newPrefix;
    
    // Write back to file
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2));
    return true;
  } catch (error) {
    console.error("Error updating config file:", error);
    return false;
  }
}

cmd(
  {
    pattern: "setprefix",
    alias: ["prefix", "changeprefix", "setpf"],
    desc: "Change the bot's command prefix (Owner only)",
    react: "⚙️",
    category: "owner",
    filename: __filename,
    fromMe: true,
  },
  async (malvin, mek, m, { from, reply, args, sender, isOwner }) => {
    try {
      // Add processing reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      // Check if user is owner (using config.OWNER_NUMBER)
      const ownerNumber = config.OWNER_NUMBER + "@s.whatsapp.net";
      if (sender !== ownerNumber) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(
          `❌ *Access Denied!*\n\nThis command is only for the bot owner (*Mulax Prime*).\n\n👑 *Owner Number:* ${config.OWNER_NUMBER}`,
          fakevCard
        );
      }

      const newPrefix = args[0];
      
      if (!newPrefix) {
        await malvin.sendMessage(from, {
          react: {
            text: "ℹ️",
            key: mek.key
          }
        });
        return reply(
          `⚙️ *Current Prefix:* ${config.PREFIX || '.'}\n\n` +
          `📌 *Usage:* \`.setprefix <new prefix>\`\n` +
          `✨ *Example:* \`.setprefix !\`\n\n` +
          `_This will change the bot's command prefix permanently._`,
          fakevCard
        );
      }

      // Validate prefix (single character recommended)
      if (newPrefix.length > 2) {
        await malvin.sendMessage(from, {
          react: {
            text: "⚠️",
            key: mek.key
          }
        });
        return reply(
          `⚠️ *Invalid Prefix!*\n\nPrefix should be 1-2 characters long.\nRecommended: \`.\` \`!\` \`#\` \`$\` \`&\``,
          fakevCard
        );
      }

      // Update config file
      const updated = updateConfigFile(newPrefix);
      
      if (!updated) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(
          `❌ *Failed to update prefix!*\n\nPlease check file permissions.`,
          fakevCard
        );
      }

      // Update runtime config
      config.PREFIX = newPrefix;

      // Success reaction
      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      const successMessage = `
╔══════════════════════════════════╗
║     ✅ *PREFIX UPDATED*          ║
╠══════════════════════════════════╣
║ 📌 *Old Prefix:* ${config.PREFIX || '.'}
║ ✨ *New Prefix:* ${newPrefix}
║ 👑 *Updated by:* @${sender.split('@')[0]}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *All commands now use:* \`${newPrefix}\`
📝 *Example:* \`${newPrefix}menu\`

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*
      `;

      await reply(successMessage, { 
        mentions: [sender],
        ...fakevCard 
      });

    } catch (e) {
      console.error("SetPrefix Command Error:", e);
      
      // Error reaction
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply(
        `❌ *Error:* Unable to change prefix.\n${e.message}`,
        fakevCard
      );
    }
  }
);
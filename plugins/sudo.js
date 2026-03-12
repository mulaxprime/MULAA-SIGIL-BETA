// plugins/sudo.js
const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const config = require("../config");

const SUDO_FILE = path.join(__dirname, "../lib/sudo.json");

// Initialize sudo users
if (!global.sudoUsers) {
  // Load from file if exists
  if (fs.existsSync(SUDO_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(SUDO_FILE, 'utf-8'));
      global.sudoUsers = new Set(data.users || []);
      console.log(`✅ Loaded ${global.sudoUsers.size} sudo users from file`);
    } catch (e) {
      console.error("Error loading sudo users:", e);
      global.sudoUsers = new Set();
    }
  } else {
    global.sudoUsers = new Set();
    // Create file with empty array
    fs.writeFileSync(SUDO_FILE, JSON.stringify({ users: [] }, null, 2));
  }
}

// Save sudo users to file
function saveSudoUsers() {
  try {
    const data = {
      users: Array.from(global.sudoUsers),
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(SUDO_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error("Error saving sudo users:", e);
    return false;
  }
}

// Helper function to format number
function formatNumber(number) {
  if (!number) return '';
  return number.replace(/[^0-9]/g, '');
}

// Command to add sudo user
cmd(
  {
    pattern: "addsudo",
    alias: ["sudoadd", "givesudo", "addsudo"],
    desc: "Grant sudo access to a user (Owner only)",
    react: "🛡️",
    category: "owner",
    filename: __filename,
    fromMe: true, // Only bot owner
  },
  async (malvin, mek, m, { from, args, reply, sender }) => {
    try {
      // Add processing reaction
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      // Check if user is owner
      const ownerNumber = config.OWNER_NUMBER + "@s.whatsapp.net";
      if (sender !== ownerNumber) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ *Access Denied!*\nThis command is only for the bot owner (Mulax Prime).");
      }

      const userToAdd = args[0];
      if (!userToAdd) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(
          `🛡️ *MULAA SIGIL XMD - Sudo System*\n\n` +
          `❌ *Usage:* \`${config.PREFIX}addsudo <number>\`\n` +
          `📌 *Example:* \`${config.PREFIX}addsudo 26775462914\`\n\n` +
          `_This will grant the user full owner privileges._`
        );
      }

      // Format the number
      const formattedNumber = formatNumber(userToAdd);
      const fullJid = formattedNumber + "@s.whatsapp.net";

      if (global.sudoUsers.has(fullJid)) {
        await malvin.sendMessage(from, {
          react: {
            text: "⚠️",
            key: mek.key
          }
        });
        return reply(`⚠️ User *${formattedNumber}* already has sudo access.`);
      }

      global.sudoUsers.add(fullJid);
      const saved = saveSudoUsers();

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      const successMsg = `
╔══════════════════════════════════╗
║     🛡️ *SUDO ACCESS GRANTED*     ║
╠══════════════════════════════════╣
║ 👤 *User:* @${formattedNumber}
║ 📊 *Total Sudo Users:* ${global.sudoUsers.size}
║ 💾 *Persistent:* ${saved ? '✅ Yes' : '❌ No'}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
✨ This user can now use owner commands!
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`;

      await reply(successMsg, { mentions: [fullJid] });

    } catch (e) {
      console.error("AddSudo Error:", e);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply("❌ *Error:* Failed to add sudo user.");
    }
  }
);

// Command to remove sudo user
cmd(
  {
    pattern: "removesudo",
    alias: ["sudoremove", "revokesudo", "delsudo"],
    desc: "Revoke sudo access from a user (Owner only)",
    react: "🛡️",
    category: "owner",
    filename: __filename,
    fromMe: true, // Only bot owner
  },
  async (malvin, mek, m, { from, args, reply, sender }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      const ownerNumber = config.OWNER_NUMBER + "@s.whatsapp.net";
      if (sender !== ownerNumber) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ *Access Denied!*\nThis command is only for the bot owner.");
      }

      const userToRemove = args[0];
      if (!userToRemove) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply(
          `🛡️ *MULAA SIGIL XMD - Sudo System*\n\n` +
          `❌ *Usage:* \`${config.PREFIX}removesudo <number>\`\n` +
          `📌 *Example:* \`${config.PREFIX}removesudo 26775462914\``
        );
      }

      const formattedNumber = formatNumber(userToRemove);
      const fullJid = formattedNumber + "@s.whatsapp.net";

      if (!global.sudoUsers.has(fullJid)) {
        await malvin.sendMessage(from, {
          react: {
            text: "⚠️",
            key: mek.key
          }
        });
        return reply(`⚠️ User *${formattedNumber}* does not have sudo access.`);
      }

      global.sudoUsers.delete(fullJid);
      const saved = saveSudoUsers();

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      const successMsg = `
╔══════════════════════════════════╗
║     🛡️ *SUDO ACCESS REVOKED*     ║
╠══════════════════════════════════╣
║ 👤 *User:* @${formattedNumber}
║ 📊 *Total Sudo Users:* ${global.sudoUsers.size}
║ 💾 *Persistent:* ${saved ? '✅ Yes' : '❌ No'}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`;

      await reply(successMsg, { mentions: [fullJid] });

    } catch (e) {
      console.error("RemoveSudo Error:", e);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply("❌ *Error:* Failed to remove sudo user.");
    }
  }
);

// Command to list all sudo users
cmd(
  {
    pattern: "listsudo",
    alias: ["sudolist", "sudoers"],
    desc: "List all users with sudo access",
    react: "📋",
    category: "owner",
    filename: __filename,
    fromMe: true,
  },
  async (malvin, mek, m, { from, reply, sender }) => {
    try {
      await malvin.sendMessage(from, {
        react: {
          text: "⏳",
          key: mek.key
        }
      });

      const ownerNumber = config.OWNER_NUMBER + "@s.whatsapp.net";
      if (sender !== ownerNumber) {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
        return reply("❌ *Access Denied!*");
      }

      const sudoArray = Array.from(global.sudoUsers);
      
      let userList = "";
      if (sudoArray.length === 0) {
        userList = "   No sudo users found";
      } else {
        sudoArray.forEach((user, index) => {
          const number = user.split("@")[0];
          const isOwner = (number === config.OWNER_NUMBER) ? " (Owner)" : "";
          userList += `   ${index + 1}. @${number}${isOwner}\n`;
        });
      }

      await malvin.sendMessage(from, {
        react: {
          text: "✅",
          key: mek.key
        }
      });

      const listMsg = `
╔══════════════════════════════════╗
║     📋 *SUDO USERS LIST*         ║
╠══════════════════════════════════╣
║ 📊 *Total:* ${sudoArray.length}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
${userList}
━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`;

      await reply(listMsg, { mentions: sudoArray });

    } catch (e) {
      console.error("ListSudo Error:", e);
      
      try {
        await malvin.sendMessage(from, {
          react: {
            text: "❌",
            key: mek.key
          }
        });
      } catch (reactError) {}
      
      reply("❌ *Error:* Failed to list sudo users.");
    }
  }
);

// Middleware to check if user has sudo access
function isSudo(sender) {
  return global.sudoUsers.has(sender);
}

// Export for use in other files
module.exports = { isSudo };

// Note: In your main command handler, you can check sudo access like this:
// if (cmd.fromMe && !isOwner && !isSudo(sender)) {
//   return reply("❌ This command requires owner or sudo access.");
// }
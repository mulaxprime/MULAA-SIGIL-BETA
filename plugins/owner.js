// plugins/group.js
const { cmd } = require('../command');
const config = require('../config');

// Block user
cmd({
    pattern: "block",
    react: "⚠️",
    alias: ["banuser"],
    desc: "Block a user instantly.",
    category: "owner",
    filename: __filename,
    fromMe: true
},
async (malvin, mek, m, { from, quoted, reply, isOwner, sender }) => {
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
            return reply("⚠️ *Only the owner can use this command!*");
        }

        if (!m.quoted) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *Please reply to the user's message to block them!*");
        }

        const target = m.quoted.sender;
        await malvin.updateBlockStatus(target, "block");
        
        await malvin.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });
        
        return reply(`✅ *Successfully blocked:* @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Block Error:", e);
        reply(`❌ *Failed to block user.* Error: ${e.message}`);
    }
});

// Kick user from group
cmd({
    pattern: "kick",
    alias: ["remove"],
    react: "⚠️",
    desc: "Remove a mentioned user from the group.",
    category: "group",
    filename: __filename,
    fromMe: false
},
async (malvin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        await malvin.sendMessage(from, {
            react: {
                text: "⏳",
                key: mek.key
            }
        });

        if (!isGroup) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *This command can only be used in a group!*");
        }
        
        if (!isAdmins) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *Only group admins can use this command!*");
        }
        
        if (!isBotAdmins) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *I need to be an admin to execute this command!*");
        }
        
        if (!m.quoted) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *Please reply to the user's message you want to kick!*");
        }

        const target = m.quoted.sender;
        const groupMetadata = await malvin.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

        if (groupAdmins.includes(target)) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *I cannot remove another admin from the group!*");
        }

        await malvin.groupParticipantsUpdate(from, [target], "remove");
        
        await malvin.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });
        
        return reply(`✅ *Successfully removed:* @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Kick Error:", e);
        reply(`❌ *Failed to kick user.* Error: ${e.message}`);
    }
});

// Leave group
cmd({
    pattern: "left",
    alias: ["leave", "exit"],
    react: "⚠️",
    desc: "Leave the current group.",
    category: "owner",
    filename: __filename,
    fromMe: true
},
async (malvin, mek, m, { from, isGroup, isOwner, reply, sender }) => {
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
            return reply("⚠️ *Only the owner can use this command!*");
        }

        if (!isGroup) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *This command can only be used in a group!*");
        }

        await reply("👋 *Leaving group... Goodbye!*");
        await malvin.groupLeave(from);
        
    } catch (e) {
        console.error("Leave Error:", e);
        reply(`❌ *Failed to leave group.* Error: ${e.message}`);
    }
});

// Mute group (admin only)
cmd({
    pattern: "mute",
    alias: ["silence", "lock"],
    react: "🔇",
    desc: "Set group chat to admin-only messages.",
    category: "group",
    filename: __filename,
    fromMe: false
},
async (malvin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        await malvin.sendMessage(from, {
            react: {
                text: "⏳",
                key: mek.key
            }
        });

        if (!isGroup) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *This command can only be used in a group!*");
        }
        
        if (!isAdmins) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *This command is only for group admins!*");
        }
        
        if (!isBotAdmins) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *I need to be an admin to execute this command!*");
        }

        await malvin.groupSettingUpdate(from, "announcement");
        
        await malvin.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });
        
        return reply("🔇 *Group has been muted.* Only admins can send messages now!");
    } catch (e) {
        console.error("Mute Error:", e);
        reply(`❌ *Failed to mute group.* Error: ${e.message}`);
    }
});

// Unmute group
cmd({
    pattern: "unmute",
    alias: ["unlock"],
    react: "🔊",
    desc: "Allow everyone to send messages in the group.",
    category: "group",
    filename: __filename,
    fromMe: false
},
async (malvin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        await malvin.sendMessage(from, {
            react: {
                text: "⏳",
                key: mek.key
            }
        });

        if (!isGroup) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *This command can only be used in a group!*");
        }
        
        if (!isAdmins) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *This command is only for group admins!*");
        }
        
        if (!isBotAdmins) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *I need to be an admin to execute this command!*");
        }

        await malvin.groupSettingUpdate(from, "not_announcement");
        
        await malvin.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });
        
        return reply("🔊 *Group has been unmuted.* Everyone can send messages now!");
    } catch (e) {
        console.error("Unmute Error:", e);
        reply(`❌ *Failed to unmute group.* Error: ${e.message}`);
    }
});

// Add user to group
cmd({
    pattern: "add",
    alias: ["invite"],
    react: "➕",
    desc: "Add a user to the group.",
    category: "group",
    filename: __filename,
    fromMe: false
},
async (malvin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, args }) => {
    try {
        await malvin.sendMessage(from, {
            react: {
                text: "⏳",
                key: mek.key
            }
        });

        if (!isGroup) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *This command can only be used in a group!*");
        }
        
        if (!isAdmins) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *Only group admins can use this command!*");
        }
        
        if (!isBotAdmins) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *I need to be an admin to execute this command!*");
        }
        
        if (!args[0]) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *Please provide the phone number of the user to add!*");
        }

        const target = args[0].includes("@") ? args[0] : `${args[0]}@s.whatsapp.net`;
        await malvin.groupParticipantsUpdate(from, [target], "add");
        
        await malvin.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });
        
        return reply(`✅ *Successfully added:* @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Add Error:", e);
        reply(`❌ *Failed to add user.* Error: ${e.message}`);
    }
});

// Demote admin
cmd({
    pattern: "demote",
    alias: ["member"],
    react: "⬇️",
    desc: "Remove admin privileges from a mentioned user.",
    category: "group",
    filename: __filename,
    fromMe: false
},
async (malvin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        await malvin.sendMessage(from, {
            react: {
                text: "⏳",
                key: mek.key
            }
        });

        if (!isGroup) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *This command can only be used in a group!*");
        }
        
        if (!isAdmins) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *Only group admins can use this command!*");
        }
        
        if (!isBotAdmins) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *I need to be an admin to execute this command!*");
        }
        
        if (!m.quoted) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *Please reply to the user's message to demote them!*");
        }

        const target = m.quoted.sender;
        if (target === m.sender) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *You cannot remove your own admin privileges!*");
        }

        await malvin.groupParticipantsUpdate(from, [target], "demote");
        
        await malvin.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });
        
        return reply(`⬇️ *Demoted:* @${target.split('@')[0]} to regular member.`);
    } catch (e) {
        console.error("Demote Error:", e);
        reply(`❌ *Failed to demote user.* Error: ${e.message}`);
    }
});

// Promote to admin
cmd({
    pattern: "promote",
    alias: ["admin", "makeadmin"],
    react: "⬆️",
    desc: "Grant admin privileges to a mentioned user.",
    category: "group",
    filename: __filename,
    fromMe: false
},
async (malvin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        await malvin.sendMessage(from, {
            react: {
                text: "⏳",
                key: mek.key
            }
        });

        if (!isGroup) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *This command can only be used in a group!*");
        }
        
        if (!isAdmins) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *Only group admins can use this command!*");
        }
        
        if (!isBotAdmins) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *I need to be an admin to execute this command!*");
        }
        
        if (!m.quoted) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *Please reply to the user's message to promote them!*");
        }

        const target = m.quoted.sender;
        const groupMetadata = await malvin.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

        if (groupAdmins.includes(target)) {
            await malvin.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("⚠️ *The mentioned user is already an admin!*");
        }

        await malvin.groupParticipantsUpdate(from, [target], "promote");
        
        await malvin.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });
        
        return reply(`⬆️ *Promoted:* @${target.split('@')[0]} to admin!`);
    } catch (e) {
        console.error("Promote Error:", e);
        reply(`❌ *Failed to promote user.* Error: ${e.message}`);
    }
});
// plugins/ai.js
const { cmd } = require('../command');
const axios = require('axios');

// GPT Command
cmd({
    pattern: "ai",
    alias: ["bot", "dj", "gpt", "gpt4", "bing"],
    desc: "Chat with an AI model",
    category: "ai",
    react: "🤖",
    filename: __filename,
    fromMe: false,
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        // Add processing reaction
        await conn.sendMessage(from, {
            react: {
                text: "⏳",
                key: mek.key
            }
        });

        if (!q) {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("❌ *Please provide a message for the AI.*\n📌 *Example:* `.ai Hello, how are you?`");
        }

        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("❌ *AI failed to respond.* Please try again later.");
        }

        // Success reaction
        await conn.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });

        await reply(
            `🤖 *MULAA SIGIL XMD - AI RESPONSE*\n\n` +
            `💬 *Your Query:* ${q}\n\n` +
            `📝 *Response:*\n${data.message}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━`
        );
        
    } catch (e) {
        console.error("Error in AI command:", e);
        
        // Error reaction
        try {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
        } catch (reactError) {}
        
        reply("❌ *An error occurred while communicating with the AI.*");
    }
});

// OpenAI Command
cmd({
    pattern: "openai",
    alias: ["chatgpt", "gpt3", "open-gpt"],
    desc: "Chat with OpenAI",
    category: "ai",
    react: "🧠",
    filename: __filename,
    fromMe: false,
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        // Add processing reaction
        await conn.sendMessage(from, {
            react: {
                text: "⏳",
                key: mek.key
            }
        });

        if (!q) {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("❌ *Please provide a message for OpenAI.*\n📌 *Example:* `.openai What is AI?`");
        }

        const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("❌ *OpenAI failed to respond.* Please try again later.");
        }

        // Success reaction
        await conn.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });

        await reply(
            `🧠 *MULAA SIGIL XMD - OPENAI RESPONSE*\n\n` +
            `💬 *Your Query:* ${q}\n\n` +
            `📝 *Response:*\n${data.result}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━`
        );
        
    } catch (e) {
        console.error("Error in OpenAI command:", e);
        
        // Error reaction
        try {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
        } catch (reactError) {}
        
        reply("❌ *An error occurred while communicating with OpenAI.*");
    }
});

// DeepSeek AI Command
cmd({
    pattern: "deepseek",
    alias: ["deep", "seekai"],
    desc: "Chat with DeepSeek AI",
    category: "ai",
    react: "🧠",
    filename: __filename,
    fromMe: false,
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        // Add processing reaction
        await conn.sendMessage(from, {
            react: {
                text: "⏳",
                key: mek.key
            }
        });

        if (!q) {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("❌ *Please provide a message for DeepSeek AI.*\n📌 *Example:* `.deepseek Hello AI`");
        }

        const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.answer) {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("❌ *DeepSeek AI failed to respond.* Please try again later.");
        }

        // Success reaction
        await conn.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });

        await reply(
            `🧠 *MULAA SIGIL XMD - DEEPSEEK AI RESPONSE*\n\n` +
            `💬 *Your Query:* ${q}\n\n` +
            `📝 *Response:*\n${data.answer}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━`
        );
        
    } catch (e) {
        console.error("Error in DeepSeek AI command:", e);
        
        // Error reaction
        try {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
        } catch (reactError) {}
        
        reply("❌ *An error occurred while communicating with DeepSeek AI.*");
    }
});

// Additional AI Command - Gemini
cmd({
    pattern: "gemini",
    alias: ["bard", "google-ai"],
    desc: "Chat with Google Gemini AI",
    category: "ai",
    react: "🌟",
    filename: __filename,
    fromMe: false,
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        await conn.sendMessage(from, {
            react: {
                text: "⏳",
                key: mek.key
            }
        });

        if (!q) {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("❌ *Please provide a message for Gemini AI.*\n📌 *Example:* `.gemini Tell me a joke`");
        }

        const apiUrl = `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.answer) {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("❌ *Gemini AI failed to respond.* Please try again later.");
        }

        await conn.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });

        await reply(
            `🌟 *MULAA SIGIL XMD - GEMINI AI RESPONSE*\n\n` +
            `💬 *Your Query:* ${q}\n\n` +
            `📝 *Response:*\n${data.answer}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━`
        );
        
    } catch (e) {
        console.error("Error in Gemini AI command:", e);
        
        try {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
        } catch (reactError) {}
        
        reply("❌ *An error occurred while communicating with Gemini AI.*");
    }
});

// Blackbox AI Command
cmd({
    pattern: "blackbox",
    alias: ["bb", "blackbox-ai"],
    desc: "Chat with Blackbox AI",
    category: "ai",
    react: "⚫",
    filename: __filename,
    fromMe: false,
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        await conn.sendMessage(from, {
            react: {
                text: "⏳",
                key: mek.key
            }
        });

        if (!q) {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("❌ *Please provide a message for Blackbox AI.*\n📌 *Example:* `.blackbox Write code`");
        }

        const apiUrl = `https://api.ryzendesu.vip/api/ai/blackbox?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.answer) {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
            return reply("❌ *Blackbox AI failed to respond.* Please try again later.");
        }

        await conn.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });

        await reply(
            `⚫ *MULAA SIGIL XMD - BLACKBOX AI RESPONSE*\n\n` +
            `💬 *Your Query:* ${q}\n\n` +
            `📝 *Response:*\n${data.answer}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━`
        );
        
    } catch (e) {
        console.error("Error in Blackbox AI command:", e);
        
        try {
            await conn.sendMessage(from, {
                react: {
                    text: "❌",
                    key: mek.key
                }
            });
        } catch (reactError) {}
        
        reply("❌ *An error occurred while communicating with Blackbox AI.*");
    }
});
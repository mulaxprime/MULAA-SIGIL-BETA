// plugins/tools.js
const { cmd } = require("../command");
const axios = require("axios");
const math = require("mathjs");
const config = require("../config");

//
// TOOL COMMANDS MASTER FILE
// Category: Tools
// Powered by MULAA SIGIL XMD
//

function toolCommand(name, desc, func) {
  cmd(
    {
      pattern: name,
      alias: [name[0]],
      react: "🔧",
      desc,
      category: "tools",
      filename: __filename,
      fromMe: false,
    },
    func
  );
}

// Helper function to add reactions
async function addReaction(conn, from, key, emoji) {
  try {
    await conn.sendMessage(from, {
      react: {
        text: emoji,
        key: key
      }
    });
  } catch (e) {}
}

// ------------------- TOOL COMMANDS ------------------- //

// 1) Ping
toolCommand("ping", "Check bot response time", async (conn, mek, m, { from, reply }) => {
  try {
    await addReaction(conn, from, mek.key, "⏳");
    const start = Date.now();
    const msg = await reply("🏓 *Pinging...*");
    const end = Date.now();
    await addReaction(conn, from, mek.key, "✅");
    await reply(`✅ *Pong!*\n\n⚡ Response: *${end - start}ms*\n\n⚡ *MULAA SIGIL XMD*`);
  } catch (e) {
    await addReaction(conn, from, mek.key, "❌");
    reply("❌ Error checking ping.");
  }
});

// 2) Calculator
toolCommand("calc", "Perform basic calculations", async (conn, mek, m, { from, args, reply }) => {
  try {
    await addReaction(conn, from, mek.key, "⏳");
    if (!args[0]) {
      await addReaction(conn, from, mek.key, "❌");
      return reply(
        `🧮 *MULAA SIGIL XMD - Calculator*\n\n` +
        `❌ *Please provide a calculation!*\n\n` +
        `📌 *Usage:* \`${config.PREFIX}calc 2+2\`\n` +
        `✨ *Example:* \`${config.PREFIX}calc sqrt(25)\``
      );
    }
    const result = math.evaluate(args.join(" "));
    await addReaction(conn, from, mek.key, "✅");
    reply(
      `╔══════════════════════════════════╗
║     🧮 *CALCULATION RESULT*      ║
╠══════════════════════════════════╣
║ 📝 *Input:* ${args.join(" ")}
║ 💡 *Result:* ${result}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
    );
  } catch (error) {
    await addReaction(conn, from, mek.key, "❌");
    reply("❌ *Invalid calculation!* Please check your input.");
  }
});

// 3) URL Shortener
toolCommand("short", "Shorten a URL", async (conn, mek, m, { from, args, reply }) => {
  try {
    await addReaction(conn, from, mek.key, "⏳");
    if (!args[0]) {
      await addReaction(conn, from, mek.key, "❌");
      return reply(
        `🔗 *MULAA SIGIL XMD - URL Shortener*\n\n` +
        `❌ *Please provide a URL to shorten!*\n\n` +
        `📌 *Usage:* \`${config.PREFIX}short https://example.com\``
      );
    }
    const response = await axios.get(`https://tinyurl.com/api-create.php?url=${args[0]}`);
    await addReaction(conn, from, mek.key, "✅");
    reply(
      `╔══════════════════════════════════╗
║     🔗 *URL SHORTENER*           ║
╠══════════════════════════════════╣
║ 📌 *Original:* ${args[0].substring(0, 30)}...
║ ✨ *Shortened:* ${response.data}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
    );
  } catch (error) {
    await addReaction(conn, from, mek.key, "❌");
    reply("❌ *Failed to shorten URL.* Please check the URL and try again.");
  }
});

// 4) QR Code Generator
toolCommand("qr", "Generate a QR Code", async (conn, mek, m, { from, args, reply }) => {
  try {
    await addReaction(conn, from, mek.key, "⏳");
    if (!args[0]) {
      await addReaction(conn, from, mek.key, "❌");
      return reply(
        `🖼️ *MULAA SIGIL XMD - QR Generator*\n\n` +
        `❌ *Please provide text to generate a QR code!*\n\n` +
        `📌 *Usage:* \`${config.PREFIX}qr Hello World\``
      );
    }
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(args.join(" "))}`;
    await addReaction(conn, from, mek.key, "✅");
    
    await conn.sendMessage(
      from,
      {
        image: { url: qrUrl },
        caption: `╔══════════════════════════════════╗
║     🖼️ *QR CODE GENERATED*      ║
╠══════════════════════════════════╣
║ 📝 *Data:* ${args.join(" ").substring(0, 30)}${args.join(" ").length > 30 ? '...' : ''}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`,
      },
      { quoted: mek }
    );
  } catch (error) {
    await addReaction(conn, from, mek.key, "❌");
    reply("❌ *Failed to generate QR code.*");
  }
});

// 5) Translate (Using free API)
toolCommand("tr", "Translate text to English", async (conn, mek, m, { from, args, reply }) => {
  try {
    await addReaction(conn, from, mek.key, "⏳");
    if (!args[0]) {
      await addReaction(conn, from, mek.key, "❌");
      return reply(
        `🌍 *MULAA SIGIL XMD - Translator*\n\n` +
        `❌ *Please provide text to translate!*\n\n` +
        `📌 *Usage:* \`${config.PREFIX}tr Hello\``
      );
    }
    
    // Using a free translation API
    const text = args.join(" ");
    const response = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|en`);
    
    if (!response.data?.responseData?.translatedText) {
      throw new Error("Translation failed");
    }
    
    const translated = response.data.responseData.translatedText;
    const match = response.data.matches?.[0];
    const sourceLang = match?.lang?.split('-')[0] || 'auto';
    
    await addReaction(conn, from, mek.key, "✅");
    
    reply(
      `╔══════════════════════════════════╗
║     🌍 *TRANSLATION RESULT*      ║
╠══════════════════════════════════╣
║ 📝 *Original:* ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}
║ 🔤 *Source:* ${sourceLang.toUpperCase()}
║ ✨ *Translated:* ${translated.substring(0, 100)}${translated.length > 100 ? '...' : ''}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
    );
  } catch (error) {
    await addReaction(conn, from, mek.key, "❌");
    reply("❌ *Translation failed.* Please try again.");
  }
});

// 6) Weather (Using wttr.in)
toolCommand("weather", "Get weather information", async (conn, mek, m, { from, args, reply }) => {
  try {
    await addReaction(conn, from, mek.key, "⏳");
    if (!args[0]) {
      await addReaction(conn, from, mek.key, "❌");
      return reply(
        `🌦️ *MULAA SIGIL XMD - Weather*\n\n` +
        `❌ *Please provide a city!*\n\n` +
        `📌 *Usage:* \`${config.PREFIX}weather London\``
      );
    }
    
    const city = args.join(" ");
    const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=%l:+%c+%t,+%w,+%h,+%p`);
    
    await addReaction(conn, from, mek.key, "✅");
    
    reply(
      `╔══════════════════════════════════╗
║     🌦️ *WEATHER INFORMATION*     ║
╠══════════════════════════════════╣
║ 📍 *City:* ${city}
║ 📊 *Data:* ${response.data}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
    );
  } catch (error) {
    await addReaction(conn, from, mek.key, "❌");
    reply("❌ *Failed to get weather information.*");
  }
});

// 7) Dictionary (Using Free Dictionary API)
toolCommand("dict", "Get word meaning", async (conn, mek, m, { from, args, reply }) => {
  try {
    await addReaction(conn, from, mek.key, "⏳");
    if (!args[0]) {
      await addReaction(conn, from, mek.key, "❌");
      return reply(
        `📘 *MULAA SIGIL XMD - Dictionary*\n\n` +
        `❌ *Please provide a word!*\n\n` +
        `📌 *Usage:* \`${config.PREFIX}dict hello\``
      );
    }
    
    const word = args[0].toLowerCase();
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    
    if (!response.data?.[0]) {
      throw new Error("Word not found");
    }
    
    const data = response.data[0];
    const meaning = data.meanings[0];
    const definition = meaning.definitions[0];
    const phonetics = data.phonetics[0]?.text || '';
    
    await addReaction(conn, from, mek.key, "✅");
    
    reply(
      `╔══════════════════════════════════╗
║     📘 *DICTIONARY RESULT*       ║
╠══════════════════════════════════╣
║ 📝 *Word:* ${data.word}
║ 🗣️ *Pronunciation:* ${phonetics}
║ 📚 *Part of Speech:* ${meaning.partOfSpeech}
║ 📖 *Definition:* ${definition.definition}
║ 💡 *Example:* ${definition.example || 'N/A'}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
    );
  } catch (error) {
    await addReaction(conn, from, mek.key, "❌");
    if (error.response?.status === 404) {
      reply("❌ *Word not found!* Please check the spelling.");
    } else {
      reply("❌ *Failed to get word definition.*");
    }
  }
});

// ------------------- SHORTCUT TOOLS ------------------- //
const shortcuts = [
  { name: "currency", desc: "Currency converter (mock)" },
  { name: "iplookup", desc: "IP address lookup" },
  { name: "base64", desc: "Encode to base64" },
  { name: "unbase64", desc: "Decode from base64" },
  { name: "screenshot", desc: "Take website screenshot" },
  { name: "fact", desc: "Random fact" },
  { name: "joke", desc: "Random joke" },
  { name: "meme", desc: "Random meme" },
  { name: "tts", desc: "Text to speech" },
  { name: "ocr", desc: "Image to text" },
  { name: "pdfmerge", desc: "Merge PDF files" },
  { name: "password", desc: "Generate password" },
  { name: "uuid", desc: "Generate UUID" },
  { name: "ascii", desc: "Convert to ASCII art" },
  { name: "morse", desc: "Convert to Morse code" },
  { name: "unmorse", desc: "Decode Morse code" },
  { name: "binary", desc: "Convert to binary" },
  { name: "unbinary", desc: "Convert from binary" },
  { name: "hex", desc: "Convert to hex" },
  { name: "unhex", desc: "Convert from hex" },
  { name: "reverse", desc: "Reverse text" },
  { name: "randomnum", desc: "Generate random number" },
  { name: "roll", desc: "Roll a dice" },
  { name: "flip", desc: "Flip a coin" },
  { name: "quote", desc: "Random quote" },
  { name: "advice", desc: "Random advice" },
  { name: "cat", desc: "Random cat image" },
  { name: "dog", desc: "Random dog image" },
  { name: "fox", desc: "Random fox image" },
  { name: "anime", desc: "Random anime image" },
  { name: "waifu", desc: "Random waifu image" },
  { name: "reminder", desc: "Set a reminder" },
  { name: "note", desc: "Save a note" },
  { name: "timer", desc: "Set a timer" },
  { name: "stopwatch", desc: "Start stopwatch" },
  { name: "alarm", desc: "Set an alarm" },
  { name: "songsearch", desc: "Search for songs" },
  { name: "lyrics", desc: "Get song lyrics" },
  { name: "movie", desc: "Movie information" },
  { name: "tv", desc: "TV show information" },
  { name: "news", desc: "Latest news" },
];

for (let s of shortcuts) {
  toolCommand(s.name, s.desc, async (conn, mek, m, { from, args, reply }) => {
    try {
      await addReaction(conn, from, mek.key, "⏳");
      await addReaction(conn, from, mek.key, "✅");
      
      reply(
        `╔══════════════════════════════════╗
║     🔧 *TOOL EXECUTED*           ║
╠══════════════════════════════════╣
║ 🛠️ *Tool:* ${s.name}
║ 📝 *Description:* ${s.desc}
║ 📌 *Args:* ${args.join(" ") || "none"}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
⚡ *This is a shortcut command.*
⚡ *Full implementation coming soon!*

⚡ *MULAA SIGIL XMD* | 👑 *Mulax Prime*`
      );
    } catch (e) {
      await addReaction(conn, from, mek.key, "❌");
      reply(`❌ Error executing ${s.name}`);
    }
  });
}
// plugins/vip.js
const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const config = require("../config");

const ecoFile = path.join(__dirname, "../lib/economy.json");
if (!fs.existsSync(ecoFile)) fs.writeFileSync(ecoFile, "{}");
let ecoDB = JSON.parse(fs.readFileSync(ecoFile));

// Economy helpers
function getUserEco(userId) {
  if (!ecoDB[userId]) {
    ecoDB[userId] = { 
      wallet: 500, 
      bank: 0, 
      inventory: [], 
      lastDaily: null, 
      cooldowns: {},
      vipGamesPlayed: 0,
      vipWins: 0
    };
    saveEco();
  }
  return ecoDB[userId];
}

function updateUserEco(userId, newData) {
  ecoDB[userId] = newData;
  saveEco();
}

function saveEco() {
  fs.writeFileSync(ecoFile, JSON.stringify(ecoDB, null, 2));
}

// VIP check (10k+ coins required)
function checkVIP(sender) {
  const user = getUserEco(sender);
  return (user.wallet + user.bank) >= 10000;
}

// ------------------ VIP MENU ------------------
cmd(
  {
    pattern: "vip",
    alias: ["vipmenu", "casino"],
    desc: "Access VIP games (10k+ coins required)",
    category: "vip",
    react: "💎",
    filename: __filename,
    fromMe: false,
  },
  async (conn, m, _, { from, sender, reply }) => {
    try {
      await conn.sendMessage(from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      if (!checkVIP(sender)) {
        await conn.sendMessage(from, {
          react: {
            text: "❌",
            key: m.key
          }
        });
        return reply(`❌ *VIP Access Denied!*\nYou need at least *10,000 coins* to access VIP games.\n💵 Your total: *${(getUserEco(sender).wallet + getUserEco(sender).bank)}* coins`);
      }

      const user = getUserEco(sender);
      const userNumber = sender.split("@")[0];
      const botImage = { url: "https://files.catbox.moe/przy2f.png" };
      
      const vipMenu = `
╔══════════════════════════════════╗
║     💎 *VIP CASINO MENU* 💎      ║
╠══════════════════════════════════╣
║ 👤 *Player:* @${userNumber}
║ 💰 *Wallet:* ${user.wallet} coins
║ 🏦 *Bank:* ${user.bank} coins
║ 🎮 *Games Played:* ${user.vipGamesPlayed || 0}
║ 🏆 *Wins:* ${user.vipWins || 0}
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
🎮 *GAMES*
━━━━━━━━━━━━━━━━━━━━━━

🎲 *${config.PREFIX}vipdice* - Roll dice (100-600 coins)
🎰 *${config.PREFIX}vipslot* - Slot machine (0-2000 coins)
🪙 *${config.PREFIX}vipcoinflip* - Flip coin (bet amount)
🔢 *${config.PREFIX}vipguess* - Guess number 1-10 (5x bet)
🎯 *${config.PREFIX}viptarget* - Hit target (0-2000 coins)
🃏 *${config.PREFIX}vipblackjack* - Play blackjack (500 coins)
🎡 *${config.PREFIX}vipwheel* - Spin wheel (0-5000 coins)
💰 *${config.PREFIX}vipjackpot* - Try jackpot (10% win rate)
🎟️ *${config.PREFIX}vipraffle* - Enter raffle (20% win rate)
🃏 *${config.PREFIX}vippoker* - Play poker (2x bet)

━━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by MULAA SIGIL XMD*
👑 *Owner:* Mulax Prime
      `;

      await conn.sendMessage(from, {
        react: {
          text: "✅",
          key: m.key
        }
      });

      await conn.sendMessage(from, { 
        image: botImage, 
        caption: vipMenu, 
        mentions: [sender] 
      });

    } catch (e) {
      console.error("VIP Menu Error:", e);
      await conn.sendMessage(from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      reply("❌ Error loading VIP menu.");
    }
  }
);

// ------------------ VIP DICE ------------------
cmd(
  { 
    pattern: "vipdice", 
    alias: ["vipdice"],
    desc: "Roll dice (100-600 coins)",
    category: "vip", 
    react: "🎲",
    filename: __filename 
  },
  async (conn, m, _, { from, sender, reply }) => {
    try {
      await conn.sendMessage(from, {
        react: {
          text: "🎲",
          key: m.key
        }
      });

      if (!checkVIP(sender)) return reply("❌ *VIP Only!*\nYou need 10,000+ coins to play VIP games.");

      const user = getUserEco(sender);
      const roll = Math.floor(Math.random() * 6) + 1;
      const coins = roll * 100;
      
      user.wallet += coins;
      user.vipGamesPlayed = (user.vipGamesPlayed || 0) + 1;
      if (roll > 3) user.vipWins = (user.vipWins || 0) + 1;
      
      updateUserEco(sender, user);

      await reply(`🎲 *VIP DICE*\n\n🎲 Rolled: *${roll}*\n💰 Won: *${coins} coins*\n💵 New Balance: *${user.wallet} coins*`);

    } catch (e) {
      console.error(e);
      reply("❌ Error playing VIP dice.");
    }
  }
);

// ------------------ VIP SLOT MACHINE ------------------
cmd(
  { 
    pattern: "vipslot", 
    alias: ["vipslot"],
    desc: "Slot machine (0-2000 coins)",
    category: "vip", 
    react: "🎰",
    filename: __filename 
  },
  async (conn, m, _, { from, sender, reply }) => {
    try {
      await conn.sendMessage(from, {
        react: {
          text: "🎰",
          key: m.key
        }
      });

      if (!checkVIP(sender)) return reply("❌ *VIP Only!*\nYou need 10,000+ coins to play VIP games.");

      const user = getUserEco(sender);
      const symbols = ["🍒", "🍋", "🍉", "🍇", "⭐", "💎", "🎰"];
      const slot = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];
      
      let coinsWon = 0;
      if (slot[0] === slot[1] && slot[1] === slot[2]) {
        coinsWon = 2000;
        user.vipWins = (user.vipWins || 0) + 1;
      } else if (slot[0] === slot[1] || slot[1] === slot[2] || slot[0] === slot[2]) {
        coinsWon = 500;
      }
      
      user.wallet += coinsWon;
      user.vipGamesPlayed = (user.vipGamesPlayed || 0) + 1;
      updateUserEco(sender, user);

      await reply(`🎰 *VIP SLOT MACHINE*\n\n┌─${slot[0]}─${slot[1]}─${slot[2]}─┐\n\n💰 Won: *${coinsWon} coins*\n💵 New Balance: *${user.wallet} coins*`);

    } catch (e) {
      console.error(e);
      reply("❌ Error playing VIP slot.");
    }
  }
);

// ------------------ VIP COIN FLIP ------------------
cmd(
  { 
    pattern: "vipcoinflip", 
    alias: ["vipcf"],
    desc: "Flip a coin (bet amount)",
    category: "vip", 
    react: "🪙",
    filename: __filename 
  },
  async (conn, m, _, { from, sender, args, reply }) => {
    try {
      await conn.sendMessage(from, {
        react: {
          text: "🪙",
          key: m.key
        }
      });

      if (!checkVIP(sender)) return reply("❌ *VIP Only!*\nYou need 10,000+ coins to play VIP games.");

      const user = getUserEco(sender);
      
      if (!args[0] || !args[1]) {
        return reply("❌ *Usage:* `.vipcoinflip <heads/tails> <amount>`\n📌 *Example:* `.vipcoinflip heads 500`");
      }
      
      const choice = args[0].toLowerCase();
      const bet = parseInt(args[1]);
      
      if (choice !== "heads" && choice !== "tails") {
        return reply("❌ Choose *heads* or *tails*!");
      }
      
      if (isNaN(bet) || bet < 100) {
        return reply("❌ Minimum bet is *100 coins*!");
      }
      
      if (user.wallet < bet) {
        return reply(`❌ Insufficient funds! You have *${user.wallet} coins*`);
      }
      
      const flip = Math.random() < 0.5 ? "heads" : "tails";
      user.wallet -= bet;
      user.vipGamesPlayed = (user.vipGamesPlayed || 0) + 1;
      
      let resultMsg = "";
      if (flip === choice) {
        user.wallet += bet * 2;
        user.vipWins = (user.vipWins || 0) + 1;
        resultMsg = `✅ *WIN!* Coin landed on *${flip}*!`;
      } else {
        resultMsg = `❌ *LOSS!* Coin landed on *${flip}*!`;
      }
      
      updateUserEco(sender, user);
      
      await reply(`🪙 *VIP COIN FLIP*\n\n${resultMsg}\n💰 Bet: *${bet} coins*\n💵 New Balance: *${user.wallet} coins*`);

    } catch (e) {
      console.error(e);
      reply("❌ Error playing VIP coin flip.");
    }
  }
);

// ------------------ VIP NUMBER GUESS ------------------
cmd(
  { 
    pattern: "vipguess", 
    alias: ["vipguess"],
    desc: "Guess number 1-10 (5x bet)",
    category: "vip", 
    react: "🔢",
    filename: __filename 
  },
  async (conn, m, _, { from, sender, args, reply }) => {
    try {
      await conn.sendMessage(from, {
        react: {
          text: "🔢",
          key: m.key
        }
      });

      if (!checkVIP(sender)) return reply("❌ *VIP Only!*\nYou need 10,000+ coins to play VIP games.");

      const user = getUserEco(sender);
      
      if (!args[0] || !args[1]) {
        return reply("❌ *Usage:* `.vipguess <1-10> <amount>`\n📌 *Example:* `.vipguess 5 200`");
      }
      
      const guess = parseInt(args[0]);
      const bet = parseInt(args[1]);
      
      if (guess < 1 || guess > 10) {
        return reply("❌ Number must be between *1 and 10*!");
      }
      
      if (isNaN(bet) || bet < 100) {
        return reply("❌ Minimum bet is *100 coins*!");
      }
      
      if (user.wallet < bet) {
        return reply(`❌ Insufficient funds! You have *${user.wallet} coins*`);
      }
      
      const number = Math.floor(Math.random() * 10) + 1;
      user.wallet -= bet;
      user.vipGamesPlayed = (user.vipGamesPlayed || 0) + 1;
      
      let resultMsg = "";
      if (guess === number) {
        const winAmount = bet * 5;
        user.wallet += winAmount;
        user.vipWins = (user.vipWins || 0) + 1;
        resultMsg = `✅ *CORRECT!* Number was *${number}*!`;
      } else {
        resultMsg = `❌ *WRONG!* Number was *${number}*!`;
      }
      
      updateUserEco(sender, user);
      
      await reply(`🔢 *VIP NUMBER GUESS*\n\n${resultMsg}\n💰 Bet: *${bet} coins*\n💵 New Balance: *${user.wallet} coins*`);

    } catch (e) {
      console.error(e);
      reply("❌ Error playing VIP guess.");
    }
  }
);

// ------------------ VIP TARGET ------------------
cmd(
  { 
    pattern: "viptarget", 
    alias: ["viptarget"],
    desc: "Hit a target (0-2000 coins)",
    category: "vip", 
    react: "🎯",
    filename: __filename 
  },
  async (conn, m, _, { from, sender, reply }) => {
    try {
      await conn.sendMessage(from, {
        react: {
          text: "🎯",
          key: m.key
        }
      });

      if (!checkVIP(sender)) return reply("❌ *VIP Only!*\nYou need 10,000+ coins to play VIP games.");

      const user = getUserEco(sender);
      
      const targets = [
        { name: "🎯 *BULLSEYE!*", win: 2000 },
        { name: "🎯 *NEAR HIT!*", win: 1000 },
        { name: "🎯 *HIT!*", win: 500 },
        { name: "🎯 *MISS!*", win: 0 },
        { name: "🎯 *CRITICAL HIT!*", win: 3000 }
      ];
      
      const result = targets[Math.floor(Math.random() * targets.length)];
      
      user.wallet += result.win;
      user.vipGamesPlayed = (user.vipGamesPlayed || 0) + 1;
      if (result.win > 0) user.vipWins = (user.vipWins || 0) + 1;
      
      updateUserEco(sender, user);
      
      await reply(`🎯 *VIP TARGET PRACTICE*\n\n${result.name}\n💰 Won: *${result.win} coins*\n💵 New Balance: *${user.wallet} coins*`);

    } catch (e) {
      console.error(e);
      reply("❌ Error playing VIP target.");
    }
  }
);

// ------------------ VIP BLACKJACK ------------------
cmd(
  { 
    pattern: "vipblackjack", 
    alias: ["vipbj"],
    desc: "Play blackjack (500 coins)",
    category: "vip", 
    react: "🃏",
    filename: __filename 
  },
  async (conn, m, _, { from, sender, reply }) => {
    try {
      await conn.sendMessage(from, {
        react: {
          text: "🃏",
          key: m.key
        }
      });

      if (!checkVIP(sender)) return reply("❌ *VIP Only!*\nYou need 10,000+ coins to play VIP games.");

      const user = getUserEco(sender);
      const bet = 500;
      
      if (user.wallet < bet) {
        return reply(`❌ Insufficient funds! You need *${bet} coins* to play. You have *${user.wallet} coins*`);
      }
      
      user.wallet -= bet;
      user.vipGamesPlayed = (user.vipGamesPlayed || 0) + 1;
      
      const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
      const player = [cards[Math.floor(Math.random() * cards.length)], cards[Math.floor(Math.random() * cards.length)]];
      const dealer = [cards[Math.floor(Math.random() * cards.length)], cards[Math.floor(Math.random() * cards.length)]];
      
      const result = Math.random() < 0.45 ? "win" : "loss"; // Slightly less than 50% win rate
      
      let resultMsg = "";
      if (result === "win") {
        user.wallet += bet * 2;
        user.vipWins = (user.vipWins || 0) + 1;
        resultMsg = "✅ *YOU WIN!*";
      } else {
        resultMsg = "❌ *DEALER WINS!*";
      }
      
      updateUserEco(sender, user);
      
      await reply(`🃏 *VIP BLACKJACK*\n\n${resultMsg}\n🎴 Your cards: ${player.join(" - ")}\n🎴 Dealer cards: ${dealer.join(" - ")}\n💰 Bet: *${bet} coins*\n💵 New Balance: *${user.wallet} coins*`);

    } catch (e) {
      console.error(e);
      reply("❌ Error playing VIP blackjack.");
    }
  }
);

// ------------------ VIP WHEEL ------------------
cmd(
  { 
    pattern: "vipwheel", 
    alias: ["vipwheel"],
    desc: "Spin lucky wheel (0-5000 coins)",
    category: "vip", 
    react: "🎡",
    filename: __filename 
  },
  async (conn, m, _, { from, sender, reply }) => {
    try {
      await conn.sendMessage(from, {
        react: {
          text: "🎡",
          key: m.key
        }
      });

      if (!checkVIP(sender)) return reply("❌ *VIP Only!*\nYou need 10,000+ coins to play VIP games.");

      const user = getUserEco(sender);
      
      const prizes = [0, 100, 200, 500, 1000, 2000, 5000, 10000];
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      
      user.wallet += prize;
      user.vipGamesPlayed = (user.vipGamesPlayed || 0) + 1;
      if (prize > 0) user.vipWins = (user.vipWins || 0) + 1;
      
      updateUserEco(sender, user);
      
      await reply(`🎡 *VIP LUCKY WHEEL*\n\n🎉 You won: *${prize} coins*!\n💵 New Balance: *${user.wallet} coins*`);

    } catch (e) {
      console.error(e);
      reply("❌ Error spinning VIP wheel.");
    }
  }
);

// ------------------ VIP JACKPOT ------------------
cmd(
  { 
    pattern: "vipjackpot", 
    alias: ["vipjp"],
    desc: "Try VIP jackpot (10% win rate)",
    category: "vip", 
    react: "💰",
    filename: __filename 
  },
  async (conn, m, _, { from, sender, reply }) => {
    try {
      await conn.sendMessage(from, {
        react: {
          text: "💰",
          key: m.key
        }
      });

      if (!checkVIP(sender)) return reply("❌ *VIP Only!*\nYou need 10,000+ coins to play VIP games.");

      const user = getUserEco(sender);
      const bet = 1000;
      
      if (user.wallet < bet) {
        return reply(`❌ Insufficient funds! You need *${bet} coins* to play. You have *${user.wallet} coins*`);
      }
      
      user.wallet -= bet;
      user.vipGamesPlayed = (user.vipGamesPlayed || 0) + 1;
      
      const jackpot = Math.random() < 0.1; // 10% chance
      
      let resultMsg = "";
      if (jackpot) {
        user.wallet += 10000;
        user.vipWins = (user.vipWins || 0) + 1;
        resultMsg = "💎 *JACKPOT!* You won 10,000 coins!";
      } else {
        resultMsg = "❌ No jackpot this time.";
      }
      
      updateUserEco(sender, user);
      
      await reply(`💰 *VIP JACKPOT*\n\n${resultMsg}\n💰 Bet: *${bet} coins*\n💵 New Balance: *${user.wallet} coins*`);

    } catch (e) {
      console.error(e);
      reply("❌ Error playing VIP jackpot.");
    }
  }
);

// ------------------ VIP RAFFLE ------------------
cmd(
  { 
    pattern: "vipraffle", 
    alias: ["vipraffle"],
    desc: "Enter VIP raffle (20% win rate)",
    category: "vip", 
    react: "🎟️",
    filename: __filename 
  },
  async (conn, m, _, { from, sender, reply }) => {
    try {
      await conn.sendMessage(from, {
        react: {
          text: "🎟️",
          key: m.key
        }
      });

      if (!checkVIP(sender)) return reply("❌ *VIP Only!*\nYou need 10,000+ coins to play VIP games.");

      const user = getUserEco(sender);
      const bet = 500;
      
      if (user.wallet < bet) {
        return reply(`❌ Insufficient funds! You need *${bet} coins* to play. You have *${user.wallet} coins*`);
      }
      
      user.wallet -= bet;
      user.vipGamesPlayed = (user.vipGamesPlayed || 0) + 1;
      
      const won = Math.random() < 0.2; // 20% chance
      
      let resultMsg = "";
      if (won) {
        user.wallet += 5000;
        user.vipWins = (user.vipWins || 0) + 1;
        resultMsg = "🎟️ *WINNER!* You won 5,000 coins!";
      } else {
        resultMsg = "❌ Sorry, no win this time.";
      }
      
      updateUserEco(sender, user);
      
      await reply(`🎟️ *VIP RAFFLE*\n\n${resultMsg}\n💰 Bet: *${bet} coins*\n💵 New Balance: *${user.wallet} coins*`);

    } catch (e) {
      console.error(e);
      reply("❌ Error entering VIP raffle.");
    }
  }
);

// ------------------ VIP POKER ------------------
cmd(
  { 
    pattern: "vippoker", 
    alias: ["vippoker"],
    desc: "Play VIP poker (2x bet)",
    category: "vip", 
    react: "🃏",
    filename: __filename 
  },
  async (conn, m, _, { from, sender, args, reply }) => {
    try {
      await conn.sendMessage(from, {
        react: {
          text: "🃏",
          key: m.key
        }
      });

      if (!checkVIP(sender)) return reply("❌ *VIP Only!*\nYou need 10,000+ coins to play VIP games.");

      const user = getUserEco(sender);
      
      let bet = 1000;
      if (args[0]) {
        bet = parseInt(args[0]);
        if (isNaN(bet) || bet < 100) {
          return reply("❌ Minimum bet is *100 coins*!");
        }
      }
      
      if (user.wallet < bet) {
        return reply(`❌ Insufficient funds! You have *${user.wallet} coins*`);
      }
      
      user.wallet -= bet;
      user.vipGamesPlayed = (user.vipGamesPlayed || 0) + 1;
      
      const result = Math.random() < 0.5 ? "win" : "loss";
      
      let resultMsg = "";
      if (result === "win") {
        user.wallet += bet * 2;
        user.vipWins = (user.vipWins || 0) + 1;
        resultMsg = "✅ *YOU WIN!*";
      } else {
        resultMsg = "❌ *YOU LOSE!*";
      }
      
      updateUserEco(sender, user);
      
      await reply(`🃏 *VIP POKER*\n\n${resultMsg}\n💰 Bet: *${bet} coins*\n💵 New Balance: *${user.wallet} coins*`);

    } catch (e) {
      console.error(e);
      reply("❌ Error playing VIP poker.");
    }
  }
);
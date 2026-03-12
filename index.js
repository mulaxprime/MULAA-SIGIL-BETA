
// CUSTOMIZED FOR MULAA SIGIL XMD

const express = require('express');
const path = require('path');
const fs = require('fs');
const { createSpinner } = require('nanospinner');
const chalk = require('chalk');
const QRCode = require('qrcode');
const { jidDecode } = require('@whiskeysockets/baileys');

const spinner = createSpinner();
const PORT = process.env.PORT || 3000;
const { makeWASocket } = require('@whiskeysockets/baileys');
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ============================================
// YOUR BOT CONFIGURATION
// ============================================
const BOT_NAME = 'MULAA SIGIL XMD';
const PREFIX = '.';
const OWNER_NUMBER = '26775462914';
const OWNER_NAME = 'Mulax Prime';
const AUTO_READ = false;
const AUTO_STATUS_READ = false;
const REJECT_CALL = false;
const CONFIG_FILE = path.join(__dirname, 'config.json');
// ============================================

// Load command system
let commandSystem;
try {
    commandSystem = require('./command.js');
    console.log(chalk.green(`✅ Loaded command system with ${commandSystem.commands?.length || 0} commands`));
} catch (e) {
    console.log(chalk.yellow('⚠️ Command system not found, creating empty command list'));
    commandSystem = { commands: [], cmd: () => {} };
}

// Load or create config
let config = {};
if (fs.existsSync(CONFIG_FILE)) {
    try {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        console.log(chalk.green('✅ Config loaded successfully'));
    } catch (e) {
        console.log(chalk.yellow('⚠️ Config file corrupted, creating new one'));
        config = {};
    }
} else {
    console.log(chalk.blue('📝 Creating new config file...'));
    config = {
        session: '',
        ownerNumber: OWNER_NUMBER,
        ownerName: OWNER_NAME,
        botName: BOT_NAME,
        prefix: PREFIX
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

const SESSION_ID = config.session || '';

// Stats tracking
const stats = {
    startTime: Date.now(),
    messagesReceived: 0,
    messagesSent: 0,
    log(message) {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        console.log(`[${new Date().toLocaleTimeString()}] [Uptime: ${uptime}s] ${message}`);
    },
    incrementReceived() {
        this.messagesReceived++;
    },
    incrementSent() {
        this.messagesSent++;
    },
    getStats() {
        return {
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            received: this.messagesReceived,
            sent: this.messagesSent,
            memory: process.memoryUsage().rss / 1024 / 1024
        };
    }
};

// Store current QR code
let currentQR = null;
let connectionStatus = 'disconnected';

// Function to save session to config
function saveSessionToConfig(sessionData) {
    try {
        config.session = sessionData;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        stats.log('✅ Session saved to config.json');
        return true;
    } catch (error) {
        stats.log(`❌ Failed to save session: ${error.message}`);
        return false;
    }
}

// Function to encode session to base64
function encodeSessionToBase64() {
    try {
        const authFolder = 'auth_info_baileys';
        const credsFile = path.join(authFolder, 'creds.json');
        
        if (fs.existsSync(credsFile)) {
            const credsData = fs.readFileSync(credsFile, 'utf-8');
            const base64Session = Buffer.from(credsData).toString('base64');
            return base64Session;
        }
        return null;
    } catch (error) {
        stats.log(`Error encoding session: ${error.message}`);
        return null;
    }
}

// Function to load or create session
async function initializeSession() {
    try {
        const authFolder = 'auth_info_baileys';
        connectionStatus = 'connecting';
        
        // If we have a session ID in config, try to use it
        if (SESSION_ID) {
            stats.log('Found session in config, attempting to restore...');
            try {
                // Decode base64 session
                const sessionJson = Buffer.from(SESSION_ID, 'base64').toString('utf-8');
                
                // Create auth folder if it doesn't exist
                if (!fs.existsSync(authFolder)) {
                    fs.mkdirSync(authFolder, { recursive: true });
                }
                
                // Save decoded session
                fs.writeFileSync(
                    path.join(authFolder, 'creds.json'),
                    sessionJson
                );
                
                stats.log('✅ Session restored from config');
            } catch (e) {
                stats.log('❌ Failed to restore session from config, will generate new QR');
                connectionStatus = 'qr_required';
            }
        } else {
            connectionStatus = 'qr_required';
        }
        
        const { state, saveCreds } = await useMultiFileAuthState(authFolder);
        const { version } = await fetchLatestBaileysVersion();
        
        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            browser: [BOT_NAME, 'Safari', '1.0.0'],
            syncFullHistory: false,
            markOnlineOnConnect: true,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 25000,
            logger: pino({ level: 'silent' })
        });
        
        // Handle QR code
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                connectionStatus = 'qr_ready';
                currentQR = qr;
                
                try {
                    const qrDataURL = await QRCode.toDataURL(qr);
                    fs.writeFileSync(
                        path.join(__dirname, 'public', 'qr.json'),
                        JSON.stringify({ 
                            qr: qr, 
                            qrDataURL: qrDataURL,
                            timestamp: Date.now() 
                        })
                    );
                } catch (e) {
                    console.error('Error generating QR data URL:', e);
                }
                
                stats.log('📱 QR Code generated. Please scan on the web interface:');
                stats.log(`🌐 Open http://localhost:${PORT} to scan`);
            }
            
            if (connection === 'close') {
                currentQR = null;
                const reason = lastDisconnect?.error?.output?.statusCode;
                if (reason !== DisconnectReason.loggedOut) {
                    connectionStatus = 'reconnecting';
                    stats.log('Connection closed. Reconnecting in 5 seconds...');
                    setTimeout(initializeSession, 5000);
                } else {
                    connectionStatus = 'logged_out';
                    stats.log('❌ Logged out. Please restart the bot.');
                    try {
                        fs.rmSync(authFolder, { recursive: true, force: true });
                        config.session = '';
                        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
                    } catch (e) {}
                    setTimeout(initializeSession, 3000);
                }
            }
            
            if (connection === 'open') {
                connectionStatus = 'connected';
                currentQR = null;
                stats.log(`✅ Bot connected as ${sock.user?.id?.split(':')[0]}`);
                
                const base64Session = encodeSessionToBase64();
                if (base64Session) {
                    saveSessionToConfig(base64Session);
                    stats.log('✅ Session saved to config.json for future use');
                }
                
                showStartupMessage(sock);
            }
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message) return;
            
            await handleMessage(sock, msg);
        });
        
        if (AUTO_STATUS_READ) {
            sock.ev.on('messages.upsert', async ({ messages }) => {
                const statusMsg = messages[0];
                if (statusMsg.key && statusMsg.key.remoteJid === 'status@broadcast') {
                    try {
                        await sock.readMessages([statusMsg.key]);
                        if (AUTO_STATUS_READ === 'reply') {
                            await sock.sendMessage(statusMsg.key.remoteJid, {
                                text: '👀',
                                mentions: [statusMsg.key.participant]
                            });
                        }
                    } catch (e) {}
                }
            });
        }
        
        if (REJECT_CALL) {
            sock.ev.on('call', async ({ calls }) => {
                const call = calls[0];
                if (!call || !call.from) return;
                try {
                    await sock.rejectCall(call.id, call.from);
                    if (OWNER_NUMBER === 'reject') {
                        await sock.sendMessage(call.from, {
                            text: '📞 Calls are not accepted. Please send a message instead.',
                            mentions: [call.from]
                        });
                    }
                } catch (e) {}
            });
        }
        
        return sock;
    } catch (error) {
        stats.log(`Error initializing: ${error.message}`);
        connectionStatus = 'error';
        setTimeout(initializeSession, 5000);
    }
}

// ============================================
// FIXED MESSAGE HANDLER FOR COMMAND SYSTEM
// ============================================
async function handleMessage(sock, msg) {
    try {
        stats.incrementReceived();
        
        const messageContent = msg.message;
        const sender = msg.key.remoteJid;
        const fromMe = msg.key.fromMe;
        const pushName = msg.pushName || '';
        const isGroup = sender.endsWith('@g.us');
        const senderId = msg.key.participant || sender;
        
        let messageText = '';
        if (messageContent?.conversation) {
            messageText = messageContent.conversation;
        } else if (messageContent?.extendedTextMessage?.text) {
            messageText = messageContent.extendedTextMessage.text;
        } else if (messageContent?.imageMessage?.caption) {
            messageText = messageContent.imageMessage.caption;
        } else {
            return; // Not a text message
        }
        
        const hasPrefix = messageText.startsWith(PREFIX);
        if (!hasPrefix && !AUTO_READ) return;
        
        const command = messageText.slice(PREFIX.length).trim().split(/ +/)[0].toLowerCase();
        const args = messageText.trim().split(/ +/).slice(1);
        const fullArgs = args.join(' ');
        const isOwner = senderId.includes(OWNER_NUMBER) || msg.key.fromMe;
        
        // Create reply function
        const reply = async (text) => {
            try {
                return await sock.sendMessage(sender, { text: text.toString() }, { quoted: msg });
            } catch (e) {
                console.error('Reply error:', e);
            }
        };
        
        // Try to execute command from command.js system
        if (commandSystem && commandSystem.commands && commandSystem.commands.length > 0) {
            let commandExecuted = false;
            
            for (const cmd of commandSystem.commands) {
                // Check if command matches by pattern
                let matches = false;
                const cmdPattern = cmd.pattern || cmd.name;
                
                if (cmdPattern instanceof RegExp) {
                    matches = cmdPattern.test(command);
                } else if (typeof cmdPattern === 'string') {
                    matches = cmdPattern.toLowerCase() === command;
                    // Also check aliases if they exist
                    if (!matches && cmd.alias && Array.isArray(cmd.alias)) {
                        matches = cmd.alias.some(a => a.toLowerCase() === command);
                    }
                }
                
                if (matches) {
                    stats.incrementSent();
                    
                    // Check owner-only commands
                    if (cmd.fromMe && !isOwner) {
                        await reply('❌ This command is only for the owner!');
                        return;
                    }
                    
                    try {
                        // Execute command with the expected parameters
                        await cmd.function(
                            sock,                    // malvin (socket)
                            msg,                     // mek (message)
                            msg,                     // m (message)
                            {                        // context object
                                from: sender,
                                pushname: pushName,
                                sender: senderId,
                                reply: reply,
                                isGroup: isGroup,
                                body: messageText,
                                args: args,
                                fullArgs: fullArgs,
                                command: command,
                                isOwner: isOwner
                            }
                        );
                        commandExecuted = true;
                        break;
                    } catch (cmdError) {
                        console.error('Command execution error:', cmdError);
                        await reply(`❌ Error: ${cmdError.message}`);
                        commandExecuted = true;
                        break;
                    }
                }
            }
            
            if (commandExecuted) return;
        }
        
        // Command not found
        if (hasPrefix) {
            await reply(`❌ Command "${command}" not found. Use ${PREFIX}menu to see available commands.`);
        }
        
    } catch (error) {
        console.error('Handle message error:', error);
        stats.log(`Error handling message: ${error.message}`);
    }
}

async function showStartupMessage(sock) {
    try {
        const botNumber = sock.user?.id?.split(':')[0];
        const stats_data = stats.getStats();
        
        const welcomeMsg = `╔══════════════════════════════════╗
║     ${BOT_NAME} Activated!      ║
╠══════════════════════════════════╣
║ Bot Number: ${botNumber}${' '.repeat(25 - (botNumber?.length || 10))}║
║ Prefix: ${PREFIX}${' '.repeat(28 - PREFIX.length)}║
║ Owner: ${OWNER_NAME} (${OWNER_NUMBER})${' '.repeat(15 - OWNER_NAME.length)}║
║ Commands: ${commandSystem.commands?.length || 0} loaded${' '.repeat(15)}║
║ Messages: ${stats_data.received} received, ${stats_data.sent} sent${' '.repeat(10)}║
║ Memory: ${stats_data.memory.toFixed(2)} MB${' '.repeat(16)}║
╚══════════════════════════════════╝`;
        
        if (OWNER_NUMBER) {
            await sock.sendMessage(OWNER_NUMBER + '@s.whatsapp.net', { text: welcomeMsg });
            stats.log('Startup message sent to Mulax Prime');
        }
    } catch (error) {
        stats.log('Failed to send startup message');
    }
    loadPlugins();
}

// ============================================
// PLUGIN LOADING FUNCTION
// ============================================
function loadPlugins() {
    const pluginsDir = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir, { recursive: true });
        stats.log('Created plugins directory');
        return;
    }
    
    const pluginFiles = fs.readdirSync(pluginsDir);
    let loadedCount = 0;
    let failedCount = 0;
    
    pluginFiles.forEach(file => {
        if (file.endsWith('.js')) {
            const pluginPath = path.join(pluginsDir, file);
            try {
                delete require.cache[require.resolve(pluginPath)];
                const plugin = require(pluginPath);
                
                if (plugin && (typeof plugin === 'object' || typeof plugin === 'function')) {
                    loadedCount++;
                    stats.log(`✅ Loaded plugin: ${file}`);
                } else {
                    stats.log(`⚠️  Invalid plugin format: ${file}`);
                    failedCount++;
                }
            } catch (error) {
                if (error.message.includes('./economy')) {
                    stats.log(`⚠️  Plugin ${file} requires economy module - create plugins/economy.js`);
                    
                    const economyPath = path.join(pluginsDir, 'economy.js');
                    if (!fs.existsSync(economyPath)) {
                        try {
                            const basicEconomy = `module.exports = {
    name: 'economy',
    version: '1.0.0',
    users: {},
    getBalance: (userId) => 0,
    addBalance: (userId, amount) => amount,
    removeBalance: (userId, amount) => true,
    transfer: (from, to, amount) => true
};`;
                            fs.writeFileSync(economyPath, basicEconomy);
                            stats.log('✅ Created basic economy module');
                        } catch (e) {
                            stats.log(`❌ Failed to create economy module: ${e.message}`);
                        }
                    }
                } else {
                    stats.log(`❌ Failed to load plugin ${file}: ${error.message}`);
                }
                failedCount++;
            }
        }
    });
    
    stats.log(`📊 Plugins: ${loadedCount} loaded, ${failedCount} failed`);
}

// ============================================
// EXPRESS SERVER
// ============================================
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/qr', (req, res) => {
    const qrFile = path.join(__dirname, 'public', 'qr.json');
    if (fs.existsSync(qrFile) && currentQR) {
        try {
            const qrData = JSON.parse(fs.readFileSync(qrFile, 'utf-8'));
            res.json({ 
                success: true,
                qr: qrData.qr,
                qrDataURL: qrData.qrDataURL,
                status: connectionStatus 
            });
        } catch (e) {
            res.json({ success: false, qr: null, status: connectionStatus });
        }
    } else {
        res.json({ 
            success: false, 
            qr: null, 
            status: connectionStatus,
            message: connectionStatus === 'connected' ? 'Bot already connected' : 'No QR code available'
        });
    }
});

app.get('/api/status', (req, res) => {
    const systemStats = stats.getStats();
    const authFolder = 'auth_info_baileys';
    const hasSession = fs.existsSync(path.join(authFolder, 'creds.json'));
    
    res.json({
        success: true,
        connected: connectionStatus === 'connected',
        status: connectionStatus,
        botName: BOT_NAME,
        owner: OWNER_NAME,
        ownerNumber: OWNER_NUMBER,
        prefix: PREFIX,
        uptime: systemStats.uptime,
        messages: {
            received: systemStats.received,
            sent: systemStats.sent
        },
        memory: `${systemStats.memory.toFixed(2)} MB`,
        hasSession: !!config.session,
        hasAuthFolder: hasSession,
        totalCommands: commandSystem.commands?.length || 0
    });
});

app.post('/api/logout', (req, res) => {
    try {
        const authFolder = 'auth_info_baileys';
        if (fs.existsSync(authFolder)) {
            fs.rmSync(authFolder, { recursive: true, force: true });
        }
        config.session = '';
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        connectionStatus = 'disconnected';
        currentQR = null;
        
        res.json({ success: true, message: 'Logged out successfully' });
        setTimeout(initializeSession, 1000);
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.get('/status', (req, res) => {
    const systemStats = stats.getStats();
    res.json({
        status: connectionStatus,
        botName: BOT_NAME,
        version: '1.0.0',
        owner: OWNER_NAME,
        ownerNumber: OWNER_NUMBER,
        prefix: PREFIX,
        mode: AUTO_READ ? 'public' : 'private',
        uptime: systemStats.uptime,
        messages: {
            received: systemStats.received,
            sent: systemStats.sent
        },
        memory: `${systemStats.memory.toFixed(2)} MB`,
        totalCommands: commandSystem.commands?.length || 0
    });
});

app.listen(PORT, () => {
    stats.log(`🌐 Web interface available at http://localhost:${PORT}`);
    stats.log(`📱 QR API available at http://localhost:${PORT}/api/qr`);
    stats.log(`📝 Command system loaded: ${commandSystem.commands?.length || 0} commands`);
});

// ============================================
// PROCESS HANDLERS
// ============================================
process.on('uncaughtException', (error) => {
    stats.log(`Uncaught Exception: ${error}`);
});

process.on('unhandledRejection', (reason) => {
    stats.log(`Unhandled Rejection: ${reason.message}`);
    setTimeout(initializeSession, 10000);
});

// ============================================
// STARTUP MESSAGE
// ============================================
console.clear();
console.log('╔══════════════════════════════════╗');
console.log('║     MULAA SIGIL XMD v1.0         ║');
console.log('╠══════════════════════════════════╣');
console.log(`║ Bot Name: ${BOT_NAME}${' '.repeat(20 - BOT_NAME.length)}║`);
console.log(`║ Owner: Mulax Prime (26775462914)${' '.repeat(5)}║`);
console.log(`║ Prefix: ${PREFIX}${' '.repeat(28 - PREFIX.length)}║`);
console.log(`║ Commands: ${commandSystem.commands?.length || 0} loaded${' '.repeat(15)}║`);
console.log(`║ Config: ${fs.existsSync(CONFIG_FILE) ? '✅ Loaded' : '📝 New'}${' '.repeat(18)}║`);
console.log('╚══════════════════════════════════╝');
stats.log('Initializing bot...');
stats.log('Created by Mulax Prime | Powered by QADEER-AI');

if (SESSION_ID) {
    stats.log('✅ Session found in config.json');
} else {
    stats.log('📱 No session found. QR code will be available on the web interface');
}

setTimeout(initializeSession, 1000);
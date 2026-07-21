// ============================================
// MULAA SIGIL XMD - Core System
// Version: 2.0.0
// Architecture: Modular Event-Driven
// ============================================

// ============================================
// SYSTEM IMPORTS
// ============================================
const express = require('express');
const path = require('path');
const fs = require('fs');
const { createSpinner } = require('nanospinner');
const chalk = require('chalk');
const QRCode = require('qrcode');
const { jidDecode, makeWASocket, useMultiFileAuthState, 
        DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

// ============================================
// CORE CONFIGURATION
// ============================================
const CONFIG = {
    bot: {
        name: 'MULAA SIGIL XMD',
        version: '2.0.0',
        prefix: '.',
        autoRead: false,
        autoStatusRead: false,
        rejectCalls: false
    },
    owner: {
        number: '26775462914',
        name: 'Mulax Prime'
    },
    system: {
        port: process.env.PORT || 3000,
        sessionFile: 'config.json',
        authFolder: 'auth_info_baileys'
    }
};

// ============================================
// UTILITY LAYER
// ============================================
class SystemUtilities {
    static createLogger() {
        return {
            info: (msg) => console.log(chalk.blue(`[${new Date().toLocaleTimeString()}] ℹ️ ${msg}`)),
            success: (msg) => console.log(chalk.green(`[${new Date().toLocaleTimeString()}] ✅ ${msg}`)),
            error: (msg) => console.log(chalk.red(`[${new Date().toLocaleTimeString()}] ❌ ${msg}`)),
            warn: (msg) => console.log(chalk.yellow(`[${new Date().toLocaleTimeString()}] ⚠️ ${msg}`))
        };
    }

    static async safeFileOperation(operation, fallback) {
        try {
            return await operation();
        } catch (error) {
            this.logger.error(`File operation failed: ${error.message}`);
            return fallback;
        }
    }

    static generateSessionId() {
        return Buffer.from(Date.now().toString() + Math.random().toString(36).substring(7)).toString('base64');
    }
}

// ============================================
// STATE MANAGEMENT
// ============================================
class ApplicationState {
    constructor() {
        this.metrics = {
            startTime: Date.now(),
            messagesReceived: 0,
            messagesSent: 0,
            errors: 0
        };
        this.connection = {
            status: 'disconnected',
            qrCode: null,
            socket: null
        };
        this.session = null;
    }

    updateMetrics(type) {
        if (type === 'receive') this.metrics.messagesReceived++;
        if (type === 'send') this.metrics.messagesSent++;
        if (type === 'error') this.metrics.errors++;
    }

    getSystemHealth() {
        return {
            uptime: Math.floor((Date.now() - this.metrics.startTime) / 1000),
            messages: {
                received: this.metrics.messagesReceived,
                sent: this.metrics.messagesSent
            },
            memory: process.memoryUsage().rss / 1024 / 1024,
            connection: this.connection.status,
            errors: this.metrics.errors
        };
    }
}

// ============================================
// SESSION MANAGEMENT
// ============================================
class SessionManager {
    constructor(configPath) {
        this.configPath = configPath;
        this.logger = new SystemUtilities.createLogger();
    }

    async loadSession() {
        try {
            if (!fs.existsSync(this.configPath)) {
                this.logger.warn('No session file found, creating new...');
                return this.createNewSession();
            }
            
            const data = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
            if (data.session) {
                this.logger.success('Session loaded successfully');
                return data.session;
            }
            return null;
        } catch (error) {
            this.logger.error(`Failed to load session: ${error.message}`);
            return null;
        }
    }

    createNewSession() {
        const defaultConfig = {
            session: '',
            owner: CONFIG.owner.number,
            botName: CONFIG.bot.name,
            prefix: CONFIG.bot.prefix,
            created: new Date().toISOString()
        };
        fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2));
        return null;
    }

    async saveSession(sessionData) {
        try {
            const config = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
            config.session = sessionData;
            config.updated = new Date().toISOString();
            fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
            this.logger.success('Session saved successfully');
            return true;
        } catch (error) {
            this.logger.error(`Failed to save session: ${error.message}`);
            return false;
        }
    }

    encodeSession(authFolder) {
        try {
            const credsFile = path.join(authFolder, 'creds.json');
            if (fs.existsSync(credsFile)) {
                const data = fs.readFileSync(credsFile, 'utf-8');
                return Buffer.from(data).toString('base64');
            }
            return null;
        } catch (error) {
            this.logger.error(`Session encoding failed: ${error.message}`);
            return null;
        }
    }
}

// ============================================
// WHATSAPP CONNECTION HANDLER
// ============================================
class WhatsAppConnection {
    constructor(stateManager, sessionManager) {
        this.state = stateManager;
        this.session = sessionManager;
        this.logger = new SystemUtilities.createLogger();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    async initialize() {
        try {
            // Load existing session
            const sessionData = await this.session.loadSession();
            if (sessionData) {
                await this.restoreSession(sessionData);
            }

            // Create auth folder if needed
            const authFolder = CONFIG.system.authFolder;
            if (!fs.existsSync(authFolder)) {
                fs.mkdirSync(authFolder, { recursive: true });
            }

            const { state, saveCreds } = await useMultiFileAuthState(authFolder);
            const { version } = await fetchLatestBaileysVersion();

            const socket = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
                browser: [CONFIG.bot.name, 'Safari', '1.0.0'],
                syncFullHistory: false,
                markOnlineOnConnect: true,
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 25000,
                logger: pino({ level: 'silent' })
            });

            this.state.connection.socket = socket;
            await this.setupEventListeners(socket, saveCreds);
            
            return socket;
        } catch (error) {
            this.logger.error(`Connection initialization failed: ${error.message}`);
            this.handleConnectionError(error);
        }
    }

    async setupEventListeners(socket, saveCreds) {
        // Connection update handler
        socket.ev.on('connection.update', async (update) => {
            await this.handleConnectionUpdate(update, socket);
        });

        // Credentials update handler
        socket.ev.on('creds.update', saveCreds);

        // Messages handler
        socket.ev.on('messages.upsert', async ({ messages }) => {
            await this.handleIncomingMessages(socket, messages);
        });

        // Call handler
        if (CONFIG.bot.rejectCalls) {
            socket.ev.on('call', async ({ calls }) => {
                await this.handleIncomingCalls(socket, calls);
            });
        }
    }

    async handleConnectionUpdate(update, socket) {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            this.state.connection.status = 'qr_ready';
            this.state.connection.qrCode = qr;
            await this.saveQRCode(qr);
            this.logger.info('📱 QR Code generated. Scan via web interface.');
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                this.state.connection.status = 'reconnecting';
                this.logger.warn('Connection lost. Reconnecting...');
                setTimeout(() => this.initialize(), 5000);
            } else {
                this.state.connection.status = 'logged_out';
                this.logger.error('Logged out. Session invalid.');
                await this.clearSession();
            }
        }

        if (connection === 'open') {
            this.state.connection.status = 'connected';
            this.state.connection.qrCode = null;
            this.reconnectAttempts = 0;
            this.logger.success(`Connected as ${socket.user?.id?.split(':')[0]}`);
            
            await this.saveCurrentSession(socket);
            await this.sendStartupMessage(socket);
        }
    }

    async handleIncomingMessages(socket, messages) {
        for (const message of messages) {
            if (!message.message) continue;
            this.state.updateMetrics('receive');
            await this.processMessage(socket, message);
        }
    }

    async processMessage(socket, message) {
        try {
            const messageContent = message.message;
            const sender = message.key.remoteJid;
            
            // Extract text content
            let text = '';
            if (messageContent?.conversation) text = messageContent.conversation;
            else if (messageContent?.extendedTextMessage?.text) text = messageContent.extendedTextMessage.text;
            else if (messageContent?.imageMessage?.caption) text = messageContent.imageMessage.caption;
            else return;

            // Check for command prefix
            if (!text.startsWith(CONFIG.bot.prefix)) return;

            // Parse command
            const [command, ...args] = text.slice(CONFIG.bot.prefix.length).trim().split(/\s+/);
            
            // Execute command
            await this.executeCommand(socket, message, {
                command: command.toLowerCase(),
                args,
                sender,
                isGroup: sender.endsWith('@g.us')
            });

        } catch (error) {
            this.logger.error(`Message processing failed: ${error.message}`);
            this.state.updateMetrics('error');
        }
    }

    async executeCommand(socket, message, context) {
        // Command execution logic here
        // This would integrate with your command system
    }

    async handleIncomingCalls(socket, calls) {
        for (const call of calls) {
            try {
                await socket.rejectCall(call.id, call.from);
                if (CONFIG.owner.number !== 'reject') {
                    await socket.sendMessage(call.from, {
                        text: '📞 Calls are not accepted. Please send a message.'
                    });
                }
            } catch (error) {
                this.logger.error(`Call handling failed: ${error.message}`);
            }
        }
    }

    async saveQRCode(qr) {
        try {
            const qrDataURL = await QRCode.toDataURL(qr);
            const publicDir = path.join(__dirname, 'public');
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }
            fs.writeFileSync(
                path.join(publicDir, 'qr.json'),
                JSON.stringify({
                    qr,
                    qrDataURL,
                    timestamp: Date.now()
                })
            );
        } catch (error) {
            this.logger.error(`QR save failed: ${error.message}`);
        }
    }

    async saveCurrentSession(socket) {
        const encoded = this.session.encodeSession(CONFIG.system.authFolder);
        if (encoded) {
            await this.session.saveSession(encoded);
        }
    }

    async clearSession() {
        try {
            fs.rmSync(CONFIG.system.authFolder, { recursive: true, force: true });
            await this.session.saveSession('');
            this.state.connection.status = 'disconnected';
        } catch (error) {
            this.logger.error(`Session clear failed: ${error.message}`);
        }
    }

    async restoreSession(sessionData) {
        try {
            const authFolder = CONFIG.system.authFolder;
            if (!fs.existsSync(authFolder)) {
                fs.mkdirSync(authFolder, { recursive: true });
            }
            const sessionJson = Buffer.from(sessionData, 'base64').toString('utf-8');
            fs.writeFileSync(path.join(authFolder, 'creds.json'), sessionJson);
            this.logger.success('Session restored successfully');
        } catch (error) {
            this.logger.error(`Session restore failed: ${error.message}`);
        }
    }

    async sendStartupMessage(socket) {
        try {
            const stats = this.state.getSystemHealth();
            const botNumber = socket.user?.id?.split(':')[0];
            
            const message = `╔══════════════════════════════════╗
║     ${CONFIG.bot.name} v${CONFIG.bot.version}      ║
╠══════════════════════════════════╣
║ Bot Number: ${botNumber || 'Unknown'}
║ Prefix: ${CONFIG.bot.prefix}
║ Owner: ${CONFIG.owner.name} (${CONFIG.owner.number})
║ Messages: ${stats.messages.received} recv | ${stats.messages.sent} sent
║ Memory: ${stats.memory.toFixed(2)} MB
╚══════════════════════════════════╝`;

            await socket.sendMessage(`${CONFIG.owner.number}@s.whatsapp.net`, { text: message });
        } catch (error) {
            this.logger.error(`Startup message failed: ${error.message}`);
        }
    }

    handleConnectionError(error) {
        this.reconnectAttempts++;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => this.initialize(), 5000 * this.reconnectAttempts);
        } else {
            this.logger.error('Max reconnection attempts reached. Manual restart required.');
        }
    }
}

// ============================================
// WEB SERVER
// ============================================
class WebServer {
    constructor(stateManager) {
        this.state = stateManager;
        this.app = express();
        this.port = CONFIG.system.port;
        this.setupRoutes();
    }

    setupRoutes() {
        // Static files
        this.app.use(express.static(path.join(__dirname, 'public')));

        // QR Code API
        this.app.get('/api/qr', (req, res) => {
            try {
                const qrFile = path.join(__dirname, 'public', 'qr.json');
                if (fs.existsSync(qrFile)) {
                    const data = JSON.parse(fs.readFileSync(qrFile, 'utf-8'));
                    res.json({
                        success: true,
                        qr: data.qr,
                        qrDataURL: data.qrDataURL,
                        status: this.state.connection.status
                    });
                } else {
                    res.json({
                        success: false,
                        status: this.state.connection.status,
                        message: 'No QR code available'
                    });
                }
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Status API
        this.app.get('/api/status', (req, res) => {
            const health = this.state.getSystemHealth();
            res.json({
                success: true,
                ...health,
                bot: {
                    name: CONFIG.bot.name,
                    version: CONFIG.bot.version,
                    prefix: CONFIG.bot.prefix
                },
                owner: CONFIG.owner
            });
        });

        // Logout API
        this.app.post('/api/logout', async (req, res) => {
            try {
                // Clear session
                const authFolder = CONFIG.system.authFolder;
                if (fs.existsSync(authFolder)) {
                    fs.rmSync(authFolder, { recursive: true, force: true });
                }
                const sessionManager = new SessionManager(CONFIG.system.sessionFile);
                await sessionManager.saveSession('');
                this.state.connection.status = 'disconnected';
                res.json({ success: true, message: 'Logged out successfully' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(chalk.green(`🌐 Web interface: http://localhost:${this.port}`));
            console.log(chalk.blue(`📱 QR API: http://localhost:${this.port}/api/qr`));
            console.log(chalk.blue(`📊 Status: http://localhost:${this.port}/api/status`));
        });
    }
}

// ============================================
// APPLICATION BOOTSTRAP
// ============================================
class Application {
    constructor() {
        this.state = new ApplicationState();
        this.sessionManager = new SessionManager(CONFIG.system.sessionFile);
        this.logger = new SystemUtilities.createLogger();
    }

    async start() {
        try {
            this.displayBanner();
            
            // Initialize components
            const connection = new WhatsAppConnection(this.state, this.sessionManager);
            const webServer = new WebServer(this.state);
            
            // Start services
            await connection.initialize();
            webServer.start();
            
            this.logger.success('Application started successfully');
            
        } catch (error) {
            this.logger.error(`Application startup failed: ${error.message}`);
            process.exit(1);
        }
    }

    displayBanner() {
        console.clear();
        console.log(chalk.cyan(`
╔═══════════════════════════════════════════╗
║                                           ║
║     MULAA SIGIL XMD v2.0.0              ║
║     ${CONFIG.bot.name}                   ║
║                                           ║
║  🌐 ${CONFIG.owner.name}               ║
║  📱 ${CONFIG.owner.number}              ║
║                                           ║
╚═══════════════════════════════════════════╝
        `));
        this.logger.info(`Bot initialized with prefix: ${CONFIG.bot.prefix}`);
        this.logger.info(`Session: ${fs.existsSync(CONFIG.system.sessionFile) ? '✅ Found' : '📝 New'}`);
    }
}

// ============================================
// ENTRY POINT
// ============================================
if (require.main === module) {
    const app = new Application();
    app.start().catch(error => {
        console.error(chalk.red(`Fatal error: ${error.message}`));
        process.exit(1);
    });
}

// ============================================
// PROCESS CLEANUP
// ============================================
process.on('uncaughtException', (error) => {
    console.error(chalk.red(`Uncaught Exception: ${error.message}`));
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error(chalk.red(`Unhandled Rejection: ${reason.message || reason}`));
});

module.exports = { CONFIG, Application, WhatsAppConnection, WebServer };

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const multer = require('multer');
// Load Env Vars
require('dotenv').config();

const { initDatabase, getDb } = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const { Telegraf } = require('telegraf');

// ... (previous imports)

// Telegram Bot Setup
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// Only start bot if token is provided to avoid crashing in dev
let bot;
if (TELEGRAM_TOKEN) {
    bot = new Telegraf(TELEGRAM_TOKEN);

    bot.start(async (ctx) => {
        const db = getDb();
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const phone = ctx.from.username || ctx.from.first_name; // Use username as identifier

        // Save to DB (expires in 10 mins)
        const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();

        await db.run(
            `INSERT INTO verification_codes (platform, code, phone, expires_at) VALUES (?, ?, ?, ?)`,
            ['telegram', code, phone, expiresAt]
        );

        ctx.reply(`Welcome to Slot RTP Data Centre! 🎰\n\nYour Verification Code is: *${code}*\n\nPlease enter this code on the website to complete your registration.`, { parse_mode: 'Markdown' });
    });

    bot.launch().then(() => console.log('Telegram Bot started'));

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
} else {
    console.log('Telegram Token not set. Bot skipped.');
}

// WhatsApp Bot Setup
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Initialize WhatsApp Client with LocalAuth (Saves session)
const waClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
});

waClient.on('qr', (qr) => {
    console.log('WhatsApp QR Code received. Scan it to login:');
    qrcode.generate(qr, { small: true });
});

waClient.on('ready', () => {
    console.log('WhatsApp Bot is ready!');
});

waClient.on('message', async msg => {
    const body = msg.body.toLowerCase();

    if (body.includes('register') || body.includes('daftar')) {
        const chat = await msg.getChat();

        // Anti-Ban Logic: Simulate reading & typing delay
        chat.sendStateTyping();
        const delay = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000); // 5-10 seconds

        setTimeout(async () => {
            const db = getDb();
            // Generate Code
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const phone = msg.from.split('@')[0]; // Extract phone number

            // Save to Code DB
            const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();
            await db.run(
                `INSERT INTO verification_codes (platform, code, phone, expires_at) VALUES (?, ?, ?, ?)`,
                ['whatsapp', code, phone, expiresAt]
            );

            // Auto-Save Contact (Simulation - effectively we just responded to them)

            msg.reply(`Salam Boss! 👋\n\nTerima kasih kerana berminat dengan *Slot RTP Data Centre*.\n\nKod Daftar sah anda ialah: *${code}*\n\nSila masukkan kod ini di website segera. Kod tamat dalam 10 minit.`);
            chat.clearState();
        }, delay);
    }
});

waClient.initialize();

// Initialize Database
initDatabase().catch(err => console.error('Failed to init DB:', err));

// --- Auth Endpoints ---

// Register User (Username + Password + Optional Code)
app.post('/api/register', async (req, res) => {
    const { username, password, code } = req.body;
    const db = getDb();

    try {
        // 1. Verify Code if provided (Logic to come later with Bots)
        // For now, allow direct registration or check a static code

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create User
        const result = await db.run(
            `INSERT INTO users (username, password_hash) VALUES (?, ?)`,
            [username, hashedPassword]
        );

        res.status(201).json({ message: 'User created successfully', userId: result.lastID });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const db = getDb();

    try {
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Paths
const PUBLIC_DIR = path.join(__dirname, 'public');
const PROVIDERS_DIR = path.join(PUBLIC_DIR, 'providers');

// Ensure directories exist
fs.ensureDirSync(PROVIDERS_DIR);

// Multer Storage Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, PROVIDERS_DIR); // Base path, refined later
    },
    filename: function (req, file, cb) {
        cb(null, 'temp-' + Date.now() + '-' + file.originalname);
    }
});

// Memory storage for control
const upload = multer({ storage: multer.memoryStorage() });

// --- CMS API ENDPOINTS ---

// 1. Get All Providers
app.get('/api/providers', async (req, res) => {
    try {
        const items = await fs.readdir(PROVIDERS_DIR);
        // Filter only directories
        const providers = [];
        for (const item of items) {
            const stats = await fs.stat(path.join(PROVIDERS_DIR, item));
            if (stats.isDirectory()) {
                // Check if logo exists
                const logoPath = path.join(PROVIDERS_DIR, item, 'logo.png');
                const hasLogo = await fs.pathExists(logoPath);
                providers.push({ name: item, hasLogo });
            }
        }
        res.json(providers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Create Provider
app.post('/api/providers', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name required' });

        const dirPath = path.join(PROVIDERS_DIR, name);
        if (await fs.pathExists(dirPath)) {
            return res.status(400).json({ error: 'Provider already exists' });
        }

        await fs.ensureDir(dirPath);
        // Create empty games.txt
        await fs.writeFile(path.join(dirPath, 'games.txt'), '');

        res.json({ success: true, message: `Provider ${name} created` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Delete Provider
app.delete('/api/providers/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const dirPath = path.join(PROVIDERS_DIR, name);

        if (!await fs.pathExists(dirPath)) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        await fs.remove(dirPath);
        res.json({ success: true, message: `Provider ${name} deleted` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get Games List
app.get('/api/games/:provider', async (req, res) => {
    try {
        const { provider } = req.params;
        const filePath = path.join(PROVIDERS_DIR, provider, 'games.txt');

        if (!await fs.pathExists(filePath)) {
            // If folder exists but file doesn't, return empty
            const dirPath = path.join(PROVIDERS_DIR, provider);
            if (await fs.pathExists(dirPath)) {
                return res.json({ content: '' });
            }
            return res.status(404).json({ error: 'Provider not found' });
        }

        const content = await fs.readFile(filePath, 'utf-8');
        res.json({ content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Save Games List
app.post('/api/games/:provider', async (req, res) => {
    try {
        const { provider } = req.params;
        const { content } = req.body;

        const dirPath = path.join(PROVIDERS_DIR, provider);
        if (!await fs.pathExists(dirPath)) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        await fs.writeFile(path.join(dirPath, 'games.txt'), content, 'utf-8');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Upload Image (Provider Logo or Game Image)
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const { provider, type, gameName } = req.body; // type: 'logo' or 'game'

        if (!provider) return res.status(400).json({ error: 'Provider required' });

        const dirPath = path.join(PROVIDERS_DIR, provider);
        if (!await fs.pathExists(dirPath)) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        let filename = '';
        if (type === 'logo') {
            filename = 'logo.png'; // Enforce png for simplicity or use original ext
        } else if (type === 'game') {
            if (!gameName) return res.status(400).json({ error: 'Game name required' });
            filename = `${gameName}.png`; // Enforce png
        } else {
            return res.status(400).json({ error: 'Invalid upload type' });
        }

        const filePath = path.join(dirPath, filename);
        await fs.writeFile(filePath, req.file.buffer);

        res.json({ success: true, path: `/providers/${provider}/${filename}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve Static files (Frontend Build)
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR));
}

// Serve uploaded files (Providers)
app.use('/providers', express.static(PROVIDERS_DIR));

app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }

    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        // Fallback for dev mode without build
        res.send('API Server Running. Frontend build not found. Run npm run build.');
    }
});

// --- SOCKET.IO SETUP ---
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in this hybrid app
        methods: ["GET", "POST"]
    }
});

// Socket Auth Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.user = decoded;
        next();
    });
});

io.on('connection', async (socket) => {
    console.log(`User Connected: ${socket.user.username}`);

    // Send Online Count
    io.emit('online_count', io.engine.clientsCount);

    // Send Chat History (Last 50 messages)
    const db = getDb();
    const history = await db.all('SELECT * FROM messages ORDER BY created_at ASC LIMIT 50');
    socket.emit('chat_history', history);

    socket.on('message', async (content) => {
        if (!content.trim()) return;

        // Save to DB
        const result = await db.run(
            `INSERT INTO messages (user_id, username, content, type) VALUES (?, ?, ?, ?)`,
            [socket.user.id, socket.user.username, content, 'text']
        );

        // Broadcast to all
        const msg = {
            id: result.lastID,
            userId: socket.user.id,
            username: socket.user.username,
            content,
            type: 'text',
            created_at: new Date().toISOString()
        };
        io.emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.user.username}`);
        io.emit('online_count', io.engine.clientsCount);
    });
});

// Change app.listen to server.listen to support socket.io
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server (HTTP + Socket) running on http://0.0.0.0:${PORT}`);
});

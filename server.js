
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Paths
const PUBLIC_DIR = path.join(__dirname, 'public');
const PROVIDERS_DIR = path.join(PUBLIC_DIR, 'providers');

// Ensure directories exist
fs.ensureDirSync(PROVIDERS_DIR);

// Multer Storage Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { provider, type } = req.body;
        // req.body might not be populated yet if fields come after file in FormData
        // But multer processes fields if put before files. 
        // We'll rely on a dynamic path construction or save to temp and move.
        // For simplicity, let's assume valid provider is passed in URL query or we handle logic in filename.

        // Better approach: We will control destination inside the route handler using memory storage or custom logic
        // But for simple file serving, let's use a standard path strategy.

        // Actually, simpler: Let's accept 'provider' as a query param or part of url for destination
        // But multer middleware runs before route handler.
        // Let's use specific routes for specific uploads.
        cb(null, PROVIDERS_DIR); // This is just a base, we will move it later or refine
    },
    filename: function (req, file, cb) {
        cb(null, 'temp-' + Date.now() + '-' + file.originalname);
    }
});

// We will use memory storage to have full control over where to write files
const upload = multer({ storage: multer.memoryStorage() });

// --- API ENDPOINTS ---

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
// In production, we expect a 'dist' folder to exist at the root
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR));
}

// Serve uploaded files (Providers)
// Make sure this is accessible
app.use('/providers', express.static(PROVIDERS_DIR));

// API Routes above...

// ANY other route -> Serve React Index.html (SPA Fallback)
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

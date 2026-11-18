import 'dotenv/config';
import crypto from 'crypto';
import express, {type NextFunction, type Request, type Response} from 'express';
import fs from 'fs';
import http from 'http';
import multer from 'multer';
import path from 'path';
import {createServer as createViteServer} from 'vite';

interface EventPhoto {
  id: string;
  url: string;
  title: string;
  category: 'Ceremony' | 'Portraits' | 'Candid' | 'Aerial';
  uploadedAt: string;
}

interface StudioEvent {
  code: string;
  title: string;
  clientName: string;
  eventDate: string;
  location: string;
  coverUrl: string;
  createdAt: string;
  photos: EventPhoto[];
}

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dasta2026';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dasta-studio-signing-key-2026';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

fs.mkdirSync(DATA_DIR, {recursive: true});
fs.mkdirSync(UPLOADS_DIR, {recursive: true});

const SEED_EVENTS: StudioEvent[] = [
  {
    code: '240812',
    title: 'Aarav & Meera — Royal Udaipur Wedding',
    clientName: 'Aarav & Meera Singhania',
    eventDate: '2026-10-24',
    location: 'City Palace Courtyard, Udaipur',
    coverUrl: '/src/assets/images/studio_hero_wedding_1795002900870.jpg',
    createdAt: '2026-10-25T10:30:00.000Z',
    photos: [
      {
        id: 'ph-240812-1',
        url: '/src/assets/images/studio_hero_wedding_1795002900870.jpg',
        title: 'Golden Hour Archway Walk',
        category: 'Portraits',
        uploadedAt: '2026-10-25T10:35:00.000Z',
      },
      {
        id: 'ph-240812-2',
        url: '/src/assets/images/gallery_ceremony_mandap_1795002902357.jpg',
        title: 'Marigold Mandap Laughter',
        category: 'Ceremony',
        uploadedAt: '2026-10-25T10:36:00.000Z',
      },
      {
        id: 'ph-240812-3',
        url: '/src/assets/images/gallery_bridal_portrait_1795002901989.jpg',
        title: 'Meera Bridal Window Portrait',
        category: 'Portraits',
        uploadedAt: '2026-10-25T10:37:00.000Z',
      },
      {
        id: 'ph-240812-4',
        url: '/src/assets/images/offer_drone_cinema_1795002900132.jpg',
        title: 'Palace Twilight Aerial',
        category: 'Aerial',
        uploadedAt: '2026-10-25T10:38:00.000Z',
      },
    ],
  },
  {
    code: '518904',
    title: 'Kabir & Ananya — Lakeview Pre-Wedding',
    clientName: 'Kabir & Ananya Kapoor',
    eventDate: '2026-11-08',
    location: 'Lake Pichola Heritage Pier',
    coverUrl: '/src/assets/images/offer_prewedding_editorial_1795002900888.jpg',
    createdAt: '2026-11-09T09:15:00.000Z',
    photos: [
      {
        id: 'ph-518904-1',
        url: '/src/assets/images/offer_prewedding_editorial_1795002900888.jpg',
        title: 'Dawn Reflection Editorial',
        category: 'Portraits',
        uploadedAt: '2026-11-09T09:20:00.000Z',
      },
      {
        id: 'ph-518904-2',
        url: '/src/assets/images/studio_hero_wedding_1795002900870.jpg',
        title: 'Sandstone Colonnade Stroll',
        category: 'Candid',
        uploadedAt: '2026-11-09T09:22:00.000Z',
      },
      {
        id: 'ph-518904-3',
        url: '/src/assets/images/gallery_bridal_portrait_1795002901989.jpg',
        title: 'Studio Heritage Look',
        category: 'Portraits',
        uploadedAt: '2026-11-09T09:25:00.000Z',
      },
    ],
  },
];

function readEvents(): StudioEvent[] {
  if (!fs.existsSync(EVENTS_FILE)) {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(SEED_EVENTS, null, 2), 'utf8');
    return SEED_EVENTS;
  }
  try {
    const raw = fs.readFileSync(EVENTS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_EVENTS;
  } catch {
    return SEED_EVENTS;
  }
}

function writeEvents(events: StudioEvent[]): void {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
}

function createAdminToken(): string {
  const payload = Buffer.from(
    JSON.stringify({role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 24})
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (sig !== expected) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.role === 'admin' && typeof data.exp === 'number' && data.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!verifyAdminToken(token)) {
    res.status(401).json({error: 'Admin authentication required.'});
    return;
  }
  next();
}

function generateUniqueCode(existing: StudioEvent[]): string {
  const used = new Set(existing.map((e) => e.code));
  for (let i = 0; i < 100; i++) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    if (!used.has(code)) return code;
  }
  return String(Date.now()).slice(-6);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '.jpg').toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    const id = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${safeExt}`;
    cb(null, id);
  },
});

const upload = multer({
  storage,
  limits: {fileSize: 15 * 1024 * 1024, files: 20},
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

async function startServer() {
  // Ensure seed file exists on boot
  readEvents();

  const app = express();
  app.use(express.json({limit: '10mb'}));

  app.get('/api/health', (_req, res) => {
    res.json({status: 'ok', studio: 'Dasta Digital Photo Studio'});
  });

  // Public Guest Event Lookup by 6-digit code
  app.get('/api/events/:code', (req, res) => {
    const code = String(req.params.code || '').trim();
    if (!/^\d{6}$/.test(code)) {
      res.status(400).json({error: 'Please enter a valid 6-digit Event Code.'});
      return;
    }
    const events = readEvents();
    const found = events.find((e) => e.code === code);
    if (!found) {
      res.status(404).json({error: `No gallery found for Event Code ${code}.`});
      return;
    }
    res.json({event: found});
  });

  // Serve uploaded event photos safely
  app.get('/api/uploads/:filename', (req, res) => {
    const safeName = path.basename(String(req.params.filename || ''));
    const filePath = path.join(UPLOADS_DIR, safeName);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({error: 'Photo not found.'});
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=2592000');
    res.sendFile(filePath);
  });

  // Admin Authentication
  app.post('/api/admin/login', (req, res) => {
    const password = String(req.body?.password || '');
    if (!password || password !== ADMIN_PASSWORD) {
      res.status(401).json({error: 'Incorrect studio admin password.'});
      return;
    }
    res.json({token: createAdminToken()});
  });

  app.get('/api/admin/events', requireAdmin, (_req, res) => {
    const events = readEvents().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({events});
  });

  app.post('/api/admin/events', requireAdmin, (req, res) => {
    const title = String(req.body?.title || '').trim();
    const clientName = String(req.body?.clientName || '').trim();
    const eventDate = String(req.body?.eventDate || '').trim();
    const location = String(req.body?.location || '').trim();
    const requestedCode = String(req.body?.code || '').trim();

    if (!title || !clientName) {
      res.status(400).json({error: 'Event title and client name are required.'});
      return;
    }

    const events = readEvents();
    let code = requestedCode;
    if (code) {
      if (!/^\d{6}$/.test(code)) {
        res.status(400).json({error: 'Custom event code must be exactly 6 digits.'});
        return;
      }
      if (events.some((e) => e.code === code)) {
        res.status(409).json({error: `Event Code ${code} is already in use.`});
        return;
      }
    } else {
      code = generateUniqueCode(events);
    }

    const newEvent: StudioEvent = {
      code,
      title,
      clientName,
      eventDate: eventDate || new Date().toISOString().slice(0, 10),
      location: location || 'Dasta Studio Location',
      coverUrl: '/src/assets/images/gallery_ceremony_mandap_1795002902357.jpg',
      createdAt: new Date().toISOString(),
      photos: [],
    };

    events.unshift(newEvent);
    writeEvents(events);
    res.status(201).json({event: newEvent});
  });

  app.post(
    '/api/admin/events/:code/photos',
    requireAdmin,
    upload.array('photos', 20),
    (req, res) => {
      const code = String(req.params.code || '').trim();
      const categoryRaw = String(req.body?.category || 'Ceremony');
      const allowedCategories = ['Ceremony', 'Portraits', 'Candid', 'Aerial'] as const;
      const category = allowedCategories.includes(categoryRaw as (typeof allowedCategories)[number])
        ? (categoryRaw as EventPhoto['category'])
        : 'Ceremony';

      const files = (req.files as Express.Multer.File[]) || [];
      if (files.length === 0) {
        res.status(400).json({error: 'Please select at least one photo to upload.'});
        return;
      }

      const events = readEvents();
      const index = events.findIndex((e) => e.code === code);
      if (index === -1) {
        res.status(404).json({error: 'Event not found.'});
        return;
      }

      const added: EventPhoto[] = files.map((file, i) => ({
        id: `ph-${Date.now()}-${i}-${crypto.randomBytes(3).toString('hex')}`,
        url: `/api/uploads/${file.filename}`,
        title:
          path.basename(file.originalname, path.extname(file.originalname)).slice(0, 48) ||
          `Studio Frame ${i + 1}`,
        category,
        uploadedAt: new Date().toISOString(),
      }));

      if (events[index].photos.length === 0 && added[0]) {
        events[index].coverUrl = added[0].url;
      }
      events[index].photos = [...added, ...events[index].photos];
      writeEvents(events);
      res.status(201).json({event: events[index], addedCount: added.length});
    }
  );

  app.delete('/api/admin/events/:code/photos/:photoId', requireAdmin, (req, res) => {
    const code = String(req.params.code || '').trim();
    const photoId = String(req.params.photoId || '').trim();
    const events = readEvents();
    const index = events.findIndex((e) => e.code === code);
    if (index === -1) {
      res.status(404).json({error: 'Event not found.'});
      return;
    }

    const target = events[index].photos.find((p) => p.id === photoId);
    events[index].photos = events[index].photos.filter((p) => p.id !== photoId);

    if (target && target.url.startsWith('/api/uploads/')) {
      const filename = path.basename(target.url);
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (events[index].photos.length > 0 && events[index].coverUrl === target?.url) {
      events[index].coverUrl = events[index].photos[0].url;
    }

    writeEvents(events);
    res.json({event: events[index]});
  });

  app.delete('/api/admin/events/:code', requireAdmin, (req, res) => {
    const code = String(req.params.code || '').trim();
    const events = readEvents();
    const target = events.find((e) => e.code === code);
    if (!target) {
      res.status(404).json({error: 'Event not found.'});
      return;
    }

    for (const photo of target.photos) {
      if (photo.url.startsWith('/api/uploads/')) {
        const filePath = path.join(UPLOADS_DIR, path.basename(photo.url));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    const remaining = events.filter((e) => e.code !== code);
    writeEvents(remaining);
    res.json({deleted: code});
  });

  const httpServer = http.createServer(app);

  if (!IS_PROD) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {server: httpServer},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Dasta Digital Photo Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

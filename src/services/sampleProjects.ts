export interface SampleProject {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  badge: string;
  files: { path: string; size: number; content: string }[];
}

export const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: 'fullstack-ecommerce',
    name: 'Modern Fullstack E-Commerce',
    description: 'React, Tailwind, Express.js backend, MongoDB models, JWT authentication, and Stripe payments.',
    category: 'Fullstack Web App',
    icon: 'ShoppingBag',
    badge: 'React + Node + Mongo',
    files: [
      {
        path: 'package.json',
        size: 1120,
        content: JSON.stringify({
          name: 'nebula-store',
          version: '1.2.0',
          private: true,
          dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            'react-router-dom': '^6.22.3',
            axios: '^1.6.8',
            express: '^4.19.2',
            mongoose: '^8.3.0',
            jsonwebtoken: '^9.0.2',
            bcryptjs: '^2.4.3',
            tailwindcss: '^3.4.1',
            'lucide-react': '^0.359.0',
            zustand: '^4.5.2',
            cors: '^2.8.5'
          },
          devDependencies: {
            vite: '^5.2.0',
            typescript: '^5.4.2',
            vitest: '^1.4.0'
          }
        }, null, 2)
      },
      {
        path: '.env',
        size: 240,
        content: `DATABASE_URL=mongodb+srv://admin_user:REDACTED_PASSWORD@cluster0.mongodb.net/production?retryWrites=true\nJWT_SECRET=REDACTED_JWT_SECRET\nSTRIPE_SECRET_KEY=STRIPE_SECRET_KEY_PLACEHOLDER\nPORT=5000`
      },
      {
        path: 'credentials.json',
        size: 180,
        content: `{\n  "client_id": "GOOGLE_CLIENT_ID_PLACEHOLDER.apps.googleusercontent.com",\n  "client_secret": "GOOGLE_CLIENT_SECRET_PLACEHOLDER"\n}`
      },
      {
        path: 'src/App.tsx',
        size: 1450,
        content: `import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProductList } from './components/ProductList';
import { useCartStore } from './store/cartStore';
import { fetchProducts } from './services/api';

export function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const cartItems = useCartStore((state) => state.items);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header cartCount={cartItems.length} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Featured Products</h1>
        {loading ? (
          <p>Loading items...</p>
        ) : (
          <ProductList items={products} />
        )}
      </main>
    </div>
  );
}
export default App;`
      },
      {
        path: 'src/components/Header.tsx',
        size: 1100,
        content: `import React from 'react';
import { ShoppingCart, User } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({ cartCount }) => {
  const handleNavClick = (route: string) => {
    window.location.href = route;
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold text-indigo-400 cursor-pointer" onClick={() => handleNavClick('/')}>
        NebulaStore
      </div>
      <div className="flex items-center space-x-6">
        <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg" onClick={() => handleNavClick('/cart')}>
          <ShoppingCart className="w-5 h-5" />
          <span>Cart ({cartCount})</span>
        </button>
        <button className="p-2 rounded-full bg-slate-700 hover:bg-slate-600" onClick={() => handleNavClick('/profile')}>
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};`
      },
      {
        path: 'src/components/ProductList.tsx',
        size: 1350,
        content: `import React from 'react';
import { useCartStore } from '../store/cartStore';

export function ProductList({ items }: { items: any[] }) {
  const addToCart = useCartStore((state) => state.addItem);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.id} className="product-card bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-indigo-500 transition">
          <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-4" />
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-slate-400 text-sm mb-4">{item.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-emerald-400">\${item.price}</span>
            <button
              onClick={() => addToCart(item)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm"
            >
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}`
      },
      {
        path: 'src/services/api.ts',
        size: 1200,
        content: `import axios from 'axios';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_token'
  }
});

export async function fetchProducts() {
  const res = await apiClient.get('/products');
  return res.data;
}

export async function loginUser(credentials: { email: string; pass: string }) {
  const res = await apiClient.post('/auth/login', credentials);
  return res.data;
}

export async function createCheckoutSession(cartItems: any[]) {
  const res = await apiClient.post('https://api.stripe.com/v1/checkout/sessions', {
    items: cartItems
  });
  return res.data;
}`
      },
      {
        path: 'src/store/cartStore.ts',
        size: 800,
        content: `import { create } from 'zustand';

interface CartState {
  items: any[];
  addItem: (item: any) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
  clearCart: () => set({ items: [] })
}));`
      },
      {
        path: 'server/server.js',
        size: 1400,
        content: `const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(express.json());

// Insecure CORS pattern
app.use(cors({ origin: '*', credentials: true }));

mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/store');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});`
      },
      {
        path: 'server/routes/authRoutes.js',
        size: 950,
        content: `const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);

module.exports = router;`
      },
      {
        path: 'server/controllers/authController.js',
        size: 1600,
        content: `const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });
    res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};`
      },
      {
        path: 'server/models/User.js',
        size: 750,
        content: `const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);`
      }
    ]
  },
  {
    id: 'youtube-enhancer-extension',
    name: 'YouTube Enhancer Pro (Chrome Extension MV3)',
    description: 'Manifest V3 Browser Extension with content scripts, MutationObservers, heavy DOM queries, and background worker messaging.',
    category: 'Browser Extension',
    icon: 'Puzzle',
    badge: 'Manifest V3 + DOM Engine',
    files: [
      {
        path: 'manifest.json',
        size: 850,
        content: JSON.stringify({
          manifest_version: 3,
          name: 'YouTube Enhancer Pro',
          version: '2.1.0',
          description: 'Customizes YouTube layout, removes clutter, and enhances video playback.',
          permissions: ['storage', 'tabs', 'scripting', 'activeTab'],
          host_permissions: ['https://*.youtube.com/*', '<all_urls>'],
          background: {
            service_worker: 'src/background.js'
          },
          content_scripts: [
            {
              matches: ['*://*.youtube.com/*'],
              js: ['src/content.js'],
              run_at: 'document_idle'
            }
          ],
          action: {
            default_popup: 'src/popup.html',
            default_icon: 'assets/icon.png'
          }
        }, null, 2)
      },
      {
        path: 'src/content.js',
        size: 2600,
        content: `// YouTube Enhancer Content Script
let observer = null;
let settings = { hideComments: false, autoHd: true, hideRecommendations: true };

function initialize() {
  console.log('YouTube Enhancer initializing...');
  chrome.storage.local.get(['enhancerSettings'], (res) => {
    if (res.enhancerSettings) {
      settings = res.enhancerSettings;
    }
    applyEnhancements();
    observePageMutations();
  });

  window.addEventListener('scroll', () => {
    detectVideos();
  });
}

function applyEnhancements() {
  const videoCards = document.querySelectorAll('ytd-video-renderer');
  videoCards.forEach((card) => {
    card.classList.add('enhanced-card');
  });

  const sidebar = document.querySelector('#secondary.ytd-watch-flexy');
  if (sidebar && settings.hideRecommendations) {
    sidebar.classList.add('hidden-recommendations');
  }

  const commentsSection = document.getElementById('comments');
  if (commentsSection && settings.hideComments) {
    commentsSection.remove();
  }
}

function detectVideos() {
  // DOM query executed repeatedly
  const videos = document.querySelectorAll('.video-card, ytd-rich-item-renderer');
  videos.forEach(v => {
    const titleEl = v.querySelector('#video-title');
    if (titleEl) {
      titleEl.classList.add('high-contrast-text');
    }
  });
}

function observePageMutations() {
  const targetNode = document.body;
  const config = { childList: true, subtree: true };

  observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        applyEnhancements();
      }
    }
  });

  observer.observe(targetNode, config);
}

// Listen for message from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'UPDATE_SETTINGS') {
    settings = request.payload;
    applyEnhancements();
    sendResponse({ status: 'applied' });
  }
});

initialize();`
      },
      {
        path: 'src/background.js',
        size: 980,
        content: `// Background Service Worker MV3
chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube Enhancer installed');
  chrome.storage.local.set({
    enhancerSettings: { hideComments: false, autoHd: true, hideRecommendations: true }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_USER_SETTINGS') {
    chrome.storage.local.get(['enhancerSettings'], (result) => {
      sendResponse(result.enhancerSettings);
    });
    return true; // Async response
  }
});`
      },
      {
        path: 'src/popup.html',
        size: 920,
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>YouTube Enhancer Settings</title>
  <style>
    body { width: 280px; font-family: sans-serif; background: #1e293b; color: #fff; padding: 15px; }
    .toggle { display: flex; justify-content: space-between; margin-bottom: 12px; }
  </style>
</head>
<body>
  <h3>Enhancer Settings</h3>
  <div class="toggle">
    <label>Hide Recommendations</label>
    <input type="checkbox" id="toggleRecs" checked>
  </div>
  <div class="toggle">
    <label>Hide Comments</label>
    <input type="checkbox" id="toggleComments">
  </div>
  <button id="saveBtn" style="width: 100%; padding: 8px; background: #6366f1; border: none; color: #fff; border-radius: 6px;">Save Changes</button>
  <script src="popup.js"></script>
</body>
</html>`
      },
      {
        path: 'src/popup.js',
        size: 890,
        content: `document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveBtn');
  const toggleRecs = document.getElementById('toggleRecs');
  const toggleComments = document.getElementById('toggleComments');

  saveBtn.addEventListener('click', () => {
    const payload = {
      hideRecommendations: toggleRecs.checked,
      hideComments: toggleComments.checked
    };

    chrome.storage.local.set({ enhancerSettings: payload }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'UPDATE_SETTINGS', payload });
        }
      });
    });
  });
});`
      }
    ]
  },
  {
    id: 'fastapi-python-dashboard',
    name: 'FastAPI + SQLAlchemy AI Analytics Hub',
    description: 'Python backend with FastAPI endpoints, SQLAlchemy ORM, Pydantic validation schemas, and React analytics frontend.',
    category: 'Python Backend & Data App',
    icon: 'Terminal',
    badge: 'Python + FastAPI + SQL',
    files: [
      {
        path: 'requirements.txt',
        size: 420,
        content: `fastapi==0.110.0\nuvicorn==0.28.0\nsqlalchemy==2.0.28\npsycopg2-binary==2.9.9\npydantic==2.6.4\npython-jose[cryptography]==3.3.0\npasslib[bcrypt]==1.7.4\nrequests==2.31.0`
      },
      {
        path: '.env',
        size: 200,
        content: `DATABASE_URL=postgresql://db_admin:REDACTED_PASSWORD@postgres.internal.cluster:5432/analytics_db\nSECRET_KEY=REDACTED_SECRET_KEY\nOPENAI_API_KEY=OPENAI_API_KEY_PLACEHOLDER`
      },
      {
        path: 'app/main.py',
        size: 1750,
        content: `from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import get_db
from .models import User, AnalyticsEvent
from .schemas import EventCreate, EventResponse, UserLogin

app = FastAPI(title="AI Analytics Hub", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://app.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "analytics-core"}

@app.post("/api/events", response_model=EventResponse)
def record_event(event_in: EventCreate, db: Session = Depends(get_db)):
    db_event = AnalyticsEvent(
        event_name=event_in.event_name,
        user_id=event_in.user_id,
        metadata_json=event_in.metadata
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/api/reports/summary")
def get_summary_report(db: Session = Depends(get_db)):
    total_events = db.query(AnalyticsEvent).count()
    users_count = db.query(User).count()
    return {
        "total_events": total_events,
        "active_users": users_count,
        "processing_engine": "VectorPipeline v2"
    }`
      },
      {
        path: 'app/models.py',
        size: 980,
        content: `from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(100), index=True)
    user_id = Column(Integer, index=True)
    metadata_json = Column(JSON)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())`
      }
    ]
  }
];

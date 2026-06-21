import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Bell,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock3,
  ClosedCaption,
  Film,
  Flame,
  Gauge,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Pencil,
  PauseCircle,
  Play,
  PlayCircle,
  Pause,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  UserCircle,
  Users,
  X,
  Zap,
  Maximize,
  Minimize,
  Volume,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Subtitles,
  Layers
} from 'lucide-react';
import './styles.css';

import HakariPlayer from './HakariPlayer';

const heroArt = '/assets/hakari-hero.png';
const brandLogo = '/assets/hakari-logo-uploaded.png';

const sampleSources = {
  sub: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
  dub: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  hindi: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
};

const HoverPanelContext = React.createContext(null);
const heroImageCache = new Map();
const profileTabs = [
  ['profile', 'Profile'],
  ['continue-watching', 'Continue Watching'],
  ['watchlist', 'Watchlist'],
  ['notification', 'Notification'],
  ['settings', 'Settings']
];
const profileTabIds = profileTabs.map(([id]) => id);
const defaultProfileTab = 'profile';

const genres = [
  'Action',
  'Adventure',
  'Cars',
  'Comedy',
  'Dementia',
  'Demons',
  'Drama',
  'Ecchi',
  'Fantasy',
  'Game',
  'Harem',
  'Historical',
  'Horror',
  'Isekai',
  'Josei',
  'Kids',
  'Magic',
  'Mahou Shoujo',
  'Martial Arts',
  'Mecha',
  'Military',
  'Music',
  'Mystery',
  'Parody',
  'Police',
  'Psychological',
  'Romance',
  'Samurai',
  'School',
  'Sci-Fi',
  'Seinen',
  'Shoujo',
  'Shoujo Ai',
  'Shounen',
  'Shounen Ai',
  'Slice of Life',
  'Space',
  'Sports',
  'Super Power',
  'Supernatural',
  'Thriller',
  'Unknown',
  'Vampire'
];

const watchlistCategories = ['Watching', 'On-Hold', 'Planned', 'Watched', 'Dropped'];

const animeTypes = ['Movie', 'Music', 'ONA', 'OVA', 'Special', 'TV'];
const sidebarCategories = ['Home', 'Genre', 'Types', 'Updated', 'Added', 'Popular', 'Ongoing', 'Completed'];

const defaultSiteSettings = {
  landing: {
    topSearchLimit: 12,
    headline: 'Hakari',
    backgroundImage: heroArt
  },
  sidebar: Object.fromEntries(sidebarCategories.map((category) => [category, true])),
  homepageSections: {
    featured: true,
    trending: true,
    topAiring: true,
    latestEpisodes: true,
    mostPopular: true,
    recentlyAdded: true
  },
  genres: Object.fromEntries(genres.map((genre) => [genre, true])),
  types: Object.fromEntries(animeTypes.map((type) => [type, true]))
};

const defaultSearchAnalytics = {
  'one-piece': 240,
  'solo-leveling': 218,
  naruto: 186,
  bleach: 162,
  'jujutsu-kaisen': 151,
  'black-clover': 116,
  'wind-breaker': 96
};

const defaultUserPreferences = {
  showContinueWatchingOnHome: true,
  animeNameLanguage: 'English',
  autoSelectLanguage: 'Sub & Dub',
  autoPlay: false,
  autoNextEpisode: false,
  autoLoadComments: false,
  skipSeconds: 5,
  autoSkipIntroOutro: false
};

const defaultNotifications = [
  {
    id: 'notif-1',
    animeId: 'solo-leveling',
    type: 'New Episode',
    title: 'Episode 7 is live now',
    message: 'Solo Leveling just dropped a new episode for your watchlist.',
    unread: true,
    time: '2h ago'
  },
  {
    id: 'notif-2',
    animeId: 'one-piece',
    type: 'New Dub',
    title: 'Fresh dubbed episode available',
    message: 'One Piece has a new dubbed release ready to stream.',
    unread: true,
    time: '5h ago'
  },
  {
    id: 'notif-3',
    animeId: 'jujutsu-kaisen',
    type: 'Special Update',
    title: 'Special production update posted',
    message: 'A new special update was added for Jujutsu Kaisen.',
    unread: false,
    time: '1d ago'
  }
];

const avatarPresets = [
  { background: '#160d27', accent: '#7c4dff', hair: '#f86aa5', skin: '#f7d3c4', eyes: '#5ec1ff' },
  { background: '#0f1222', accent: '#54a8ff', hair: '#6e8bff', skin: '#f8d9c9', eyes: '#9ef0ff' },
  { background: '#1a1024', accent: '#ff7aa2', hair: '#ffcf5b', skin: '#f4ceb9', eyes: '#f884ff' },
  { background: '#120d20', accent: '#7f6bff', hair: '#8bd0ff', skin: '#f6d6c7', eyes: '#6effd8' },
  { background: '#171022', accent: '#ffa95b', hair: '#ff7d7d', skin: '#f4cfbf', eyes: '#ffe56b' },
  { background: '#0c1120', accent: '#58d0ff', hair: '#ffffff', skin: '#f7d8cb', eyes: '#7c4dff' },
  { background: '#150b1f', accent: '#ff6ac1', hair: '#7c4dff', skin: '#f2c6b1', eyes: '#8df8ff' },
  { background: '#0f1623', accent: '#8cf28f', hair: '#4ecdc4', skin: '#f5d8c8', eyes: '#fff1a0' },
  { background: '#130d26', accent: '#c991ff', hair: '#1f243b', skin: '#efc2a7', eyes: '#7fe2ff' },
  { background: '#120f20', accent: '#ff8d5b', hair: '#f4f4f4', skin: '#f1cfbf', eyes: '#ff6ac1' },
  { background: '#121226', accent: '#7c9dff', hair: '#b968ff', skin: '#f8d6c5', eyes: '#73ffdd' },
  { background: '#1a0d1b', accent: '#ff4f8c', hair: '#ff996e', skin: '#f4c5b0', eyes: '#8ec5ff' },
  { background: '#0b1320', accent: '#5ff2d6', hair: '#5d74ff', skin: '#f6d9cb', eyes: '#b8ff5f' },
  { background: '#170d22', accent: '#ffca5f', hair: '#ff6aa8', skin: '#efd0bf', eyes: '#9ec8ff' },
  { background: '#13111f', accent: '#7a7cff', hair: '#8dffe3', skin: '#f7dacd', eyes: '#ff7ab8' },
  { background: '#0e1226', accent: '#4fd7ff', hair: '#f3d06d', skin: '#f1c8b4', eyes: '#86a6ff' },
  { background: '#180c22', accent: '#ff77d9', hair: '#ff9e7a', skin: '#f5d6c8', eyes: '#7cfbff' },
  { background: '#101626', accent: '#8bff9e', hair: '#6b5cff', skin: '#f4cfbc', eyes: '#ffe37f' }
];

const topSearchAnime = [
  {
    id: 'one-piece',
    title: 'One Piece',
    english: 'One Piece',
    japanese: 'Wan Pisu',
    description: 'A legendary pirate adventure across strange seas, powerful crews, and impossible treasure.',
    longDescription: 'A long-running adventure about freedom, friendship, and the search for a treasure that can reshape the world.',
    genres: ['Action', 'Adventure', 'Comedy'],
    studio: 'Toei Animation',
    year: 1999,
    episodes: 1164,
    duration: '24m',
    type: 'TV',
    status: 'Ongoing',
    rating: 9.2,
    ageRating: 'PG-13',
    quality: 'HD',
    producer: 'Fuji TV',
    malScore: 8.72,
    aired: 'Oct 20, 1999',
    views: 2200000,
    tags: ['popular', 'trending'],
    color: 'linear-gradient(135deg, #7c3aed, #08070d 48%, #2563eb)'
  },
  {
    id: 'solo-leveling',
    title: 'Solo Leveling',
    english: 'Solo Leveling',
    japanese: 'Ore dake Level Up na Ken',
    description: 'A low-ranked hunter enters a brutal system that lets him grow beyond human limits.',
    longDescription: 'A stylish action fantasy about gates, monsters, and one hunter climbing from weakest to unmatched.',
    genres: ['Action', 'Fantasy', 'Supernatural'],
    studio: 'A-1 Pictures',
    year: 2024,
    episodes: 25,
    duration: '24m',
    type: 'TV',
    status: 'Completed',
    rating: 8.8,
    ageRating: 'R',
    quality: 'HD',
    producer: 'Aniplex',
    malScore: 8.27,
    aired: 'Jan 7, 2024',
    views: 1340000,
    tags: ['popular', 'trending'],
    color: 'linear-gradient(135deg, #8b5cf6, #09090b 46%, #1d4ed8)'
  },
  {
    id: 'naruto',
    title: 'Naruto',
    english: 'Naruto',
    japanese: 'Naruto',
    description: 'A young ninja fights to be recognized while carrying a dangerous power inside him.',
    longDescription: 'A coming-of-age ninja story built around rivalry, bonds, training, and the cost of ambition.',
    genres: ['Action', 'Adventure', 'Shounen'],
    studio: 'Pierrot',
    year: 2002,
    episodes: 220,
    duration: '23m',
    type: 'TV',
    status: 'Completed',
    rating: 8.6,
    ageRating: 'PG-13',
    quality: 'HD',
    producer: 'TV Tokyo',
    malScore: 8.0,
    aired: 'Oct 3, 2002',
    views: 1480000,
    tags: ['popular'],
    color: 'linear-gradient(135deg, #9333ea, #08070d 48%, #ea580c)'
  },
  {
    id: 'bleach',
    title: 'Bleach',
    english: 'Bleach',
    japanese: 'Bleach',
    description: 'A student becomes a soul reaper and is pulled into battles between worlds.',
    longDescription: 'Supernatural sword battles, stylish rivals, and spiritual warfare define this action classic.',
    genres: ['Action', 'Supernatural', 'Shounen'],
    studio: 'Pierrot',
    year: 2004,
    episodes: 366,
    duration: '24m',
    type: 'TV',
    status: 'Completed',
    rating: 8.5,
    ageRating: 'PG-13',
    quality: 'HD',
    producer: 'TV Tokyo',
    malScore: 7.96,
    aired: 'Oct 5, 2004',
    views: 1260000,
    tags: ['popular'],
    color: 'linear-gradient(135deg, #7c3aed, #08070d 48%, #f8fafc)'
  },
  {
    id: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    english: 'Jujutsu Kaisen',
    japanese: 'Jujutsu Kaisen',
    description: 'Sorcerers battle curses born from human fear, regret, and violence.',
    longDescription: 'A dark action series with curse techniques, brutal fights, and students facing impossible threats.',
    genres: ['Action', 'Supernatural', 'School'],
    studio: 'MAPPA',
    year: 2020,
    episodes: 47,
    duration: '24m',
    type: 'TV',
    status: 'Completed',
    rating: 8.9,
    ageRating: 'R',
    quality: 'HD',
    producer: 'TOHO Animation',
    malScore: 8.55,
    aired: 'Oct 3, 2020',
    views: 1510000,
    tags: ['popular', 'trending'],
    color: 'linear-gradient(135deg, #6d28d9, #09090b 46%, #0f766e)'
  },
  {
    id: 'black-clover',
    title: 'Black Clover',
    english: 'Black Clover',
    japanese: 'Black Clover',
    description: 'A magicless boy chases the top rank in a kingdom ruled by magic.',
    longDescription: 'A high-energy fantasy about rivalry, squads, grimoires, and refusing to give up.',
    genres: ['Action', 'Fantasy', 'Shounen'],
    studio: 'Pierrot',
    year: 2017,
    episodes: 170,
    duration: '24m',
    type: 'TV',
    status: 'Completed',
    rating: 8.4,
    ageRating: 'PG-13',
    quality: 'HD',
    producer: 'TV Tokyo',
    malScore: 8.12,
    aired: 'Oct 3, 2017',
    views: 990000,
    tags: ['popular'],
    color: 'linear-gradient(135deg, #8b5cf6, #09090b 48%, #16a34a)'
  },
  {
    id: 'wind-breaker',
    title: 'Wind Breaker',
    english: 'Wind Breaker',
    japanese: 'Wind Breaker',
    description: 'A fierce student enters a school where strength is used to protect the town.',
    longDescription: 'A delinquent action drama focused on pride, found allies, and street-level battles.',
    genres: ['Action', 'School', 'Drama'],
    studio: 'CloverWorks',
    year: 2024,
    episodes: 25,
    duration: '24m',
    type: 'TV',
    status: 'Airing',
    rating: 8.3,
    ageRating: 'PG-13',
    quality: 'HD',
    producer: 'Aniplex',
    malScore: 7.8,
    aired: 'Apr 5, 2024',
    views: 730000,
    tags: ['trending', 'topAiring'],
    color: 'linear-gradient(135deg, #7c3aed, #09090b 48%, #0891b2)'
  }
];

const seedAnime = [
  ...topSearchAnime,
  {
    id: 'violet-reign',
    title: 'Violet Reign',
    english: 'Violet Reign',
    japanese: 'Murasaki no Oukoku',
    description:
      'A tactical heir and a rogue exorcist uncover a neon empire powered by forbidden wishes.',
    longDescription:
      'In a city where every contract is signed in light, an exiled strategist returns to dismantle the royal system that stole his memories. Violet Reign blends supernatural battles, palace intrigue, and found-family momentum.',
    genres: ['Action', 'Fantasy', 'Mystery'],
    studio: 'Night Arc Works',
    year: 2026,
    episodes: 12,
    duration: '24m',
    type: 'TV',
    status: 'Airing',
    rating: 9.4,
    ageRating: 'PG-13',
    quality: 'HD',
    producer: 'Hakari Pictures',
    malScore: 9.12,
    aired: 'Jan 12, 2026',
    views: 981240,
    tags: ['featured', 'trending', 'topAiring', 'popular'],
    color: 'linear-gradient(135deg, #8B5CF6, #111827 48%, #f43f5e)'
  },
  {
    id: 'orbit-lullaby',
    title: 'Orbit Lullaby',
    english: 'Orbit Lullaby',
    japanese: 'Kido no Komoriuta',
    description:
      'A music prodigy pilots a relic ship across collapsing colonies to save her brother.',
    longDescription:
      'Orbit Lullaby turns space opera into an intimate character drama, pairing cosmic set pieces with songs that alter gravity, memory, and destiny.',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    studio: 'Lumen Forge',
    year: 2025,
    episodes: 24,
    duration: '23m',
    type: 'TV',
    status: 'Completed',
    rating: 8.9,
    ageRating: 'PG-13',
    quality: 'FHD',
    producer: 'Lumen Committee',
    malScore: 8.81,
    aired: 'Apr 8, 2025',
    views: 754020,
    tags: ['featured', 'popular', 'recent'],
    color: 'linear-gradient(135deg, #22d3ee, #171717 46%, #8B5CF6)'
  },
  {
    id: 'ronin-afterimage',
    title: 'Ronin Afterimage',
    english: 'Ronin Afterimage',
    japanese: 'Zanzou Ronin',
    description:
      'A wandering swordsman fights echoes of himself in a province trapped between seconds.',
    longDescription:
      'A quiet samurai thriller with explosive sword choreography, Ronin Afterimage follows a survivor whose future selves keep arriving with warnings he refuses to hear.',
    genres: ['Action', 'Adventure', 'Drama'],
    studio: 'Kageframe',
    year: 2024,
    episodes: 1,
    duration: '112m',
    type: 'Movie',
    status: 'Completed',
    rating: 9.1,
    ageRating: 'R',
    quality: '4K',
    producer: 'Kage Union',
    malScore: 8.96,
    aired: 'Nov 22, 2024',
    views: 640500,
    tags: ['trending', 'popular'],
    color: 'linear-gradient(135deg, #ef4444, #09090b 45%, #a855f7)'
  },
  {
    id: 'cafe-moonfall',
    title: 'Cafe Moonfall',
    english: 'Cafe Moonfall',
    japanese: 'Tsuki no Kissaten',
    description:
      'A midnight cafe serves desserts that let customers speak to one lost memory.',
    longDescription:
      'Romance, comedy, and magical realism meet in a tiny cafe that opens only during meteor showers. Each episode follows a wish, a dessert, and the emotional cost of remembering.',
    genres: ['Romance', 'Comedy', 'Fantasy'],
    studio: 'Softline Pictures',
    year: 2026,
    episodes: 10,
    duration: '22m',
    type: 'TV',
    status: 'Airing',
    rating: 8.6,
    ageRating: 'PG',
    quality: 'HD',
    producer: 'Softline Media',
    malScore: 8.42,
    aired: 'Feb 3, 2026',
    views: 518850,
    tags: ['featured', 'topAiring', 'recent'],
    color: 'linear-gradient(135deg, #f472b6, #18181b 48%, #8B5CF6)'
  },
  {
    id: 'haunted-server',
    title: 'Haunted Server',
    english: 'Haunted Server',
    japanese: 'Yuurei Saaba',
    description:
      'Game developers debug a cursed MMO where deleted players keep logging back in.',
    longDescription:
      'A tense horror mystery about code, grief, and digital ghosts. Haunted Server uses stylish UI horror and psychological tension instead of cheap shocks.',
    genres: ['Horror', 'Mystery', 'Sci-Fi'],
    studio: 'Null Room',
    year: 2025,
    episodes: 8,
    duration: '25m',
    type: 'OVA',
    status: 'Completed',
    rating: 8.4,
    ageRating: 'R',
    quality: 'HD',
    producer: 'Null Syndicate',
    malScore: 8.18,
    aired: 'Oct 13, 2025',
    views: 407820,
    tags: ['trending', 'recent'],
    color: 'linear-gradient(135deg, #10b981, #0a0a0a 45%, #7c3aed)'
  },
  {
    id: 'striker-aurora',
    title: 'Striker Aurora',
    english: 'Striker Aurora',
    japanese: 'Oorora no Sutoraikaa',
    description:
      'An underdog futsal team chases a championship under artificial northern lights.',
    longDescription:
      'Sports energy, friendship friction, and bright tactical animation drive this tournament series about players learning to trust their own style.',
    genres: ['Sports', 'Comedy', 'Drama'],
    studio: 'Rush Eleven',
    year: 2026,
    episodes: 16,
    duration: '24m',
    type: 'TV',
    status: 'Airing',
    rating: 8.7,
    ageRating: 'PG',
    quality: 'HD',
    producer: 'Rush Sports Lab',
    malScore: 8.55,
    aired: 'Mar 17, 2026',
    views: 339900,
    tags: ['topAiring', 'popular'],
    color: 'linear-gradient(135deg, #84cc16, #111827 48%, #8B5CF6)'
  },
  {
    id: 'isekai-protocol',
    title: 'Isekai Protocol',
    english: 'Isekai Protocol',
    japanese: 'Isekai Purotokoru',
    description:
      'A security engineer reincarnates as a dungeon auditor and exploits the rulebook.',
    longDescription:
      'Part adventure, part workplace satire, Isekai Protocol follows a practical hero who beats demon lords through process maps, strange friends, and extremely audited magic.',
    genres: ['Isekai', 'Adventure', 'Comedy'],
    studio: 'Gatehouse Studio',
    year: 2024,
    episodes: 132,
    duration: '24m',
    type: 'TV',
    status: 'Completed',
    rating: 8.8,
    ageRating: 'PG-13',
    quality: 'FHD',
    producer: 'Gatehouse Media',
    malScore: 8.72,
    aired: 'Jul 6, 2024',
    views: 691420,
    tags: ['featured', 'trending', 'popular'],
    color: 'linear-gradient(135deg, #f59e0b, #09090b 46%, #8B5CF6)'
  },
  {
    id: 'black-petal-code',
    title: 'Black Petal Code',
    english: 'Black Petal Code',
    japanese: 'Kurobara Kodo',
    description:
      'Assassins leave coded flowers at crime scenes in a city governed by predictions.',
    longDescription:
      'A noir mystery with sleek futuristic action, Black Petal Code tracks a detective who must break the prophecy engine before it writes her death.',
    genres: ['Mystery', 'Action', 'Sci-Fi'],
    studio: 'Parallax Den',
    year: 2026,
    episodes: 11,
    duration: '24m',
    type: 'TV',
    status: 'Airing',
    rating: 9.0,
    ageRating: 'PG-13',
    quality: 'HD',
    producer: 'Parallax Guild',
    malScore: 8.94,
    aired: 'May 1, 2026',
    views: 831010,
    tags: ['featured', 'topAiring', 'recent'],
    color: 'linear-gradient(135deg, #4c1d95, #0f0f10 48%, #ec4899)'
  }
];

const makeEpisodes = (anime) =>
  Array.from({ length: anime.episodes }, (_, index) => ({
    id: `${anime.id}-ep-${index + 1}`,
    number: index + 1,
    title:
      index === 0
        ? 'The First Signal'
        : index === anime.episodes - 1
          ? 'Violet Horizon'
          : `Pulse ${String(index + 1).padStart(2, '0')}`,
    description: `Episode ${index + 1} of ${anime.title} expands the central mystery with sharp character turns and polished action beats.`,
    thumbnailPosition: `${(index * 13) % 100}% ${(index * 17) % 100}%`,
    sources: sampleSources
  }));

const seedEpisodes = Object.fromEntries(seedAnime.map((anime) => [anime.id, makeEpisodes(anime)]));

const genreIcons = {
  Action: Zap,
  Adventure: Sparkles,
  Fantasy: Star,
  Romance: Heart,
  Comedy: MessageCircle,
  Horror: Shield,
  'Sci-Fi': Gauge,
  Sports: Flame,
  Drama: Clapperboard,
  Mystery: Search,
  Isekai: MoreHorizontal
};

function readStore(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function useLocalStore(key, fallback) {
  const [value, setValue] = useState(() => readStore(key, fallback));
  useEffect(() => writeStore(key, value), [key, value]);
  return [value, setValue];
}

function formatViews(value) {
  return Intl.NumberFormat('en', { notation: 'compact' }).format(value);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeProfileTab(tab) {
  return profileTabIds.includes(tab) ? tab : defaultProfileTab;
}

function normalizeUserPreferences(value) {
  return {
    ...defaultUserPreferences,
    ...(value && typeof value === 'object' ? value : {}),
    skipSeconds: clamp(Number.parseInt(value?.skipSeconds, 10) || defaultUserPreferences.skipSeconds, 1, 120)
  };
}

function normalizeUserProfile(value) {
  if (!value || typeof value !== 'object') return null;
  return {
    username: value.username || 'Google Viewer',
    email: value.email || 'viewer@gmail.com',
    avatar: value.avatar || '',
    joinDate: value.joinDate || new Date().toLocaleDateString(),
    verified: value.verified ?? true,
    provider: value.provider || 'google',
    role: value.role || 'member',
    preferences: normalizeUserPreferences(value.preferences)
  };
}

function getPreferredAnimeTitle(anime, preferences = defaultUserPreferences) {
  if (!anime) return '';
  if (preferences?.animeNameLanguage === 'Japanese') {
    return anime.japanese || anime.english || anime.title;
  }
  return anime.english || anime.title || anime.japanese || '';
}

function resolvePreferredLanguage(anime, preferences = defaultUserPreferences) {
  const availableAudio = Array.isArray(anime?.audio) ? anime.audio : ['sub', 'dub'];
  const availableSources = Object.keys(seedEpisodes[anime?.id]?.[0]?.sources || {});
  const available = new Set([...availableAudio, ...availableSources]);

  const order =
    preferences?.autoSelectLanguage === 'Only Dub'
      ? ['dub', 'sub', 'hindi']
      : preferences?.autoSelectLanguage === 'Only Sub'
        ? ['sub', 'dub', 'hindi']
        : ['dub', 'sub', 'hindi'];

  return order.find((item) => available.has(item)) || availableSources[0] || 'sub';
}

function createAvatarDataUri({ background, accent, hair, skin, eyes }) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="46" fill="url(#bg)" />
      <circle cx="80" cy="96" r="34" fill="${skin}" />
      <path d="M35 78c6-36 34-54 60-54s48 16 54 48c-14-8-24-10-36-6-12 4-22 4-36 0-13-4-25-2-42 12Z" fill="${hair}" />
      <path d="M48 124c7-18 22-28 32-28s26 10 32 28v26H48Z" fill="rgba(255,255,255,0.12)" />
      <ellipse cx="67" cy="96" rx="8" ry="10" fill="white" />
      <ellipse cx="93" cy="96" rx="8" ry="10" fill="white" />
      <circle cx="67" cy="98" r="4.4" fill="${eyes}" />
      <circle cx="93" cy="98" r="4.4" fill="${eyes}" />
      <circle cx="68.5" cy="96.5" r="1.2" fill="white" />
      <circle cx="94.5" cy="96.5" r="1.2" fill="white" />
      <path d="M71 118c4 4 14 4 18 0" stroke="#7b4455" stroke-width="4" stroke-linecap="round" fill="none" />
      <path d="M57 88c3-4 8-7 14-7" stroke="${hair}" stroke-width="4" stroke-linecap="round" fill="none" />
      <path d="M89 81c6 0 11 3 14 7" stroke="${hair}" stroke-width="4" stroke-linecap="round" fill="none" />
      <circle cx="123" cy="38" r="16" fill="rgba(255,255,255,0.12)" />
      <path d="M118 38h10M123 33v10" stroke="white" stroke-width="3" stroke-linecap="round" />
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const animeAvatarOptions = avatarPresets.map((preset, index) => ({
  id: `avatar-${index + 1}`,
  label: `Avatar ${index + 1}`,
  src: createAvatarDataUri(preset)
}));

function normalizeWatchlist(value) {
  if (Array.isArray(value)) {
    return Object.fromEntries(value.map((id) => [id, 'Planned']));
  }
  return value && typeof value === 'object' ? value : {};
}

function getAnimeMeta(anime) {
  return {
    ageRating: anime.ageRating || 'PG-13',
    quality: anime.quality || 'HD',
    alternativeNames: [anime.english, anime.japanese].filter(Boolean).join(', '),
    score: anime.malScore || anime.rating,
    producer: anime.producer || `${anime.studio} Committee`,
    synonyms: [anime.english, anime.japanese, `${anime.title} Series`].filter(Boolean).join(', '),
    aired: anime.aired || `${anime.year}`
  };
}

function formatScore(value) {
  return typeof value === 'number' ? value.toFixed(2) : value || 'N/A';
}

function formatDuration(value) {
  if (!value) return 'Unknown';
  return String(value).replace(/(\d+)\s*m$/i, '$1 min');
}

function formatStatus(value) {
  if (!value) return 'Unknown';
  if (value === 'Ongoing' || value === 'Airing') return 'Currently Airing';
  return value;
}

function getAvatarLabel(user) {
  return (user?.username || user?.email || 'H').slice(0, 1).toUpperCase();
}

function getNotificationAnime(item, anime) {
  if (!item) return null;
  if (item.animeId) return anime.find((entry) => entry.id === item.animeId) || null;
  const haystack = `${item.title || ''} ${item.message || ''}`.toLowerCase();
  return anime.find((entry) => [entry.title, entry.english, entry.japanese].filter(Boolean).some((name) => haystack.includes(name.toLowerCase()))) || null;
}

function getAnimeImage(anime) {
  return anime?.image || heroArt;
}

function getAudioLabel(anime) {
  const audio = anime.audio || ['sub', 'dub'];
  const hasSub = audio.includes('sub');
  const hasDub = audio.includes('dub');
  if (hasSub && hasDub) return 'SUB + DUB';
  if (hasDub) return 'DUB';
  return 'SUB';
}

function getOtherNames(anime) {
  const names = [anime.english, anime.japanese]
    .filter(Boolean)
    .filter((name, index, list) => list.findIndex((item) => item.toLowerCase() === name.toLowerCase()) === index)
    .filter((name) => name.toLowerCase() !== anime.title.toLowerCase());
  return names.join(', ') || 'No alternative names listed.';
}

function isTouchScreen() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

function getUpdatedTime(anime) {
  return Date.parse(anime.updatedAt || anime.aired || `${anime.year}-01-01`) || 0;
}

function getAddedTime(anime) {
  return Date.parse(anime.addedAt || anime.aired || `${anime.year}-01-01`) || 0;
}

function getVisibleGenres(anime, settings = defaultSiteSettings) {
  const occupied = new Set(anime.flatMap((item) => item.genres || []));
  return genres.filter((genre) => occupied.has(genre) && settings.genres?.[genre] !== false);
}

function getVisibleTypes(anime, settings = defaultSiteSettings) {
  const occupied = new Set(anime.map((item) => item.type));
  return animeTypes.filter((type) => occupied.has(type) && settings.types?.[type] !== false);
}

function getTopSearches(anime, analytics, limit = 7) {
  return [...anime]
    .map((item) => ({ item, searches: Number(analytics[item.id] || 0) }))
    .sort((a, b) => b.searches - a.searches || b.item.views - a.item.views)
    .slice(0, limit)
    .map(({ item, searches }) => ({ ...item, searches }));
}

function normalizeSearchText(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getSearchTokens(value = '') {
  return normalizeSearchText(value).split(' ').filter(Boolean);
}

function scoreSearchMatch(item, tokens, normalizedQuery) {
  const titleFields = [item.title, item.english, item.japanese]
    .map((value) => normalizeSearchText(value))
    .filter(Boolean);
  const metaFields = [item.studio, item.type, ...(item.genres || [])]
    .map((value) => normalizeSearchText(value))
    .filter(Boolean);
  const combined = [...titleFields, ...metaFields].join(' ');
  let score = 0;

  if (titleFields.some((field) => field === normalizedQuery)) score += 120;
  if (titleFields.some((field) => field.includes(normalizedQuery))) score += 70;
  if (metaFields.some((field) => field.includes(normalizedQuery))) score += 34;
  if (tokens.length && tokens.every((token) => combined.includes(token))) score += 24;
  score += Math.min(Number(item.views || 0) / 50000, 18);

  return score;
}

function sortSearchItems(items, tokens, normalizedQuery) {
  return [...items].sort((a, b) => {
    const scoreDiff = scoreSearchMatch(b, tokens, normalizedQuery) - scoreSearchMatch(a, tokens, normalizedQuery);
    if (scoreDiff) return scoreDiff;
    return Number(b.views || 0) - Number(a.views || 0) || a.title.localeCompare(b.title);
  });
}

function getSearchResultGroups(anime, query) {
  const normalizedQuery = normalizeSearchText(query);
  const tokens = getSearchTokens(query);

  if (!normalizedQuery) return [];

  const exact = [];
  const similar = [];
  const related = [];
  const seen = new Set();

  anime.forEach((item) => {
    const titleFields = [item.title, item.english, item.japanese]
      .map((value) => normalizeSearchText(value))
      .filter(Boolean);
    const metaFields = [item.studio, item.type, ...(item.genres || [])]
      .map((value) => normalizeSearchText(value))
      .filter(Boolean);
    const combined = [...titleFields, ...metaFields].join(' ');

    if (titleFields.some((field) => field === normalizedQuery)) {
      exact.push(item);
      seen.add(item.id);
      return;
    }

    const titleIncludesQuery = titleFields.some((field) => field.includes(normalizedQuery) || normalizedQuery.includes(field));
    const titleMatchesTokens = tokens.length > 1 && titleFields.some((field) => tokens.every((token) => field.includes(token)));
    if (titleIncludesQuery || titleMatchesTokens) {
      similar.push(item);
      seen.add(item.id);
      return;
    }

    const metaIncludesQuery = metaFields.some((field) => field.includes(normalizedQuery));
    const combinedMatchesTokens = tokens.length > 0 && tokens.every((token) => combined.includes(token));
    if (metaIncludesQuery || combinedMatchesTokens) {
      related.push(item);
      seen.add(item.id);
    }
  });

  const fallbackRelated = anime.filter((item) => {
    if (seen.has(item.id)) return false;
    const combined = [
      item.title,
      item.english,
      item.japanese,
      item.studio,
      item.type,
      ...(item.genres || [])
    ]
      .map((value) => normalizeSearchText(value))
      .filter(Boolean)
      .join(' ');
    return tokens.some((token) => combined.includes(token));
  });

  fallbackRelated.forEach((item) => related.push(item));

  return [
    { key: 'exact', title: 'Exact Matches', kicker: 'Direct hit', items: sortSearchItems(exact, tokens, normalizedQuery) },
    { key: 'similar', title: 'Similar Titles', kicker: 'Name matches', items: sortSearchItems(similar, tokens, normalizedQuery) },
    { key: 'related', title: 'Related Results', kicker: 'Studios, genres, and metadata', items: sortSearchItems(related, tokens, normalizedQuery) }
  ].filter((group) => group.items.length > 0);
}

function preloadHeroImage(src) {
  if (!src || typeof window === 'undefined') return Promise.resolve(null);
  if (heroImageCache.has(src)) return heroImageCache.get(src);

  const promise = new Promise((resolve) => {
    const image = new window.Image();
    image.decoding = 'async';

    const finalize = () => resolve(image);

    image.onload = () => {
      if (typeof image.decode === 'function') {
        image.decode().then(finalize).catch(finalize);
      } else {
        finalize();
      }
    };
    image.onerror = () => resolve(null);
    image.src = src;

    if (image.complete) {
      image.onload?.();
    }
  });

  heroImageCache.set(src, promise);
  return promise;
}

function findAnimeByTitle(anime, title) {
  return anime.find((item) => item.title.toLowerCase() === title.toLowerCase());
}

const HOVER_OPEN_DELAY_MS = 160;
const HOVER_CLOSE_GRACE_MS = 120;
const HOVER_EXIT_DURATION_MS = 200;

function App() {
  const [route, setRoute] = useState(() => parseRoute(location.hash));
  const [anime, setAnime] = useLocalStore('hakari-anime', seedAnime);
  const [watchlist, setWatchlist] = useLocalStore('hakari-watchlist', {});
  const [history, setHistory] = useLocalStore('hakari-history', []);
  const [user, setUser] = useLocalStore('hakari-user', null);
  const [siteSettings, setSiteSettings] = useLocalStore('hakari-site-settings', defaultSiteSettings);
  const [searchAnalytics, setSearchAnalytics] = useLocalStore('hakari-search-analytics', defaultSearchAnalytics);
  const [watchlistTarget, setWatchlistTarget] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoverPanelState, setHoverPanelState] = useState(null);
  const [notifications, setNotifications] = useLocalStore('hakari-notifications', defaultNotifications);
  const hoverSourceRef = useRef({ sourceId: null, element: null, anime: null });
  const hoverPendingSourceRef = useRef(null);
  const hoverHoveredSourceIdRef = useRef(null);
  const hoverPanelHoveredRef = useRef(false);
  const hoverOpenTimerRef = useRef(null);
  const hoverCloseTimerRef = useRef(null);
  const hoverRafRef = useRef(null);
  const hoverTransitioningRef = useRef(false);
  const normalizedUser = useMemo(() => normalizeUserProfile(user), [user]);
  const userPreferences = normalizedUser?.preferences || defaultUserPreferences;

  useEffect(() => {
    const onHash = () => setRoute(parseRoute(location.hash));
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (location.hash && location.hash !== '#/landing') return;
    window.history.replaceState(null, '', `${location.pathname}${location.search}#/home`);
  }, []);

  useEffect(() => {
    if (Array.isArray(watchlist)) setWatchlist(normalizeWatchlist(watchlist));
  }, [watchlist, setWatchlist]);

  useEffect(() => {
    if (!user || user.preferences) return;
    setUser((current) => normalizeUserProfile(current));
  }, [user, setUser]);

  useEffect(() => {
    setAnime((items) => {
      const missing = topSearchAnime.filter((item) => !items.some((animeItem) => animeItem.id === item.id));
      return missing.length ? [...missing, ...items] : items;
    });
  }, [setAnime]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const navigate = useCallback((nextRoute) => {
    location.hash = routeToHash(nextRoute);
    setSidebarOpen(false);
    scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const watchlistMap = normalizeWatchlist(watchlist);
  const mergedSiteSettings = useMemo(() => ({
    ...defaultSiteSettings,
    ...siteSettings,
    landing: { ...defaultSiteSettings.landing, ...(siteSettings.landing || {}) },
    sidebar: { ...defaultSiteSettings.sidebar, ...(siteSettings.sidebar || {}) },
    homepageSections: { ...defaultSiteSettings.homepageSections, ...(siteSettings.homepageSections || {}) },
    genres: { ...defaultSiteSettings.genres, ...(siteSettings.genres || {}) },
    types: { ...defaultSiteSettings.types, ...(siteSettings.types || {}) }
  }), [siteSettings]);

  const setWatchlistCategory = useCallback((animeId, category) => {
    setWatchlist((items) => {
      const next = { ...normalizeWatchlist(items) };
      if (!category) delete next[animeId];
      else next[animeId] = category;
      return next;
    });
  }, [setWatchlist]);

  const toggleWatchlist = useCallback((animeId) => {
    setWatchlist((items) => {
      const next = { ...normalizeWatchlist(items) };
      if (next[animeId]) delete next[animeId];
      else next[animeId] = 'Planned';
      return next;
    });
  }, [setWatchlist]);

  const openWatchlistModal = useCallback((animeId) => setWatchlistTarget(animeId), []);

  const addSearch = useCallback((term) => {
    const clean = term.trim();
    if (!clean) return;
    const direct = findAnimeByTitle(anime, clean);
    if (direct) {
      setSearchAnalytics((items) => ({ ...items, [direct.id]: Number(items[direct.id] || 0) + 1 }));
    }
  }, [anime, setSearchAnalytics]);

  const updateProgress = useCallback((entry) => {
    setHistory((items) => {
      const next = [entry, ...items.filter((item) => item.animeId !== entry.animeId)].slice(0, 8);
      return next;
    });
  }, [setHistory]);

  const removeHistoryItem = useCallback((animeId) => {
    setHistory((items) => items.filter((item) => item.animeId !== animeId));
  }, [setHistory]);

  const clearHoverOpenTimer = useCallback(() => {
    if (hoverOpenTimerRef.current != null) {
      window.clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
  }, []);

  const clearHoverCloseTimer = useCallback(() => {
    if (hoverCloseTimerRef.current != null) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  }, []);

  const clearHoverPanel = useCallback(() => {
    clearHoverOpenTimer();
    clearHoverCloseTimer();
    if (hoverRafRef.current != null) {
      window.cancelAnimationFrame(hoverRafRef.current);
      hoverRafRef.current = null;
    }
    hoverPendingSourceRef.current = null;
    hoverHoveredSourceIdRef.current = null;
    hoverPanelHoveredRef.current = false;
    hoverTransitioningRef.current = false;
    hoverSourceRef.current = { sourceId: null, element: null, anime: null };
    setHoverPanelState(null);
  }, [clearHoverCloseTimer, clearHoverOpenTimer]);

  const measureHoverSource = useCallback((source = hoverSourceRef.current) => {
    const element = source?.element;
    if (!element || !element.isConnected) {
      clearHoverPanel();
      return;
    }

    const anchorRect = element.getBoundingClientRect();
    const roomOnRight = window.innerWidth - anchorRect.right;
    const panelWidth = 340; // 320px + 20px safety margin

    setHoverPanelState({
      sourceId: source.sourceId,
      anime: source.anime,
      anchorRect,
      preferredSide: roomOnRight >= panelWidth ? 'right' : 'left'
    });
  }, [clearHoverPanel]);

  const scheduleHoverSync = useCallback((source = hoverSourceRef.current) => {
    if (!source?.sourceId) return;
    if (hoverRafRef.current != null) return;
    hoverRafRef.current = window.requestAnimationFrame(() => {
      hoverRafRef.current = null;
      if (hoverSourceRef.current.sourceId !== source.sourceId) return;
      measureHoverSource(source);
    });
  }, [measureHoverSource]);

  const activateHoverSource = useCallback((source) => {
    if (!source?.element || !source.element.isConnected) return;
    hoverSourceRef.current = source;
    hoverPendingSourceRef.current = null;
    hoverTransitioningRef.current = false;
    measureHoverSource(source);
    scheduleHoverSync(source);
  }, [measureHoverSource, scheduleHoverSync]);

  const beginHoverOpen = useCallback((source, delay = HOVER_OPEN_DELAY_MS) => {
    if (!source?.sourceId) return;
    clearHoverOpenTimer();
    hoverPendingSourceRef.current = source;
    hoverOpenTimerRef.current = window.setTimeout(() => {
      hoverOpenTimerRef.current = null;
      if (hoverTransitioningRef.current) return;
      if (hoverHoveredSourceIdRef.current !== source.sourceId) return;
      if (hoverPendingSourceRef.current?.sourceId !== source.sourceId) return;
      activateHoverSource(source);
    }, delay);
  }, [activateHoverSource, clearHoverOpenTimer]);

  const startHoverClose = useCallback(({ nextSource = null } = {}) => {
    clearHoverOpenTimer();
    clearHoverCloseTimer();
    if (nextSource) {
      hoverPendingSourceRef.current = nextSource;
    } else if (hoverPendingSourceRef.current?.sourceId === hoverSourceRef.current.sourceId) {
      hoverPendingSourceRef.current = null;
    }

    if (!hoverPanelState) {
      hoverSourceRef.current = { sourceId: null, element: null, anime: null };
      hoverTransitioningRef.current = false;
      return;
    }

    hoverPanelHoveredRef.current = false;
    hoverTransitioningRef.current = true;
    setHoverPanelState(null);
  }, [clearHoverCloseTimer, clearHoverOpenTimer, hoverPanelState]);

  const queueHoverClose = useCallback((sourceId = hoverSourceRef.current.sourceId) => {
    if (!sourceId) return;
    clearHoverCloseTimer();
    hoverCloseTimerRef.current = window.setTimeout(() => {
      hoverCloseTimerRef.current = null;
      if (hoverSourceRef.current.sourceId !== sourceId) return;
      if (hoverHoveredSourceIdRef.current === sourceId) return;
      if (hoverPanelHoveredRef.current) return;
      startHoverClose();
    }, HOVER_CLOSE_GRACE_MS);
  }, [clearHoverCloseTimer, startHoverClose]);

  const openHoverPanel = useCallback(({ sourceId, anime: hoverAnime, element }) => {
    const source = { sourceId, anime: hoverAnime, element };
    hoverHoveredSourceIdRef.current = sourceId;
    clearHoverCloseTimer();

    if (hoverSourceRef.current.sourceId === sourceId) {
      hoverSourceRef.current = source;
      hoverPendingSourceRef.current = null;
      hoverTransitioningRef.current = false;
      measureHoverSource(source);
      scheduleHoverSync(source);
      return;
    }

    hoverPendingSourceRef.current = source;

    if (hoverTransitioningRef.current) return;

    if (hoverPanelState && hoverSourceRef.current.sourceId && hoverSourceRef.current.sourceId !== sourceId) {
      startHoverClose({ nextSource: source });
      return;
    }

    beginHoverOpen(source);
  }, [beginHoverOpen, clearHoverCloseTimer, hoverPanelState, measureHoverSource, scheduleHoverSync, startHoverClose]);

  const syncHoverPanel = useCallback(({ sourceId, element, anime: hoverAnime }) => {
    if (!sourceId || !element) return;

    if (hoverSourceRef.current.sourceId === sourceId) {
      hoverSourceRef.current = {
        ...hoverSourceRef.current,
        element,
        anime: hoverAnime || hoverSourceRef.current.anime
      };
      scheduleHoverSync(hoverSourceRef.current);
      return;
    }

    if (hoverPendingSourceRef.current?.sourceId === sourceId) {
      hoverPendingSourceRef.current = {
        ...hoverPendingSourceRef.current,
        element,
        anime: hoverAnime || hoverPendingSourceRef.current.anime
      };
    }
  }, [scheduleHoverSync]);

  const leaveHoverSource = useCallback((sourceId) => {
    if (!sourceId) return;
    if (hoverHoveredSourceIdRef.current === sourceId) {
      hoverHoveredSourceIdRef.current = null;
    }

    if (hoverPendingSourceRef.current?.sourceId === sourceId && hoverSourceRef.current.sourceId !== sourceId) {
      clearHoverOpenTimer();
      hoverPendingSourceRef.current = null;
    }

    if (hoverSourceRef.current.sourceId === sourceId && !hoverPanelHoveredRef.current) {
      queueHoverClose(sourceId);
    }
  }, [clearHoverOpenTimer, queueHoverClose]);

  const enterHoverPanel = useCallback(() => {
    hoverPanelHoveredRef.current = true;
    clearHoverCloseTimer();
  }, [clearHoverCloseTimer]);

  const leaveHoverPanel = useCallback(() => {
    hoverPanelHoveredRef.current = false;
    if (hoverSourceRef.current.sourceId && hoverHoveredSourceIdRef.current !== hoverSourceRef.current.sourceId) {
      queueHoverClose(hoverSourceRef.current.sourceId);
    }
  }, [queueHoverClose]);

  const handleHoverSourceUnmount = useCallback((sourceId) => {
    if (!sourceId) return;
    if (hoverHoveredSourceIdRef.current === sourceId) {
      hoverHoveredSourceIdRef.current = null;
    }
    if (hoverPendingSourceRef.current?.sourceId === sourceId) {
      clearHoverOpenTimer();
      hoverPendingSourceRef.current = null;
    }
    if (hoverSourceRef.current.sourceId === sourceId) {
      clearHoverPanel();
    }
  }, [clearHoverOpenTimer, clearHoverPanel]);

  const handleHoverPanelExitComplete = useCallback(() => {
    if (!hoverTransitioningRef.current) return;

    hoverTransitioningRef.current = false;
    hoverSourceRef.current = { sourceId: null, element: null, anime: null };
    hoverPanelHoveredRef.current = false;

    const pendingSource = hoverPendingSourceRef.current;
    if (pendingSource && hoverHoveredSourceIdRef.current === pendingSource.sourceId) {
      beginHoverOpen(pendingSource);
      return;
    }

    hoverPendingSourceRef.current = null;
  }, [beginHoverOpen]);

  useEffect(() => {
    if (!hoverPanelState) return undefined;

    const handleResize = () => scheduleHoverSync();
    const handleScroll = () => startHoverClose();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [hoverPanelState, scheduleHoverSync, startHoverClose]);

  useEffect(() => {
    clearHoverPanel();
  }, [clearHoverPanel, route]);

  const hoverPanelContext = useMemo(() => ({
    hoverPanelState,
    openHoverPanel,
    syncHoverPanel,
    leaveHoverSource,
    enterHoverPanel,
    leaveHoverPanel,
    cancelHoverClose: clearHoverCloseTimer,
    clearHoverPanel,
    handleHoverSourceUnmount,
    handleHoverPanelExitComplete,
    isOpenForSource: (sourceId) => hoverPanelState?.sourceId === sourceId
  }), [
    clearHoverCloseTimer,
    clearHoverPanel,
    enterHoverPanel,
    handleHoverPanelExitComplete,
    handleHoverSourceUnmount,
    hoverPanelState,
    leaveHoverPanel,
    leaveHoverSource,
    openHoverPanel,
    syncHoverPanel
  ]);

  const context = {
    anime,
    setAnime,
    watchlist: watchlistMap,
    setWatchlistCategory,
    toggleWatchlist,
    openWatchlistModal,
    history,
    updateProgress,
    addSearch,
    siteSettings: mergedSiteSettings,
    setSiteSettings,
    searchAnalytics,
    setSearchAnalytics,
    user: normalizedUser,
    setUser,
    userPreferences,
    notifications,
    setNotifications,
    removeHistoryItem,
    navigate
  };

  return (
    <HoverPanelContext.Provider value={hoverPanelContext}>
      <div className="app">
        <>
          <Header
            {...context}
            route={route}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            setSearchOpen={setSearchOpen}
          />
          <Sidebar {...context} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
        <main className="appMain">
          {route.name === 'home' && <HomePage {...context} />}
          {route.name === 'listing' && <ListingPage {...context} title={route.title} filter={route.filter} />}
          {route.name === 'genre' && <ListingPage {...context} title={`${route.genre} Anime`} filter={(item) => item.genres.includes(route.genre)} />}
          {route.name === 'type' && <ListingPage {...context} title={`${route.type} Anime`} filter={(item) => item.type === route.type} />}
          {route.name === 'search' && <SearchResultsPage {...context} query={route.query} />}
          {route.name === 'detail' && <DetailPage {...context} animeId={route.id} />}
          {route.name === 'watch' && <WatchPage {...context} animeId={route.id} episodeNumber={route.episode} />}
          {route.name === 'watchlist' && <WatchlistPage {...context} />}
          {route.name === 'profile' && <ProfilePage {...context} route={route} />}
          {route.name === 'settings' && <SettingsPage />}
          {route.name === 'admin' && <AdminPage {...context} />}
        </main>
        {watchlistTarget && (
          <WatchlistPopup
            anime={anime.find((item) => item.id === watchlistTarget)}
            current={watchlistMap[watchlistTarget]}
            setWatchlistCategory={setWatchlistCategory}
            onClose={() => setWatchlistTarget(null)}
          />
        )}
        <AnimatePresence initial={false} mode="wait" onExitComplete={handleHoverPanelExitComplete}>
          {hoverPanelState && (
            <AnimeHoverPanel
              key={hoverPanelState.sourceId}
              anime={hoverPanelState.anime}
              anchorRect={hoverPanelState.anchorRect}
              preferredSide={hoverPanelState.preferredSide}
              navigate={navigate}
              watchlist={watchlistMap}
              setWatchlistCategory={setWatchlistCategory}
              userPreferences={userPreferences}
              onPointerEnter={enterHoverPanel}
              onPointerLeave={leaveHoverPanel}
              onClose={clearHoverPanel}
            />
          )}
        </AnimatePresence>
        <Footer navigate={navigate} />
      </div>
    </HoverPanelContext.Provider>
  );
}

function parseRoute(hash) {
  const clean = hash.replace(/^#\/?/, '');
  const [name, first, second] = clean.split('/').map(decodeURIComponent);
  if (!name || name === 'landing') return { name: 'home' };
  if (name === 'movies') return { name: 'listing', title: 'Movies', filter: (item) => item.type === 'Movie' };
  if (name === 'series') return { name: 'listing', title: 'TV Series', filter: (item) => item.type === 'TV' };
  if (name === 'popular') return { name: 'listing', title: 'Most Popular', filter: () => true };
  if (name === 'updated') return { name: 'listing', title: 'Updated', filter: () => true };
  if (name === 'added') return { name: 'listing', title: 'Added', filter: () => true };
  if (name === 'ongoing') return { name: 'listing', title: 'Ongoing', filter: (item) => item.status === 'Airing' || item.status === 'Ongoing' };
  if (name === 'completed') return { name: 'listing', title: 'Completed', filter: (item) => item.status === 'Completed' };
  if (name === 'airing') return { name: 'listing', title: 'Top Airing', filter: (item) => item.status === 'Airing' };
  if (name === 'genre') return { name: 'genre', genre: first || 'Action' };
  if (name === 'type') return { name: 'type', type: first || 'TV' };
  if (name === 'search') return { name: 'search', query: first || '' };
  if (name === 'anime') return { name: 'detail', id: first };
  if (name === 'watch') return { name: 'watch', id: first, episode: Number(second || 1) };
  if (name === 'watchlist') return { name: 'watchlist' };
  if (name === 'profile') return { name: 'profile', tab: normalizeProfileTab(first) };
  if (name === 'settings') return { name: 'settings' };
  if (name === 'admin') return { name: 'admin' };
  return { name: 'home' };
}

function routeToHash(route) {
  if (typeof route === 'string') return `#/${route}`;
  if (route.name === 'detail') return `#/anime/${route.id}`;
  if (route.name === 'watch') return `#/watch/${route.id}/${route.episode || 1}`;
  if (route.name === 'genre') return `#/genre/${encodeURIComponent(route.genre)}`;
  if (route.name === 'type') return `#/type/${encodeURIComponent(route.type)}`;
  if (route.name === 'search') return `#/search/${encodeURIComponent(route.query || '')}`;
  if (route.name === 'profile') {
    const tab = normalizeProfileTab(route.tab);
    return tab === defaultProfileTab ? '#/profile' : `#/profile/${encodeURIComponent(tab)}`;
  }
  return `#/${route.name}`;
}

function BrandLogo({ className = 'logo', label = 'Hakari', onClick }) {
  return (
    <button className={className} onClick={onClick} aria-label={label}>
      <img src={brandLogo} alt="" />
    </button>
  );
}

function HeaderDropdown({ isOpen, type, onClose, navigate, triggerRef }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose, triggerRef]);

  const genresList = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Isekai', 'Romance', 'Sci-Fi', 'Sports', 'Horror', 'Mystery', 'Psychological', 'Slice of Life', 'Supernatural'];
  const typesList = ['TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music'];
  
  const items = type === 'genre' ? genresList : type === 'type' ? typesList : [];

  const handleSelect = (item) => {
    onClose();
    if (type === 'genre') {
      navigate({ name: 'genre', genre: item });
    } else {
      navigate({ name: 'type', type: item });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          className="headerDropdownPanel"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="headerDropdownGrid">
            {items.map((item) => (
              <button key={item} className="headerDropdownItem" onClick={() => handleSelect(item)}>
                {item}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Header({
  anime,
  user,
  setUser,
  navigate,
  watchlist,
  setWatchlistCategory,
  userPreferences,
  notifications,
  setNotifications,
  sidebarOpen,
  setSidebarOpen,
  addSearch
}) {
  const [authOpen, setAuthOpen] = useState(false);
  const [headerDropdown, setHeaderDropdown] = useState(null);
  const dropdownTriggerRef = useRef(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileMenuPosition, setProfileMenuPosition] = useState({ top: 0, left: 0 });
  const profileMenuRef = useRef(null);
  const unread = notifications.filter((item) => item.unread).length;
  const profileMenuItems = [
    ['profile', 'Profile'],
    ['continue-watching', 'Continue Watching'],
    ['watchlist', 'Watchlist'],
    ['notification', 'Notification'],
    ['settings', 'Settings']
  ];

  const closeProfileMenu = useCallback(() => setProfileMenuOpen(false), []);

  const openProfileMenu = useCallback((button) => {
    const rect = button.getBoundingClientRect();
    const menuWidth = 228;
    setProfileMenuPosition({
      top: rect.bottom + 10,
      left: clamp(rect.right - menuWidth, 12, window.innerWidth - menuWidth - 12)
    });
    setProfileMenuOpen(true);
    setNoticeOpen(false);
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) return undefined;
    const handleOutside = (event) => {
      if (profileMenuRef.current?.contains(event.target)) return;
      if (event.target.closest('.profileButton')) return;
      closeProfileMenu();
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') closeProfileMenu();
    };
    const handleViewportChange = () => closeProfileMenu();
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [closeProfileMenu, profileMenuOpen]);

  const handleProfileButton = (event) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (profileMenuOpen) {
      closeProfileMenu();
      return;
    }
    openProfileMenu(event.currentTarget);
  };

  const handleProfileMenuNavigate = (tab) => {
    closeProfileMenu();
    navigate({ name: 'profile', tab });
  };

  const logoutFromMenu = () => {
    closeProfileMenu();
    setUser(null);
    navigate('home');
  };

  return (
    <header className="topbar">
      <div className="topbarInner siteContainer">
        <div className="headerLeft">
          <BrandLogo onClick={() => navigate('home')} />
        </div>

        <div className="headerCenterLeft">
          <HeaderSearch
            anime={anime}
            navigate={navigate}
            addSearch={addSearch}
            watchlist={watchlist}
            setWatchlistCategory={setWatchlistCategory}
            userPreferences={userPreferences}
            desktopBoundaryRef={dropdownTriggerRef}
          />
        </div>

        <div className="headerActions">
          <div className="headerCenter" ref={dropdownTriggerRef}>
            <button
              className={`navLink ${headerDropdown === 'genre' ? 'active' : ''}`}
              onClick={() => setHeaderDropdown(headerDropdown === 'genre' ? null : 'genre')}
            >
              Genre
            </button>
            <button
              className={`navLink ${headerDropdown === 'type' ? 'active' : ''}`}
              onClick={() => setHeaderDropdown(headerDropdown === 'type' ? null : 'type')}
            >
              Type
            </button>
            <HeaderDropdown
              isOpen={!!headerDropdown}
              type={headerDropdown}
              onClose={() => setHeaderDropdown(null)}
              navigate={navigate}
              triggerRef={dropdownTriggerRef}
            />
          </div>
          <button className="iconButton notificationButton" onClick={() => setNoticeOpen(!noticeOpen)} aria-label="Notifications">
            <Bell size={19} />
            {unread > 0 && <span>{unread}</span>}
          </button>
          {user ? (
            <button className="avatarButton profileButton" onClick={handleProfileButton} aria-label="Profile">
              {user.avatar ? <img src={user.avatar} alt="" /> : <span>{getAvatarLabel(user)}</span>}
            </button>
          ) : (
            <button className="iconButton profileButton" onClick={() => setAuthOpen(true)} aria-label="Profile">
              <UserCircle size={20} />
            </button>
          )}
        </div>

        <div className="mobileHeaderRow">
          <button
            className={`iconButton hamburgerButton ${sidebarOpen ? 'open' : ''}`}
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
          >
            <span />
            <span />
            <span />
          </button>
          <BrandLogo className="logo mobileHeaderLogo" onClick={() => navigate('home')} />
          <HeaderSearch
            anime={anime}
            navigate={navigate}
            addSearch={addSearch}
            watchlist={watchlist}
            setWatchlistCategory={setWatchlistCategory}
            userPreferences={userPreferences}
            mobileOnly
          />
          <button className="iconButton notificationButton" onClick={() => setNoticeOpen(!noticeOpen)} aria-label="Notifications">
            <Bell size={19} />
            {unread > 0 && <span>{unread}</span>}
          </button>
          {user ? (
            <button className="avatarButton profileButton" onClick={handleProfileButton} aria-label="Profile">
              {user.avatar ? <img src={user.avatar} alt="" /> : <span>{getAvatarLabel(user)}</span>}
            </button>
          ) : (
            <button className="iconButton profileButton" onClick={() => setAuthOpen(true)} aria-label="Profile">
              <UserCircle size={20} />
            </button>
          )}
        </div>
      </div>
      {noticeOpen && (
        <div className="popover notifications">
          <div className="popoverHeader">
            <strong>Notifications</strong>
            <button onClick={() => setNotifications((items) => items.map((item) => ({ ...item, unread: false })))}>Mark read</button>
          </div>
          {notifications.map((item) => (
            <div className={`notice ${item.unread ? 'unread' : ''}`} key={item.id}>
              <span>{item.type}</span>
              <p>{item.message || item.title}</p>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {profileMenuOpen && user && (
          <motion.div
            ref={profileMenuRef}
            className="profileDropdownMenu"
            style={{ top: profileMenuPosition.top, left: profileMenuPosition.left }}
            initial={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(8px)' }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {profileMenuItems.map(([tab, label]) => (
              <button key={tab} onClick={() => handleProfileMenuNavigate(tab)}>
                {label}
              </button>
            ))}
            <button className="danger" onClick={logoutFromMenu}>
              <LogOut size={16} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {authOpen && <AuthModal setUser={setUser} onClose={() => setAuthOpen(false)} />}
    </header>
  );
}

function Sidebar({ anime, siteSettings, navigate, open, onClose }) {
  const [panel, setPanel] = useState(null);
  const visibleGenres = getVisibleGenres(anime, siteSettings);
  const visibleTypes = getVisibleTypes(anime, siteSettings);
  const categoryEnabled = (label) => siteSettings.sidebar?.[label] !== false;
  const items = [
    ['home', Home, 'Home'],
    ['genre', Sparkles, 'Genre'],
    ['types', Clapperboard, 'Types'],
    ['updated', Clock3, 'Updated'],
    ['added', Plus, 'Added'],
    ['popular', Flame, 'Popular'],
    ['ongoing', Zap, 'Ongoing'],
    ['completed', BookmarkCheck, 'Completed']
  ].filter(([, , label]) => categoryEnabled(label));

  return (
    <>
      <aside className={`siteSidebar ${open ? 'open' : ''}`}>
        <nav>
          {items.map(([route, Icon, label]) => (
            <button
              key={label}
              className={panel === route ? 'active' : ''}
              onClick={() => {
                if (route === 'genre') {
                  setPanel((value) => (value === 'genre' ? null : 'genre'));
                  return;
                }
                if (route === 'types') {
                  setPanel((value) => (value === 'types' ? null : 'types'));
                  return;
                }
                navigate(route);
              }}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        {panel === 'genre' && (
          <div className="sidebarFlyout genreFlyout">
            {visibleGenres.map((genre) => (
              <button key={genre} onClick={() => navigate({ name: 'genre', genre })}>{genre}</button>
            ))}
          </div>
        )}
        {panel === 'types' && (
          <div className="sidebarFlyout typeFlyout">
            {visibleTypes.map((type) => (
              <button key={type} onClick={() => navigate({ name: 'type', type })}>{type}</button>
            ))}
          </div>
        )}
      </aside>
      {open && <button className="sidebarScrim" onClick={onClose} aria-label="Close sidebar" />}
    </>
  );
}

function HeaderSearch({ anime, navigate, addSearch, watchlist, setWatchlistCategory, userPreferences, mobileOnly = false, desktopBoundaryRef = null }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [desktopMotionState, setDesktopMotionState] = useState('');
  const [desktopWidths, setDesktopWidths] = useState({ compact: 320, expanded: 500 });
  const [searchHistory, setSearchHistory] = useLocalStore('hakari-fanzio-search-history', []);
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const containerRef = useRef(null);
  const desktopStageRef = useRef(null);
  const lastExpandedRef = useRef(false);

  const hasQuery = query.trim().length > 0;
  const isExpanded = isFocused || isHovered || hasQuery;
  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    return anime
      .filter((item) =>
        [item.title, item.english, item.japanese, item.studio, ...item.genres]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .slice(0, 6);
  }, [anime, normalizedQuery]);

  const recentSearches = useMemo(() => {
    return searchHistory.slice(0, 5);
  }, [searchHistory]);

  const filteredHistory = useMemo(() => {
    if (!normalizedQuery) return recentSearches;
    return recentSearches.filter((term) => term.toLowerCase().includes(normalizedQuery)).slice(0, 3);
  }, [normalizedQuery, recentSearches]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isMobileOpen) return undefined;
    const id = window.setTimeout(() => mobileInputRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [isMobileOpen]);

  const measureDesktopWidths = useCallback(() => {
    if (mobileOnly) return;
    const shell = containerRef.current;
    if (!shell) return;

    const shellRect = shell.getBoundingClientRect();
    if (!shellRect.width) return;

    const computed = window.getComputedStyle(shell);
    const desiredExpanded = parseFloat(computed.getPropertyValue('--hakari-search-expanded-width')) || shellRect.width;
    const safetyGap = parseFloat(computed.getPropertyValue('--hakari-search-safety-gap')) || 28;
    const compactWidth = shellRect.width;
    let expandedWidth = desiredExpanded;
    const boundary = desktopBoundaryRef?.current;

    if (boundary) {
      const boundaryRect = boundary.getBoundingClientRect();
      expandedWidth = Math.min(expandedWidth, boundaryRect.left - shellRect.left - safetyGap);
    }

    expandedWidth = Math.max(compactWidth, expandedWidth);
    setDesktopWidths((current) => (
      Math.abs(current.compact - compactWidth) < 0.5 && Math.abs(current.expanded - expandedWidth) < 0.5
        ? current
        : { compact: compactWidth, expanded: expandedWidth }
    ));
  }, [desktopBoundaryRef, mobileOnly]);

  useLayoutEffect(() => {
    if (mobileOnly) return undefined;

    measureDesktopWidths();
    const rafId = window.requestAnimationFrame(measureDesktopWidths);
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => measureDesktopWidths()) : null;
    const observedElements = [containerRef.current, desktopBoundaryRef?.current].filter(Boolean);

    observedElements.forEach((element) => observer?.observe(element));
    window.addEventListener('resize', measureDesktopWidths);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', measureDesktopWidths);
      observer?.disconnect();
    };
  }, [desktopBoundaryRef, measureDesktopWidths, mobileOnly]);

  useEffect(() => {
    if (lastExpandedRef.current === isExpanded) return undefined;
    setDesktopMotionState(isExpanded ? 'is-expanding' : 'is-collapsing');
    lastExpandedRef.current = isExpanded;
    const id = window.setTimeout(() => setDesktopMotionState(''), 430);
    return () => window.clearTimeout(id);
  }, [isExpanded]);

  const rememberSearch = useCallback((term) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== term.toLowerCase());
      return [term, ...filtered].slice(0, 10);
    });
  }, [setSearchHistory]);

  const submit = (value = query) => {
    const term = value.trim();
    if (!term) return;
    addSearch(term);
    rememberSearch(term);
    navigate({ name: 'search', query: term });
    setIsFocused(false);
    setIsHovered(false);
    setIsMobileOpen(false);
    setQuery('');
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    setSearchHistory([]);
  };

  const syncDesktopFocus = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (containerRef.current?.contains(document.activeElement)) return;
      setIsFocused(false);
    });
  }, []);

  const desktopDropdownOpen = isFocused && (!normalizedQuery ? recentSearches.length > 0 : true);
  const mobileDropdownOpen = isMobileOpen && (!normalizedQuery ? recentSearches.length > 0 : true);
  const desktopVisualWidth = isExpanded ? desktopWidths.expanded : desktopWidths.compact;
  const desktopShellStyle = !mobileOnly
    ? {
        '--hakari-search-visual-width': `${desktopVisualWidth}px`,
        '--hakari-search-stage-width': `${desktopWidths.expanded}px`
      }
    : undefined;

  const selectAnime = (item, closeMobile = false) => {
    addSearch(item.title);
    rememberSearch(item.title);
    navigate({ name: 'search', query: item.title });
    setIsFocused(false);
    setIsHovered(false);
    setIsMobileOpen(false);
    if (closeMobile) setIsMobileOpen(false);
    setQuery('');
  };

  return (
    <>
      {!mobileOnly && (
        <div
          className="hakariHeaderSearch desktopSearchShell"
          ref={containerRef}
          style={desktopShellStyle}
        >
          <div
            ref={desktopStageRef}
            className={`hakariSearchStage ${desktopMotionState}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className={`hakariSearchBar ${isExpanded ? 'expanded' : ''} ${isFocused ? 'focused' : ''}`}
              onClick={() => {
                setIsFocused(true);
                inputRef.current?.focus();
              }}
            >
              <Search size={18} className="hakariSearchIcon" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search anime..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={syncDesktopFocus}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </div>

            <AnimatePresence>
              {desktopDropdownOpen && (
                <motion.div
                  className="hakariSearchDropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  {!normalizedQuery && recentSearches.length > 0 && (
                    <>
                      <div className="hakariDropdownHeader">
                        <h4>Recent Searches</h4>
                        <button className="hakariClearButton" onClick={clearHistory}>Clear</button>
                      </div>
                      <div className="hakariSearchList">
                        {recentSearches.map((term) => (
                          <button key={term} className="hakariSearchListItem compact" onClick={() => submit(term)}>
                            <Clock3 size={14} />
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {normalizedQuery && (
                    <>
                      <div className="hakariDropdownHeader">
                        <h4>Matching Anime</h4>
                        {filteredHistory.length > 0 && <span>{filteredHistory.length} recent</span>}
                      </div>
                      {results.length > 0 ? (
                        <div className="hakariSearchList">
                          {results.map((item) => {
                            const displayTitle = getPreferredAnimeTitle(item, userPreferences);
                            return (
                              <HoverCard
                                key={item.id}
                                anime={item}
                                navigate={navigate}
                                className="headerSuggestionHover"
                                watchlist={watchlist}
                                setWatchlistCategory={setWatchlistCategory}
                                mobileNavigateRoute={{ name: 'search', query: item.title }}
                              >
                                <button className="hakariSearchListItem" onClick={() => selectAnime(item)}>
                                  <img src={getAnimeImage(item)} alt="" className="hakariSuggestionPoster" />
                                  <span>
                                    <strong>{displayTitle}</strong>
                                    <small>{item.type} • {item.year} • {getAudioLabel(item)}</small>
                                  </span>
                                </button>
                              </HoverCard>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="hakariSearchEmptyState">
                          No matches found for &quot;{query.trim()}&quot;.
                        </div>
                      )}
                      {filteredHistory.length > 0 && (
                        <>
                          <div className="hakariDropdownHeader secondary">
                            <h4>Recent</h4>
                            <button className="hakariClearButton" onClick={clearHistory}>Clear</button>
                          </div>
                          <div className="hakariSearchList">
                            {filteredHistory.map((term) => (
                              <button key={term} className="hakariSearchListItem compact" onClick={() => submit(term)}>
                                <Clock3 size={14} />
                                <span>{term}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="hakariHeaderSearch mobileSearchShell">
        <button className="hakariSearchBar mobileTrigger" onClick={() => setIsMobileOpen(true)} aria-label="Open search">
          <Search size={18} className="hakariSearchIcon" />
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="hakariMobileSearchOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <button className="hakariMobileSearchBackdrop" onClick={() => setIsMobileOpen(false)} aria-label="Close search" />
            <motion.div
              className="hakariMobileSearchSheet"
              initial={{ opacity: 0, y: 18, filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 12, filter: 'blur(10px)' }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hakariMobileSearchTop">
                <div className="hakariSearchBar mobileOpen">
                  <Search size={18} className="hakariSearchIcon" />
                  <input
                    ref={mobileInputRef}
                    type="text"
                    placeholder="Search anime..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                  />
                </div>
                <button className="iconButton" onClick={() => setIsMobileOpen(false)} aria-label="Close search">
                  <X size={18} />
                </button>
              </div>

              {mobileDropdownOpen && (
                <div className="hakariSearchDropdown mobile">
                  {!normalizedQuery && recentSearches.length > 0 && (
                    <>
                      <div className="hakariDropdownHeader">
                        <h4>Recent Searches</h4>
                        <button className="hakariClearButton" onClick={clearHistory}>Clear</button>
                      </div>
                      <div className="hakariSearchList">
                        {recentSearches.map((term) => (
                          <button key={term} className="hakariSearchListItem compact" onClick={() => submit(term)}>
                            <Clock3 size={14} />
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {normalizedQuery && results.length > 0 && (
                    <>
                      <div className="hakariDropdownHeader">
                        <h4>Matching Anime</h4>
                      </div>
                      <div className="hakariSearchList">
                        {results.map((item) => {
                          const displayTitle = getPreferredAnimeTitle(item, userPreferences);
                          return (
                            <button key={item.id} className="hakariSearchListItem" onClick={() => selectAnime(item, true)}>
                              <img src={getAnimeImage(item)} alt="" className="hakariSuggestionPoster" />
                              <span>
                                <strong>{displayTitle}</strong>
                                <small>{item.type} • {item.year} • {getAudioLabel(item)}</small>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {normalizedQuery && !results.length && (
                    <div className="hakariSearchEmptyState">
                      No matches found for &quot;{query.trim()}&quot;.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function HomePage(props) {
  const { anime, siteSettings, userPreferences } = props;
  const sections = siteSettings.homepageSections || defaultSiteSettings.homepageSections;
  const trendingAnime = anime.filter((item) => item.tags.includes('trending')).slice(0, 10);
  return (
    <>
      <HeroSlider {...props} slides={anime.filter((item) => item.tags.includes('featured')).slice(0, 4)} />
      {trendingAnime.length > 0 && <TrendingHeroSection items={trendingAnime} navigate={props.navigate} userPreferences={props.userPreferences} />}
      {userPreferences.showContinueWatchingOnHome && <ContinueWatching {...props} />}
      {sections.featured && <AnimeSection title="Featured Anime" items={anime.filter((item) => item.tags.includes('featured'))} {...props} />}
      {sections.topAiring && <AnimeSection title="Top Airing" items={anime.filter((item) => item.tags.includes('topAiring'))} {...props} />}
      {sections.latestEpisodes && <AnimeSection title="Latest Episodes" items={[...anime].sort((a, b) => getUpdatedTime(b) - getUpdatedTime(a))} latest {...props} />}
      {sections.mostPopular && <AnimeSection title="Most Popular" items={[...anime].sort((a, b) => b.views - a.views)} {...props} />}
      {sections.recentlyAdded && <AnimeSection title="Recently Added" items={[...anime].sort((a, b) => getAddedTime(b) - getAddedTime(a)).slice(0, 10)} {...props} />}
    </>
  );
}

function useHoverPanel() {
  return useContext(HoverPanelContext);
}

function HoverCard({
  children,
  anime,
  navigate,
  className,
  watchlist,
  setWatchlistCategory,
  mobileNavigateRoute = { name: 'detail', id: anime.id }
}) {
  const hoverPanel = useHoverPanel();
  const hoverPanelRef = useRef(hoverPanel);
  const cardRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchMovedRef = useRef(false);
  const sourceIdRef = useRef(`hover-card-${Math.random().toString(36).slice(2, 10)}`);
  const panelOpen = hoverPanel?.isOpenForSource(sourceIdRef.current) || false;

  useEffect(() => {
    hoverPanelRef.current = hoverPanel;
  }, [hoverPanel]);

  const openPanel = useCallback(() => {
    if (!cardRef.current) return;
    hoverPanel?.openHoverPanel({
      sourceId: sourceIdRef.current,
      anime,
      element: cardRef.current
    });
  }, [anime, hoverPanel]);

  const handleMouseEnter = () => {
    if (isTouchScreen()) return;
    openPanel();
  };

  const handleMouseLeave = () => {
    if (isTouchScreen()) return;
    hoverPanel?.leaveHoverSource(sourceIdRef.current);
  };

  const handleMouseMove = () => {
    if (!panelOpen || !cardRef.current) return;
    hoverPanel?.syncHoverPanel({
      sourceId: sourceIdRef.current,
      anime,
      element: cardRef.current
    });
  };

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    touchMovedRef.current = false;
  };

  const handleTouchMove = (event) => {
    if (!touchStartRef.current) return;
    const touch = event.touches[0];
    if (!touch) return;
    if (Math.abs(touch.clientX - touchStartRef.current.x) > 8 || Math.abs(touch.clientY - touchStartRef.current.y) > 8) {
      touchMovedRef.current = true;
    }
  };

  useEffect(() => {
    return () => {
      hoverPanelRef.current?.handleHoverSourceUnmount(sourceIdRef.current);
    };
  }, []);

  const handleClickCapture = (event) => {
    if (!isTouchScreen() || touchMovedRef.current) return;
    const clickedPanel = event.target.closest('.animeHoverPanel');
    if (clickedPanel) return;
    if (!panelOpen) {
      event.preventDefault();
      event.stopPropagation();
      openPanel();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    hoverPanel?.clearHoverPanel();
    navigate(mobileNavigateRoute);
  };

  return (
    <div
      ref={cardRef}
      className={`hoverCardWrapper ${className || ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onClickCapture={handleClickCapture}
      style={{ zIndex: panelOpen ? 2 : 1 }}
    >
      {children}
    </div>
  );
}

function TrendingHeroSection({ items, navigate, userPreferences }) {
  const shellRef = useRef(null);
  const scrollRef = useRef(null);
  const [desktopVisibleCount, setDesktopVisibleCount] = useState(5);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(Array.isArray(items) ? items.length > 5 : false);

  const updateDesktopLayout = useCallback(() => {
    const shellWidth = shellRef.current?.getBoundingClientRect().width || 0;
    let nextCount = 5;
    if (shellWidth >= 1900) nextCount = 7;
    else if (shellWidth >= 1640) nextCount = 6;
    setDesktopVisibleCount(nextCount);
  }, []);

  const syncButtons = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    const maxLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    setCanScrollPrev(node.scrollLeft > 6);
    setCanScrollNext(node.scrollLeft < maxLeft - 6);
  }, []);

  useLayoutEffect(() => {
    updateDesktopLayout();
    syncButtons();
  }, [items.length, syncButtons, updateDesktopLayout]);

  useEffect(() => {
    const node = scrollRef.current;
    const shell = shellRef.current;
    if (!node || !shell) return undefined;

    const handleScroll = () => syncButtons();
    const resizeObserver = new ResizeObserver(() => {
      updateDesktopLayout();
      syncButtons();
    });

    node.addEventListener('scroll', handleScroll, { passive: true });
    resizeObserver.observe(node);
    resizeObserver.observe(shell);

    return () => {
      node.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [syncButtons, updateDesktopLayout]);

  const scrollByCard = useCallback((direction) => {
    const node = scrollRef.current;
    if (!node) return;
    const firstCard = node.querySelector('.trendingHeroCard');
    const track = node.querySelector('.trendingHeroTrack');
    if (!firstCard) return;

    const trackStyles = track ? window.getComputedStyle(track) : null;
    const gap = Number.parseFloat(trackStyles?.columnGap || trackStyles?.gap || '0') || 0;
    const stride = firstCard.getBoundingClientRect().width + gap;
    const maxIndex = Math.max(0, items.length - desktopVisibleCount);
    const currentIndex = Math.round(node.scrollLeft / Math.max(stride, 1));
    const targetIndex = clamp(currentIndex + direction, 0, maxIndex);

    node.scrollTo({
      left: targetIndex * stride,
      behavior: 'smooth'
    });
  }, [desktopVisibleCount, items.length]);

  if (!items || items.length === 0) return null;
  return (
    <section
      ref={shellRef}
      className="trendingHeroShell premiumTrendingShell"
      style={{
        '--trending-visible-count': desktopVisibleCount,
        '--trending-peek-width': '56px',
        '--trending-card-gap': '16px'
      }}
    >
      <div className="trendingHeroHeader">
        <h2>TRENDING NOW</h2>
      </div>
      <div className="trendingHeroStage">
        <div ref={scrollRef} className="trendingHeroScroll">
          <div className="trendingHeroTrack">
            {items.map((anime, index) => {
              const displayTitle = getPreferredAnimeTitle(anime, userPreferences);
              return (
              <HoverCard
                key={anime.id}
                anime={anime}
                navigate={navigate}
              className="trendingHeroCard"
              mobileNavigateRoute={{ name: 'detail', id: anime.id }}
            >
              <button className="trendingHeroPosterButton" onClick={() => navigate({ name: 'detail', id: anime.id })} aria-label={`Open ${displayTitle} details`}>
                <div className="trendingHeroPoster">
                  <Poster anime={anime} />
                  <div className="trendingHeroRank">{String(index + 1).padStart(2, '0')}</div>
                </div>
                <div className="trendingHeroTitle">{displayTitle}</div>
              </button>
            </HoverCard>
              );
            })}
          </div>
        </div>
        <div className="trendingHeroControls" aria-label="Trending navigation">
          <button
            className="trendingHeroControlButton"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollPrev}
            aria-label="Scroll trending left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="trendingHeroControlButton"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollNext}
            aria-label="Scroll trending right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

function AnimeHoverPanel({
  anime,
  anchorRect,
  preferredSide,
  navigate,
  watchlist,
  setWatchlistCategory,
  userPreferences,
  onPointerEnter,
  onPointerLeave,
  onClose
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [savedCategory, setSavedCategory] = useState('');
  const [position, setPosition] = useState({ left: 0, top: 0, side: preferredSide, height: 'auto' });
  const currentStatus = watchlist ? watchlist[anime.id] : null;
  const panelRef = useRef(null);
  const meta = getAnimeMeta(anime);
  const displayTitle = getPreferredAnimeTitle(anime, userPreferences);
  const audio = anime.audio || ['sub', 'dub'];
  const tagBadges = [
    meta.ageRating,
    meta.quality,
    audio.includes('sub') ? 'SUB' : null,
    audio.includes('dub') ? 'DUB' : null
  ].filter(Boolean);
  const metadataRows = [
    ['Other names', getOtherNames(anime)],
    ['Score', formatScore(meta.score)],
    ['Year', anime.year || 'Unknown'],
    ['Duration', formatDuration(anime.duration)],
    ['Status', formatStatus(anime.status)],
    ['Genres', anime.genres?.slice(0, 5).map((genre) => `(${genre})`).join(' ') || 'Unknown']
  ];

  useLayoutEffect(() => {
    if (!panelRef.current || !anchorRect) return;
    const rect = panelRef.current.getBoundingClientRect();
    const gap = 16;
    const margin = 12;
    const headerBottom = document.querySelector('.topbar')?.getBoundingClientRect().bottom || 0;
    const topBoundary = Math.max(margin, headerBottom + 12);

    let side = preferredSide === 'left' ? 'left' : 'right';
    let baseLeft = side === 'right'
      ? anchorRect.right + gap
      : anchorRect.left - rect.width - gap;

    if (side === 'right' && baseLeft + rect.width > window.innerWidth - margin) {
      side = 'left';
      baseLeft = anchorRect.left - rect.width - gap;
    }

    if (side === 'left' && baseLeft < margin) {
      side = 'right';
      baseLeft = anchorRect.right + gap;
    }

    const left = clamp(baseLeft, margin, Math.max(margin, window.innerWidth - rect.width - margin));
    const top = clamp(anchorRect.top + 12, topBoundary, Math.max(topBoundary, window.innerHeight - rect.height - margin));

    setPosition({ left, top, side, height: 'auto' });
  }, [anchorRect, dropdownOpen, preferredSide, savedCategory]);

  useEffect(() => {
    if (!savedCategory) return undefined;
    const id = window.setTimeout(() => setSavedCategory(''), 1600);
    return () => window.clearTimeout(id);
  }, [savedCategory]);

  const handleDropdownClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleSelectCategory = (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    if (setWatchlistCategory) {
      setWatchlistCategory(anime.id, category);
    }
    setDropdownOpen(false);
    setSavedCategory(category);
  };

  return (
    <motion.div
      ref={panelRef}
      className={`animeHoverPanel ${position.side}`}
      style={{ left: position.left, top: position.top, height: position.height }}
      initial={{ opacity: 0, y: 8, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -4, filter: 'blur(10px)' }}
      transition={{ duration: HOVER_EXIT_DURATION_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
      onClick={(e) => e.stopPropagation()}
    >
      <AnimatePresence>
        {savedCategory && (
          <motion.div
            className="panelSavedToast"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <Check size={14} />
            Saved to {savedCategory}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="panelHeader">
        <h3>{displayTitle}</h3>
        <div className="panelTagRow">
          {tagBadges.map((badge) => (
            <span key={badge} className={`panelTagBadge ${badge === meta.ageRating ? 'pgBadge' : ''}`}>{badge}</span>
          ))}
        </div>
      </div>
      <div className="panelSynopsisBlock">
        <p>{anime.description || anime.longDescription}</p>
      </div>
      <div className="panelDataList">
        {metadataRows.map(([label, value]) => (
          <div key={label} className="panelDataRow">
            <strong>{label}:</strong>
            <span>{value}</span>
          </div>
        ))}
      </div>
      <div className="panelActions">
        <button
          className="primaryButton ovalButton compact hoverWatchButton"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
            navigate({ name: 'watch', id: anime.id, episode: 1 });
          }}
        >
          <Play size={14} fill="currentColor" /> Watch
        </button>
        <div className="panelWatchlistWrap">
          <button className={`hoverQuickAdd ${currentStatus ? 'active' : ''}`} onClick={handleDropdownClick} aria-label="Quick watchlist">
            <Plus size={15} />
          </button>
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                className="panelWatchlistDropdown"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
              >
                {watchlistCategories.map((cat) => (
                  <button
                    key={cat}
                    className={`panelWatchlistOption ${currentStatus === cat ? 'active' : ''}`}
                    onClick={(e) => handleSelectCategory(e, cat)}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function HeroSlider({ slides, navigate, userPreferences }) {
  const sliderSlides = slides.length ? slides : [seedAnime[0]];
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const trackRef = useRef(null);
  const dragOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragPointerIdRef = useRef(null);
  const dragStartXRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const dragFrameRef = useRef(0);
  
  const extendedSlides = useMemo(() => {
    if (sliderSlides.length <= 1) return sliderSlides;
    return [
      sliderSlides[sliderSlides.length - 1],
      ...sliderSlides,
      sliderSlides[0]
    ];
  }, [sliderSlides]);

  useEffect(() => {
    extendedSlides
      .map((slide) => getAnimeImage(slide))
      .filter(Boolean)
      .forEach((src) => preloadHeroImage(src));
  }, [extendedSlides]);

  const goToNext = useCallback(() => {
    if (sliderSlides.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((current) => current + 1);
  }, [sliderSlides.length, isTransitioning]);

  const goToPrev = useCallback(() => {
    if (sliderSlides.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((current) => current - 1);
  }, [sliderSlides.length, isTransitioning]);

  useEffect(() => {
    if (sliderSlides.length <= 1 || isDraggingState) return undefined;
    const id = setInterval(() => {
      goToNext();
    }, 4000);
    return () => clearInterval(id);
  }, [goToNext, isDraggingState, sliderSlides.length]);

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentIndex === 0) {
      setCurrentIndex(sliderSlides.length);
    } else if (currentIndex === extendedSlides.length - 1) {
      setCurrentIndex(1);
    }
  };

  useEffect(() => {
    if (!isTransitioning) return undefined;
    const fallbackTimer = setTimeout(() => {
      handleTransitionEnd();
    }, 650);
    return () => clearTimeout(fallbackTimer);
  }, [isTransitioning, currentIndex, sliderSlides.length, extendedSlides.length]);

  const applyTrackTransform = useCallback((withTransition = false) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = withTransition ? 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
    trackRef.current.style.transform = `translate3d(calc(-${currentIndex * 100}% + ${dragOffsetRef.current}px), 0, 0)`;
  }, [currentIndex]);

  useLayoutEffect(() => {
    applyTrackTransform(isTransitioning && dragOffsetRef.current === 0 && !isDraggingRef.current);
  }, [applyTrackTransform, currentIndex, isTransitioning]);

  useEffect(() => () => {
    if (dragFrameRef.current) window.cancelAnimationFrame(dragFrameRef.current);
  }, []);

  const scheduleDragPaint = useCallback(() => {
    if (dragFrameRef.current) return;
    dragFrameRef.current = window.requestAnimationFrame(() => {
      dragFrameRef.current = 0;
      applyTrackTransform(false);
    });
  }, [applyTrackTransform]);

  const finishDrag = useCallback((direction = 0) => {
    isDraggingRef.current = false;
    dragPointerIdRef.current = null;
    setIsDraggingState(false);

    if (dragFrameRef.current) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = 0;
    }

    dragOffsetRef.current = 0;
    setIsTransitioning(true);

    if (direction === 0) {
      applyTrackTransform(true);
      return;
    }

    setCurrentIndex((current) => current + direction);
  }, [applyTrackTransform]);

  const handlePointerDown = (event) => {
    if (sliderSlides.length <= 1 || isTransitioning) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    if (dragFrameRef.current) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = 0;
    }
    isDraggingRef.current = true;
    dragPointerIdRef.current = event.pointerId;
    dragOffsetRef.current = 0;
    dragStartXRef.current = event.clientX;
    dragStartTimeRef.current = event.timeStamp || performance.now();
    setIsDraggingState(true);
    applyTrackTransform(false);
  };

  const handlePointerMove = (event) => {
    if (!isDraggingRef.current || dragPointerIdRef.current !== event.pointerId) return;
    dragOffsetRef.current = event.clientX - dragStartXRef.current;
    scheduleDragPaint();
  };

  const handlePointerUp = (event) => {
    if (!isDraggingRef.current || dragPointerIdRef.current !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const elapsed = Math.max(1, (event.timeStamp || performance.now()) - dragStartTimeRef.current);
    const distance = dragOffsetRef.current;
    const width = trackRef.current?.offsetWidth || window.innerWidth;
    const velocity = distance / elapsed;
    const threshold = Math.min(132, width * 0.14);

    if (distance <= -threshold || (distance <= -24 && velocity <= -0.52)) {
      finishDrag(1);
      return;
    }

    if (distance >= threshold || (distance >= 24 && velocity >= 0.52)) {
      finishDrag(-1);
      return;
    }

    finishDrag(0);
  };

  const handlePointerCancel = (event) => {
    if (!isDraggingRef.current || dragPointerIdRef.current !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    finishDrag(0);
  };

  const activeDotIndex = sliderSlides.length <= 1 ? 0 : 
    currentIndex === 0 ? sliderSlides.length - 1 :
    currentIndex === extendedSlides.length - 1 ? 0 :
    currentIndex - 1;

  const handleDotSelect = (dotIndex) => {
    if (isTransitioning || dotIndex === activeDotIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(dotIndex + 1);
  };

  return (
    <section className="heroShell">
      <div className={`heroStage ${isDraggingState ? 'dragging' : ''}`}>
        <div 
          ref={trackRef}
          className="heroTrack"
          style={{
            display: 'flex',
            width: '100%',
            transform: `translate3d(calc(-${currentIndex * 100}% + ${dragOffsetRef.current}px), 0, 0)`,
            transition: isTransitioning && dragOffsetRef.current === 0 && !isDraggingState ? 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
            willChange: 'transform',
            touchAction: 'pan-y',
            cursor: isDraggingState ? 'grabbing' : 'grab'
          }}
          onTransitionEnd={handleTransitionEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          {extendedSlides.map((slide, i) => {
          const slideMeta = getAnimeMeta(slide);
          const displayTitle = getPreferredAnimeTitle(slide, userPreferences);
          const key = `${slide.id}-${i}`;
          return (
            <article
              key={key}
              className="hero"
              style={{
                flex: '0 0 100%',
                width: '100%',
                '--hero-gradient': slide.color,
                '--hero-image': `url(${getAnimeImage(slide)})`,
                pointerEvents: i === currentIndex ? 'auto' : 'none',
                userSelect: 'none'
              }}
              aria-hidden={i !== currentIndex}
            >
              <div className="heroBackground" />
              <div className="heroArtworkPane" />
              <div className="heroGradientOverlay" />
              <div className="heroContent" style={{ userSelect: isDraggingState ? 'none' : 'text', WebkitUserSelect: isDraggingState ? 'none' : 'text' }}>
                <p className="kicker">Featured Anime</p>
                <h1 className="heroTitle">{displayTitle}</h1>
                <div className="metaRow heroMetaRow">
                  <span className="pgBadge">{slideMeta.ageRating}</span>
                  <span>{slide.type}</span>
                  <span>{slideMeta.quality}</span>
                  <span>{getAudioLabel(slide)}</span>
                  <span>{slide.year}</span>
                </div>
                <p>{slide.description}</p>
                <div className="heroActions">
                  <button
                    className="primaryButton ovalButton"
                    onClick={(e) => { e.stopPropagation(); navigate({ name: 'watch', id: slide.id, episode: 1 }); }}
                  >
                    <Play size={18} fill="currentColor" /> Watch Now
                  </button>
                  <button
                    className="ghostButton ovalButton"
                    onClick={(e) => { e.stopPropagation(); navigate({ name: 'detail', id: slide.id }); }}
                  >
                    <Clapperboard size={18} /> Details
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      
      {sliderSlides.length > 1 && (
        <>
          <div className="paginationDots">
            {sliderSlides.map((slide, dotIndex) => (
              <button
                key={slide.id}
                type="button"
                className={dotIndex === activeDotIndex ? 'active' : ''}
                aria-label={`Show ${slide.title}`}
                aria-pressed={dotIndex === activeDotIndex}
                onClick={() => handleDotSelect(dotIndex)}
              />
            ))}
          </div>
        </>
      )}
      </div>
    </section>
  );
}

function CategoryStrip({ navigate }) {
  return (
    <section className="categoryStrip">
      {genres.map((genre) => {
        const Icon = genreIcons[genre] || Sparkles;
        return (
          <button key={genre} className="categoryCard" onClick={() => navigate({ name: 'genre', genre })}>
            <Icon size={20} />
            <span>{genre}</span>
          </button>
        );
      })}
    </section>
  );
}

function ContinueWatching({ history, anime, navigate, watchlist, setWatchlistCategory, userPreferences }) {
  if (!history || history.length === 0) return null;
  return (
    <section className="continueSection siteContainer">
      <SectionHeading title="Continue Watching" />
      <div className="continueGrid">
        {history.map((entry) => {
          const item = anime.find((show) => show.id === entry.animeId);
          if (!item) return null;
          const displayTitle = getPreferredAnimeTitle(item, userPreferences);
          return (
            <HoverCard
              key={entry.animeId}
              anime={item}
              navigate={navigate}
              className="continueCard"
              watchlist={watchlist}
              setWatchlistCategory={setWatchlistCategory}
              mobileNavigateRoute={{ name: 'detail', id: item.id }}
            >
              <div style={{ display: 'flex', gap: '13px', width: '100%' }} onClick={() => navigate({ name: 'watch', id: item.id, episode: entry.episode })}>
                <Poster anime={item} small />
                <span>
                  <strong>{displayTitle}</strong>
                  <small>Episode {entry.episode} • {Math.round(entry.progress || 0)}% watched</small>
                  <i style={{ display: 'block', width: `${entry.progress || 0}%`, height: '2px', background: 'var(--purple)', marginTop: '4px' }} />
                </span>
              </div>
            </HoverCard>
          );
        })}
      </div>
    </section>
  );
}

function AnimeSection({ title, items, navigate, watchlist, openWatchlistModal, setWatchlistCategory, latest, userPreferences }) {
  if (!items.length) return null;
  const isLimited = items.length > 12;
  const displayItems = isLimited ? items.slice(0, 12) : items;
  return (
    <section className="animeSection siteContainer">
      <SectionHeading title={title} navigate={navigate} />
      <div className="animeGrid">
        {displayItems.map((item) => (
          <AnimeCard
            key={item.id}
            anime={item}
            navigate={navigate}
            latest={latest}
            watchlist={watchlist}
            setWatchlistCategory={setWatchlistCategory}
            userPreferences={userPreferences}
          />
        ))}
      </div>
      {isLimited && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
          <button className="ghostButton ovalButton" onClick={() => navigate({ name: 'listing', title })}>
            View More {title}
          </button>
        </div>
      )}
    </section>
  );
}

function SectionHeading({ title }) {
  return (
    <div className="sectionHeading">
      <h2>{title}</h2>
      <span />
    </div>
  );
}

function Poster({ anime, small = false, variant = 'default' }) {
  const audio = Array.isArray(anime.audio) ? anime.audio : ['sub', 'dub'];
  const hasDub = audio.includes('dub');
  const subEpisodes = anime.episodes ?? '?';
  const dubEpisodes = hasDub ? (anime.episodes ?? '?') : null;
  return (
    <div
      className={`poster ${small ? 'small' : ''} ${variant === 'standard-card' ? 'standardCardPoster' : ''}`}
      style={{
        '--poster-gradient': anime.color,
        '--poster-image': `url(${getAnimeImage(anime)})`,
        '--poster-position': `${(anime.year * 7) % 100}% ${(anime.views / 1000) % 100}%`
      }}
    >
      {variant === 'standard-card' && (
        <img className="posterArtwork" src={getAnimeImage(anime)} alt="" loading="lazy" />
      )}
      <div className="posterImage" />
      {variant === 'standard-card' ? (
        <div className="posterBottomOverlay">
          <div className="posterEpisodeBadges">
            <span className="posterEpisodeBadge sub">
              <ClosedCaption size={11} />
              {subEpisodes}
            </span>
            {hasDub && (
              <span className="posterEpisodeBadge dub">
                <Mic size={11} />
                {dubEpisodes}
              </span>
            )}
            {anime.type !== 'Movie' && (
              <span className="posterEpisodeBadge total">{anime.episodes ?? '?'}</span>
            )}
          </div>
          <span className="posterFormatText">{anime.type}</span>
        </div>
      ) : (
        <span>{anime.type}</span>
      )}
    </div>
  );
}

function AnimeCard({ anime, navigate, latest, watchlist, setWatchlistCategory, userPreferences }) {
  const displayTitle = getPreferredAnimeTitle(anime, userPreferences);
  return (
    <HoverCard
      anime={anime}
      navigate={navigate}
      className="animeCard"
      watchlist={watchlist}
      setWatchlistCategory={setWatchlistCategory}
      mobileNavigateRoute={{ name: 'detail', id: anime.id }}
    >
      <button className="cardPosterButton" onClick={() => navigate({ name: 'detail', id: anime.id })} aria-label={`Open ${displayTitle} details`}>
        <Poster anime={anime} variant="standard-card" />
        <span className="playOverlay">
          <Play size={28} />
        </span>
      </button>
      <div className="cardBody">
        <button className="titleButton" onClick={() => navigate({ name: 'detail', id: anime.id })}>
          {displayTitle}
        </button>
        <div className="cardMeta">
          <span>{anime.episodes} eps</span>
          <span>{getAudioLabel(anime)}</span>
          <span>{latest ? `EP ${anime.episodes}` : anime.type}</span>
        </div>
      </div>
    </HoverCard>
  );
}

function ListingPage({ anime, title, filter, navigate, watchlist, setWatchlistCategory, userPreferences }) {
  const filtered = anime.filter(filter);
  const items =
    title === 'Most Popular'
      ? [...filtered].sort((a, b) => b.views - a.views)
      : title === 'Updated'
        ? [...filtered].sort((a, b) => getUpdatedTime(b) - getUpdatedTime(a))
        : title === 'Added'
          ? [...filtered].sort((a, b) => getAddedTime(b) - getAddedTime(a))
          : filtered;
  return (
    <section className="pageShell">
      <div className="pageHeader">
        <p>Hakari Library</p>
        <h1>{title}</h1>
      </div>
      <div className="animeGrid large">
        {items.map((item) => (
          <AnimeCard key={item.id} anime={item} navigate={navigate} watchlist={watchlist} setWatchlistCategory={setWatchlistCategory} userPreferences={userPreferences} />
        ))}
      </div>
    </section>
  );
}

function SearchResultsPage({ anime, query, navigate, watchlist, setWatchlistCategory, userPreferences }) {
  const decodedQuery = decodeURIComponent(query || '').trim();
  const groups = useMemo(() => getSearchResultGroups(anime, decodedQuery), [anime, decodedQuery]);

  return (
    <section className="pageShell searchResultsPage">
      <div className="pageHeader">
        <p>Hakari Search</p>
        <h1>Search Results</h1>
      </div>
      {decodedQuery ? <p className="searchResultQuery">Results for &quot;{decodedQuery}&quot;</p> : null}
      {groups.length ? (
        <div className="searchResultsStack">
          {groups.map((group) => (
            <section key={group.key} className="searchResultGroup">
              <div className="searchResultGroupHeader">
                <div>
                  <p>{group.kicker}</p>
                  <h2>{group.title}</h2>
                </div>
                <span>{group.items.length}</span>
              </div>
              <div className="animeGrid large">
                {group.items.map((item) => (
                  <AnimeCard key={`${group.key}-${item.id}`} anime={item} navigate={navigate} watchlist={watchlist} setWatchlistCategory={setWatchlistCategory} userPreferences={userPreferences} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="searchEmptyState">
          <Search size={34} />
          <h2>Search Result Not Found</h2>
          <p>{decodedQuery ? `No anime matched "${decodedQuery}".` : 'Start a search to discover anime.'}</p>
        </div>
      )}
    </section>
  );
}

function DetailPage(props) {
  const { anime, animeId, navigate, watchlist, setWatchlistCategory, userPreferences } = props;
  const item = anime.find((show) => show.id === animeId) || anime[0];
  const meta = getAnimeMeta(item);
  const displayTitle = getPreferredAnimeTitle(item, userPreferences);
  const [expanded, setExpanded] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const watchlistRef = useRef(null);
  const related = anime.filter((show) => show.id !== item.id && show.genres.some((genre) => item.genres.includes(genre))).slice(0, 8);
  const recommended = [...anime].filter((show) => show.id !== item.id).sort((a, b) => b.rating - a.rating).slice(0, 8);
  const shortDescription =
    item.longDescription.length > 210 && !expanded
      ? `${item.longDescription.slice(0, 210).trim()}...`
      : item.longDescription;

  useEffect(() => {
    if (!watchlistOpen) return undefined;
    const handleOutside = (event) => {
      if (watchlistRef.current && !watchlistRef.current.contains(event.target)) {
        setWatchlistOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [watchlistOpen]);

  return (
    <section className="detailPage">
      <div className="detailBanner" style={{ '--hero-gradient': item.color, '--hero-image': `url(${getAnimeImage(item)})` }}>
        <div className="heroBackground" />
        <div className="detailPoster">
          <Poster anime={item} />
        </div>
        <div className="detailInfo">
          <h1>{displayTitle}</h1>
          <div className="detailTopMeta">
            <span>{meta.ageRating}</span>
            <span>{meta.quality}</span>
            <span>{item.type}</span>
            <span>{getAudioLabel(item)}</span>
            <span>{item.duration}</span>
            <span>{item.status}</span>
          </div>
          <div className="detailActions">
            <button className="primaryButton ovalButton" onClick={() => navigate({ name: 'watch', id: item.id, episode: 1 })}>
              <Play size={18} fill="currentColor" /> Watch Now
            </button>
            <div className="detailWatchlistWrap" ref={watchlistRef}>
              <button className="ghostButton ovalButton" onClick={() => setWatchlistOpen((value) => !value)}>
                {watchlist[item.id] ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                Add To Watchlist
              </button>
              <AnimatePresence>
                {watchlistOpen && (
                  <motion.div
                    className="detailWatchlistDropdown"
                    initial={{ opacity: 0, y: 8, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 6, filter: 'blur(8px)' }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {watchlistCategories.map((category) => (
                      <button
                        key={category}
                        className={watchlist[item.id] === category ? 'active' : ''}
                        onClick={() => {
                          setWatchlistCategory(item.id, category);
                          setWatchlistOpen(false);
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="detailSynopsis">
            <p>{shortDescription}</p>
            {item.longDescription.length > 210 && (
              <button className="moreToggle" onClick={() => setExpanded((value) => !value)}>{expanded ? '- Less' : '+ More'}</button>
            )}
          </div>
          <div className="detailSocials">
             <button className="socialIcon"><Heart size={18} /></button>
             <button className="socialIcon"><Zap size={18} /></button>
             <button className="socialIcon"><MessageCircle size={18} /></button>
          </div>
        </div>
        <aside className="animeInfoSidebar">
          <dl>
            <div><dt>Japanese</dt><dd>{item.japanese}</dd></div>
            <div><dt>Synonyms</dt><dd>{meta.synonyms}</dd></div>
            <div><dt>Aired</dt><dd>{meta.aired}</dd></div>
            <div><dt>Premiered</dt><dd>{item.year}</dd></div>
            <div><dt>Duration</dt><dd>{item.duration}</dd></div>
            <div><dt>Status</dt><dd>{item.status}</dd></div>
            <div><dt>MAL Score</dt><dd>{meta.score}</dd></div>
            <div><dt>Genres</dt><dd className="infoGenres">{item.genres.map((g) => <span key={g} className="genreTag">{g}</span>)}</dd></div>
            <div><dt>Studios</dt><dd>{item.studio}</dd></div>
            <div><dt>Producers</dt><dd>{meta.producer}</dd></div>
          </dl>
        </aside>
      </div>
      <div className="detailRails">
        <AnimeSection title="Related Anime" items={related} navigate={navigate} watchlist={watchlist} setWatchlistCategory={setWatchlistCategory} userPreferences={userPreferences} />
        <AnimeSection title="Recommended Anime" items={recommended} navigate={navigate} watchlist={watchlist} setWatchlistCategory={setWatchlistCategory} userPreferences={userPreferences} />
      </div>
    </section>
  );
}

function AnimeRail({ title, items, navigate, watchlist, setWatchlistCategory, userPreferences }) {
  if (!items.length) return null;
  return (
    <section className="animeRail">
      <SectionHeading title={title} />
      <div className="railScroller">
        {items.map((item) => (
          (() => {
            const displayTitle = getPreferredAnimeTitle(item, userPreferences);
            return (
          <HoverCard
            key={item.id}
            anime={item}
            navigate={navigate}
            watchlist={watchlist}
            setWatchlistCategory={setWatchlistCategory}
            mobileNavigateRoute={{ name: 'detail', id: item.id }}
          >
            <button onClick={() => navigate({ name: 'detail', id: item.id })}>
              <Poster anime={item} small />
              <span>
                <strong>{displayTitle}</strong>
                <small>{item.type} • {item.year}</small>
              </span>
            </button>
          </HoverCard>
            );
          })()
        ))}
      </div>
    </section>
  );
}

function WatchPage({ anime, animeId, episodeNumber, navigate, updateProgress, watchlist, setWatchlistCategory, userPreferences }) {
  const item = anime.find((show) => show.id === animeId) || anime[0];
  const episodes = seedEpisodes[item.id] || [];
  const episode = episodes.find((ep) => ep.number === episodeNumber) || episodes[0];
  const recommended = [...anime].filter((show) => show.id !== item.id).sort((a, b) => b.rating - a.rating).slice(0, 8);
  const displayTitle = getPreferredAnimeTitle(item, userPreferences);
  const initialLanguage = useMemo(() => resolvePreferredLanguage(item, userPreferences), [item, userPreferences]);
  const [episodeQuery, setEpisodeQuery] = useState('');
  const [rangeStart, setRangeStart] = useState(1);

  const ranges = useMemo(() => {
    if (episodes.length <= 100) return [];
    return Array.from({ length: Math.ceil(episodes.length / 100) }, (_, index) => {
      const start = index * 100 + 1;
      const end = Math.min(start + 99, episodes.length);
      return { start, end, label: `${start}-${end}` };
    });
  }, [episodes.length]);

  useEffect(() => {
    if (episodes.length > 100) {
      const selectedStart = Math.floor((episode.number - 1) / 100) * 100 + 1;
      setRangeStart(selectedStart);
    }
  }, [episode.number, episodes.length]);

  const sideEpisodes = episodes
    .filter((ep) => episodes.length <= 100 || (ep.number >= rangeStart && ep.number < rangeStart + 100))
    .filter((ep) => `${ep.number} ${ep.title}`.toLowerCase().includes(episodeQuery.toLowerCase()));

  const compactEpisodes = episodes.length > 26;

  return (
    <section className="watchPage">
      <aside className="episodeSidebar">
        <div className="episodeSidebarTop">
          <h2>Episode List</h2>
          <span>{episodes.length} Episodes</span>
        </div>
        {ranges.length > 0 && (
          <select value={rangeStart} onChange={(event) => setRangeStart(Number(event.target.value))}>
            {ranges.map((range) => (
              <option key={range.start} value={range.start}>{range.label}</option>
            ))}
          </select>
        )}
        <input value={episodeQuery} onChange={(event) => setEpisodeQuery(event.target.value)} placeholder="Search episodes" />
        <div className={`episodeListScroller ${compactEpisodes ? 'episodeBlocks' : 'sidebarEpisodes'}`}>
          {sideEpisodes.map((ep) => (
            <button
              key={ep.id}
              className={ep.number === episode.number ? 'active' : ''}
              onClick={() => navigate({ name: 'watch', id: item.id, episode: ep.number })}
            >
              {compactEpisodes ? (
                ep.number
              ) : (
                <>
                  <span>EP {ep.number}</span>
                  <strong>{ep.title}</strong>
                </>
              )}
            </button>
          ))}
        </div>
      </aside>
      <div className="playerColumn">
        <div className="playerShell">
          <HakariPlayer 
            sources={episode.sources}
            initialLanguage={initialLanguage}
            autoPlay={userPreferences.autoPlay}
            userPreferences={userPreferences}
            onProgress={(progress) => updateProgress({ animeId: item.id, episode: episode.number, progress, title: item.title })}
            onEnded={() => {
              if (userPreferences.autoNextEpisode && episode.number < episodes.length) {
                navigate({ name: 'watch', id: item.id, episode: episode.number + 1 });
              }
            }}
          />
        </div>
        <div className="watchHeader">
          <div>
            <p className="kicker">{displayTitle}</p>
            <h1>Episode {episode.number}: {episode.title}</h1>
          </div>
        </div>
        <div className="episodeNav">
          <button className="ghostButton" disabled={episode.number <= 1} onClick={() => navigate({ name: 'watch', id: item.id, episode: episode.number - 1 })}>
            <ChevronLeft size={17} /> Previous Episode
          </button>
          <button className="primaryButton" disabled={episode.number >= episodes.length} onClick={() => navigate({ name: 'watch', id: item.id, episode: episode.number + 1 })}>
            Next Episode <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
        <AnimeSection title="Recommended Anime" items={recommended} navigate={navigate} watchlist={watchlist} setWatchlistCategory={setWatchlistCategory} userPreferences={userPreferences} />
      </div>
    </section>
  );
}

function WatchlistPopup({ anime, current, setWatchlistCategory, onClose }) {
  if (!anime) return null;
  return (
    <div className="modalBackdrop">
      <div className="watchlistModal">
        <button className="iconButton closeModal" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <Poster anime={anime} small />
        <h2>{anime.title}</h2>
        <p>Choose one watchlist status.</p>
        <div className="watchlistChoices">
          {watchlistCategories.map((category) => (
            <button
              key={category}
              className={current === category ? 'active' : ''}
              onClick={() => {
                setWatchlistCategory(anime.id, category);
                onClose();
              }}
            >
              {current === category ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
              {category}
            </button>
          ))}
        </div>
        {current && (
          <button className="ghostButton compact" onClick={() => {
            setWatchlistCategory(anime.id, null);
            onClose();
          }}>
            <Trash2 size={15} /> Remove from Watchlist
          </button>
        )}
      </div>
    </div>
  );
}

function WatchlistPage({ anime, watchlist, navigate, setWatchlistCategory, openWatchlistModal, userPreferences }) {
  const [tab, setTab] = useState('Watching');
  const items = anime.filter((item) => watchlist[item.id] === tab);
  const counts = Object.fromEntries(watchlistCategories.map((category) => [
    category,
    Object.values(watchlist).filter((value) => value === category).length
  ]));
  return (
    <section className="pageShell">
      <div className="pageHeader">
        <p>Your Library</p>
        <h1>Watchlist</h1>
      </div>
      <div className="watchlistTabs">
        {watchlistCategories.map((category) => (
          <button key={category} className={tab === category ? 'active' : ''} onClick={() => setTab(category)}>
            {category} <span>{counts[category]}</span>
          </button>
        ))}
      </div>
      {items.length ? (
        <div className="watchlistGrid">
          {items.map((item) => (
            <HoverCard
              key={item.id}
              anime={item}
              navigate={navigate}
              className="watchlistHoverCard"
              watchlist={watchlist}
              setWatchlistCategory={setWatchlistCategory}
              mobileNavigateRoute={{ name: 'detail', id: item.id }}
            >
              <div className="watchlistItem">
                <Poster anime={item} small />
                <div>
                  <h3>{getPreferredAnimeTitle(item, userPreferences)}</h3>
                  <p>{watchlist[item.id]} • {item.status} • {item.episodes} episodes</p>
                </div>
                <button className="primaryButton compact" onClick={() => navigate({ name: 'watch', id: item.id, episode: 1 })}>
                  Continue Watching
                </button>
                <button className="miniIcon" onClick={() => openWatchlistModal(item.id)} aria-label="Change status">
                  <Bookmark size={17} />
                </button>
                <button className="miniIcon" onClick={() => setWatchlistCategory(item.id, null)} aria-label="Remove">
                  <Trash2 size={17} />
                </button>
              </div>
            </HoverCard>
          ))}
        </div>
      ) : (
        <div className="emptyWide">No anime in {tab} yet.</div>
      )}
    </section>
  );
}

function ProfilePage({
  user,
  setUser,
  watchlist,
  history,
  anime,
  navigate,
  notifications,
  setNotifications,
  removeHistoryItem,
  route,
  userPreferences
}) {
  const activeTab = normalizeProfileTab(route?.tab);
  const profile = user || {
    username: 'Guest Viewer',
    email: 'guest@hakari.local',
    avatar: '',
    joinDate: 'Today',
    verified: false,
    preferences: userPreferences
  };
  const watchlistItems = anime.filter((item) => watchlist[item.id]);
  const continueWatchingItems = history
    .map((entry) => ({ ...entry, anime: anime.find((item) => item.id === entry.animeId) }))
    .filter((entry) => entry.anime);
  const relatedNotifications = notifications
    .map((item) => ({ ...item, animeItem: getNotificationAnime(item, anime) }))
    .filter((item) => !watchlistItems.length || !item.animeItem || watchlist[item.animeItem.id]);
  const [draftName, setDraftName] = useState(profile.username);
  const [nameEditing, setNameEditing] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [continuePage, setContinuePage] = useState(1);
  const [watchlistPage, setWatchlistPage] = useState(1);
  const [notificationLimit, setNotificationLimit] = useState(8);
  const [settingsDraft, setSettingsDraft] = useState(userPreferences);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const watchlistCount = Object.keys(watchlist).length;

  useEffect(() => {
    setDraftName(profile.username);
  }, [profile.username]);

  useEffect(() => {
    setSettingsDraft(userPreferences);
  }, [userPreferences]);

  useEffect(() => {
    setContinuePage(1);
  }, [continueWatchingItems.length]);

  useEffect(() => {
    setWatchlistPage(1);
  }, [watchlistItems.length]);

  useEffect(() => {
    setNotificationLimit(8);
  }, [relatedNotifications.length]);

  useEffect(() => {
    if (!settingsSaved) return undefined;
    const timeout = window.setTimeout(() => setSettingsSaved(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [settingsSaved]);

  const commitUser = useCallback((updater) => {
    const base = normalizeUserProfile(user || {
      username: profile.username,
      email: profile.email,
      avatar: profile.avatar || '',
      joinDate: profile.joinDate || new Date().toLocaleDateString(),
      verified: profile.verified,
      provider: 'google',
      role: 'member',
      preferences: userPreferences
    });
    const next = typeof updater === 'function' ? updater(base) : { ...base, ...updater };
    setUser(normalizeUserProfile(next));
  }, [profile.avatar, profile.email, profile.joinDate, profile.username, profile.verified, setUser, user, userPreferences]);

  const saveName = () => {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    commitUser((current) => ({ ...current, username: trimmed }));
    setNameEditing(false);
  };

  const saveSettings = () => {
    commitUser((current) => ({ ...current, preferences: normalizeUserPreferences(settingsDraft) }));
    setSettingsSaved(true);
  };

  const handleLogout = () => {
    setLogoutConfirmOpen(false);
    setUser(null);
    navigate('home');
  };

  return (
    <section className="pageShell profilePage">
      <div className="profileDashboardHeader">
        <div>
          <p>User Dashboard</p>
          <h1>{profile.username}</h1>
        </div>
        <span>{profile.email}</span>
      </div>

      <div className="profileTabNav">
        {profileTabs.map(([id, label]) => (
          <button
            key={id}
            className={activeTab === id ? 'active' : ''}
            onClick={() => navigate({ name: 'profile', tab: id })}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="profileDashboardStage"
          initial={{ opacity: 0, y: 12, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === 'profile' && (
            <div className="profileDashboardPanel">
              <div className="profileIdentityCard">
                <div className="profileAvatarWrap">
                  <div className="profileAvatarLarge">
                    {profile.avatar ? <img src={profile.avatar} alt={profile.username} /> : <span>{getAvatarLabel(profile)}</span>}
                  </div>
                  <button className="profileAvatarEditButton" onClick={() => setAvatarPickerOpen(true)} aria-label="Choose profile avatar">
                    <Pencil size={14} />
                  </button>
                </div>

                <div className="profileNameBlock">
                  <div className="profileNameRow">
                    {nameEditing ? (
                      <>
                        <input value={draftName} onChange={(event) => setDraftName(event.target.value)} maxLength={40} />
                        <button className="primaryButton compact" onClick={saveName}>Save</button>
                      </>
                    ) : (
                      <>
                        <h2>{profile.username}</h2>
                        <button className="miniIcon profileInlineEdit" onClick={() => setNameEditing(true)} aria-label="Edit username">
                          <Pencil size={15} />
                        </button>
                      </>
                    )}
                  </div>
                  <p>{profile.email}</p>
                </div>
              </div>

              <div className="statsGrid profileStatsGrid">
                <Stat label="Join date" value={profile.joinDate || 'Today'} />
                <Stat label="Email status" value={profile.verified ? 'Verified' : 'Pending'} />
                <Stat label="Watchlist" value={watchlistCount} />
                <Stat label="Continue Watching" value={continueWatchingItems.length} />
              </div>

              <div className="profileLogoutRow">
                <button className="ghostButton profileLogoutButton" onClick={() => setLogoutConfirmOpen(true)}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}

          {activeTab === 'continue-watching' && (
            <ProfileMediaSection
              title="Continue Watching"
              description="Pick up right where you left off."
              items={continueWatchingItems}
              page={continuePage}
              pageSize={21}
              emptyMessage="You have not started any anime yet."
              gridClassName="profileMediaGrid continueWatchingDashboardGrid"
              setPage={setContinuePage}
              renderItem={(entry) => (
                <ProfileMediaCard
                  key={entry.anime.id}
                  anime={entry.anime}
                  title={getPreferredAnimeTitle(entry.anime, userPreferences)}
                  subtitle={`Episode ${entry.episode} • ${Math.round(entry.progress || 0)}% watched`}
                  watchlist={watchlist}
                  navigate={navigate}
                  onOpen={() => navigate({ name: 'watch', id: entry.anime.id, episode: entry.episode })}
                  onRemove={() => removeHistoryItem(entry.anime.id)}
                  removeLabel="Remove from Continue Watching"
                />
              )}
            />
          )}

          {activeTab === 'watchlist' && (
            <ProfileMediaSection
              title="Watchlist"
              description="Your saved anime collection, organized for quick access."
              items={watchlistItems}
              page={watchlistPage}
              pageSize={28}
              emptyMessage="Your watchlist is currently empty."
              gridClassName="profileMediaGrid watchlistDashboardGrid"
              setPage={setWatchlistPage}
              renderItem={(item) => (
                <ProfileMediaCard
                  key={item.id}
                  anime={item}
                  title={getPreferredAnimeTitle(item, userPreferences)}
                  subtitle={`${watchlist[item.id]} • ${item.type} • ${item.episodes} episodes`}
                  watchlist={watchlist}
                  navigate={navigate}
                  onOpen={() => navigate({ name: 'detail', id: item.id })}
                />
              )}
            />
          )}

          {activeTab === 'notification' && (
            <div className="profileDashboardPanel">
              <div className="profileSectionIntro">
                <div>
                  <p>Watchlist Updates</p>
                  <h2>Notification</h2>
                </div>
                <div className="profileSectionActions">
                  <button className="ghostButton compact" onClick={() => setNotifications([])} disabled={!relatedNotifications.length}>
                    Clear All
                  </button>
                </div>
              </div>

              {relatedNotifications.length ? (
                <>
                  <div className={`profileNotificationList ${notificationLimit > 8 ? 'scrollable' : ''}`}>
                    {relatedNotifications.slice(0, notificationLimit).map((item) => {
                      const animeName = item.animeItem ? getPreferredAnimeTitle(item.animeItem, userPreferences) : 'Hakari';
                      return (
                        <motion.div
                          key={item.id}
                          className={`profileNotificationRow ${item.unread ? 'unread' : ''}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <div>
                            <span>{item.type || 'Update'}</span>
                            <h3>{animeName}</h3>
                            <p>{item.message || item.title}</p>
                          </div>
                          <small>{item.time || 'Just now'}</small>
                        </motion.div>
                      );
                    })}
                  </div>
                  {notificationLimit < relatedNotifications.length && (
                    <div className="profileLoadMoreRow">
                      <button className="primaryButton compact" onClick={() => setNotificationLimit((value) => value + 8)}>
                        See More
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="emptyWide">No notification updates yet.</div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="profileDashboardPanel">
              <div className="profileSectionIntro">
                <div>
                  <p>Playback & Preference</p>
                  <h2>Settings</h2>
                </div>
                {settingsSaved && <div className="profileSavedBadge"><Check size={14} /> Updated</div>}
              </div>

              <div className="profileSettingsList">
                <ProfileSettingRow
                  label="Show Continue Watching on Home Page"
                  control={(
                    <TogglePill
                      checked={settingsDraft.showContinueWatchingOnHome}
                      onToggle={() => setSettingsDraft((current) => ({ ...current, showContinueWatchingOnHome: !current.showContinueWatchingOnHome }))}
                    />
                  )}
                />
                <ProfileSettingRow
                  label="Language for Anime Name"
                  control={(
                    <ChoicePills
                      value={settingsDraft.animeNameLanguage}
                      options={['English', 'Japanese']}
                      onChange={(value) => setSettingsDraft((current) => ({ ...current, animeNameLanguage: value }))}
                    />
                  )}
                />
                <ProfileSettingRow
                  label="Auto Select Language"
                  description="The system will automatically select your preferred source type if available."
                  control={(
                    <ChoicePills
                      value={settingsDraft.autoSelectLanguage}
                      options={['Sub & Dub', 'Only Sub', 'Only Dub']}
                      onChange={(value) => setSettingsDraft((current) => ({ ...current, autoSelectLanguage: value }))}
                    />
                  )}
                />
                <ProfileSettingRow
                  label="Auto Play"
                  control={(
                    <TogglePill
                      checked={settingsDraft.autoPlay}
                      onToggle={() => setSettingsDraft((current) => ({ ...current, autoPlay: !current.autoPlay }))}
                    />
                  )}
                />
                <ProfileSettingRow
                  label="Auto Next Episode"
                  control={(
                    <TogglePill
                      checked={settingsDraft.autoNextEpisode}
                      onToggle={() => setSettingsDraft((current) => ({ ...current, autoNextEpisode: !current.autoNextEpisode }))}
                    />
                  )}
                />
                <ProfileSettingRow
                  label="Auto Load Comments"
                  control={(
                    <TogglePill
                      checked={settingsDraft.autoLoadComments}
                      onToggle={() => setSettingsDraft((current) => ({ ...current, autoLoadComments: !current.autoLoadComments }))}
                    />
                  )}
                />
                <ProfileSettingRow
                  label="Skip Seconds"
                  description="Number of seconds to skip backward or forward when pressing J or L on the watch page."
                  control={(
                    <label className="skipSecondsInput">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={settingsDraft.skipSeconds}
                        onChange={(event) => setSettingsDraft((current) => ({ ...current, skipSeconds: clamp(Number.parseInt(event.target.value, 10) || 1, 1, 120) }))}
                      />
                      <span>seconds</span>
                    </label>
                  )}
                />
                <ProfileSettingRow
                  label="Auto Skip Intro / Outro"
                  description="The skip time is contributed by the community, so it may not be available or accurate for every episode."
                  control={(
                    <TogglePill
                      checked={settingsDraft.autoSkipIntroOutro}
                      onToggle={() => setSettingsDraft((current) => ({ ...current, autoSkipIntroOutro: !current.autoSkipIntroOutro }))}
                    />
                  )}
                />
              </div>

              <div className="profileUpdateRow">
                <button className="primaryButton profileUpdateButton" onClick={saveSettings}>
                  Update
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {avatarPickerOpen && (
          <div className="modalBackdrop">
            <motion.div
              className="watchlistModal profileAvatarModal"
              initial={{ opacity: 0, y: 14, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <button className="iconButton closeModal" onClick={() => setAvatarPickerOpen(false)} aria-label="Close avatar selector">
                <X size={18} />
              </button>
              <h2>Choose Your Avatar</h2>
              <p>Select from anime-style profile avatars.</p>
              <div className="profileAvatarGrid">
                {animeAvatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    className={`profileAvatarChoice ${profile.avatar === avatar.src ? 'active' : ''}`}
                    onClick={() => {
                      commitUser((current) => ({ ...current, avatar: avatar.src }));
                      setAvatarPickerOpen(false);
                    }}
                  >
                    <img src={avatar.src} alt={avatar.label} />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {logoutConfirmOpen && (
          <div className="modalBackdrop">
            <motion.div
              className="watchlistModal profileConfirmModal"
              initial={{ opacity: 0, y: 14, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2>Do you want to logout?</h2>
              <div className="profileConfirmActions">
                <button className="ghostButton compact" onClick={() => setLogoutConfirmOpen(false)}>No</button>
                <button className="primaryButton compact" onClick={handleLogout}>Yes</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ProfileMediaSection({ title, description, items, page, pageSize, emptyMessage, gridClassName, setPage, renderItem }) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = clamp(page, 1, totalPages);
  const visibleItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="profileDashboardPanel">
      <div className="profileSectionIntro">
        <div>
          <p>User Library</p>
          <h2>{title}</h2>
        </div>
        <span>{items.length} anime</span>
      </div>
      <p className="profileSectionCopy">{description}</p>

      {items.length ? (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${title}-${currentPage}`}
              className={gridClassName}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {visibleItems.map(renderItem)}
            </motion.div>
          </AnimatePresence>
          {totalPages > 1 && (
            <div className="profilePagination">
              <button className="ghostButton compact" onClick={() => setPage(1)} disabled={currentPage === 1}>First page</button>
              <button className="ghostButton compact" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>Previous page</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button className="ghostButton compact" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages}>Next page</button>
              <button className="ghostButton compact" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>Last page</button>
            </div>
          )}
        </>
      ) : (
        <div className="emptyWide">{emptyMessage}</div>
      )}
    </div>
  );
}

function ProfileMediaCard({ anime, title, subtitle, watchlist, navigate, onOpen, onRemove, removeLabel }) {
  return (
    <HoverCard
      anime={anime}
      navigate={navigate}
      className="profileMediaHoverCard"
      watchlist={watchlist}
      mobileNavigateRoute={{ name: 'detail', id: anime.id }}
    >
      <div className="profileMediaCard">
        {onRemove && (
          <button
            className="profileRemoveButton"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRemove();
            }}
            aria-label={removeLabel}
          >
            <X size={14} />
          </button>
        )}
        <button className="profileMediaPosterButton" onClick={onOpen} aria-label={`Open ${title}`}>
          <Poster anime={anime} />
        </button>
        <div className="profileMediaBody">
          <button className="titleButton" onClick={onOpen}>{title}</button>
          <p>{subtitle}</p>
        </div>
      </div>
    </HoverCard>
  );
}

function ProfileSettingRow({ label, description, control }) {
  return (
    <div className="profileSettingCard">
      <div>
        <h3>{label}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="profileSettingControl">{control}</div>
    </div>
  );
}

function TogglePill({ checked, onToggle }) {
  return (
    <button className={`togglePill ${checked ? 'on' : ''}`} onClick={onToggle} aria-pressed={checked}>
      <span />
      {checked ? 'ON' : 'OFF'}
    </button>
  );
}

function ChoicePills({ value, options, onChange }) {
  return (
    <div className="choicePills">
      {options.map((option) => (
        <button key={option} className={value === option ? 'active' : ''} onClick={() => onChange(option)}>
          {option}
        </button>
      ))}
    </div>
  );
}

function AdminPage({ anime, setAnime, user, siteSettings, setSiteSettings, searchAnalytics, setSearchAnalytics }) {
  const [tab, setTab] = useState('dashboard');
  const totalEpisodes = anime.reduce((sum, item) => sum + item.episodes, 0);
  const views = anime.reduce((sum, item) => sum + item.views, 0);
  const tabs = [
    ['dashboard', LayoutDashboard, 'Dashboard'],
    ['anime', Clapperboard, 'Anime Management'],
    ['episodes', Play, 'Episode Management'],
    ['topSearches', Search, 'Top Searches'],
    ['sidebar', Menu, 'Sidebar Categories'],
    ['genres', Sparkles, 'Genre Visibility'],
    ['types', Clapperboard, 'Type Visibility'],
    ['builder', Home, 'Homepage Sections'],
    ['analytics', BarChart3, 'Search Analytics'],
    ['users', Users, 'User Management'],
    ['announcements', Bell, 'Announcements'],
    ['settings', Settings, 'Settings']
  ];

  return (
    <section className="adminPage">
      <aside className="adminSidebar">
        <strong>Hakari Admin</strong>
        {tabs.map(([id, Icon, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            <Icon size={17} /> {label}
          </button>
        ))}
      </aside>
      <div className="adminContent">
        <div className="adminTop">
          <div>
            <p>{user?.role === 'admin' ? 'Administrator' : 'Demo administrator'}</p>
            <h1>{tabs.find(([id]) => id === tab)?.[2]}</h1>
          </div>
          <button className="primaryButton compact"><Upload size={16} /> Save Changes</button>
        </div>
        {tab === 'dashboard' && (
          <>
            <div className="statsGrid">
              <Stat label="Total Anime" value={anime.length} />
              <Stat label="Total Episodes" value={totalEpisodes} />
              <Stat label="Total Users" value="18.4K" />
              <Stat label="Tracked Searches" value={Object.values(searchAnalytics).reduce((sum, value) => sum + Number(value || 0), 0)} />
              <Stat label="Total Views" value={formatViews(views)} />
              <Stat label="Total Watchlists" value="4.8K" />
            </div>
            <div className="adminGrid">
              <ChartCard title="Daily Views" values={[32, 58, 48, 75, 63, 89, 96]} />
              <ChartCard title="Monthly Views" values={[42, 55, 62, 70, 84, 92]} />
              <ChartCard title="User Growth" values={[20, 28, 46, 51, 70, 88]} />
            </div>
            <AdminTable title="Recent Activity" rows={anime.slice(0, 5).map((item) => [item.title, item.status, `${item.episodes} eps`])} />
          </>
        )}
        {tab === 'anime' && <AnimeManager anime={anime} setAnime={setAnime} />}
        {tab === 'episodes' && <EpisodeManager anime={anime} />}
        {tab === 'topSearches' && <TopSearchControls anime={anime} searchAnalytics={searchAnalytics} setSearchAnalytics={setSearchAnalytics} />}
        {tab === 'sidebar' && <VisibilityControls title="Sidebar Categories" entries={sidebarCategories} values={siteSettings.sidebar || {}} onChange={(next) => setSiteSettings((settings) => ({ ...settings, sidebar: next }))} />}
        {tab === 'genres' && <VisibilityControls title="Genre Visibility" entries={getVisibleGenres(anime, { ...siteSettings, genres: genres.reduce((all, genre) => ({ ...all, [genre]: true }), {}) })} values={siteSettings.genres || {}} onChange={(next) => setSiteSettings((settings) => ({ ...settings, genres: next }))} />}
        {tab === 'types' && <VisibilityControls title="Type Visibility" entries={getVisibleTypes(anime, { ...siteSettings, types: animeTypes.reduce((all, type) => ({ ...all, [type]: true }), {}) })} values={siteSettings.types || {}} onChange={(next) => setSiteSettings((settings) => ({ ...settings, types: next }))} />}
        {tab === 'builder' && <HomepageSectionControls settings={siteSettings} setSiteSettings={setSiteSettings} />}
        {tab === 'analytics' && <TopSearchControls anime={anime} searchAnalytics={searchAnalytics} setSearchAnalytics={setSearchAnalytics} analyticsOnly />}
        {tab === 'users' && <AdminTable title="Users" rows={[['Jun', 'jun@hakari.local', 'Moderator'], ['Mika', 'mika@hakari.local', 'Active'], ['Ren', 'ren@hakari.local', 'Banned']]} />}
        {['announcements', 'settings'].includes(tab) && <SettingsPanel tab={tab} />}
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ChartCard({ title, values }) {
  return (
    <div className="chartCard">
      <h3>{title}</h3>
      <div className="bars">
        {values.map((value, index) => (
          <span key={index} style={{ height: `${value}%` }} />
        ))}
      </div>
    </div>
  );
}

function AdminTable({ title, rows }) {
  return (
    <div className="adminTable">
      <h3>{title}</h3>
      {(rows.length ? rows : [['No entries yet', 'Awaiting activity', 'Ready']]).map((row, index) => (
        <div key={index}>
          {row.map((cell) => (
            <span key={cell}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

function AnimeManager({ anime, setAnime }) {
  const [draft, setDraft] = useState(seedAnime[0]);
  const save = () => {
    setAnime((items) =>
      items.some((item) => item.id === draft.id)
        ? items.map((item) => (item.id === draft.id ? draft : item))
        : [{ ...draft, id: draft.title.toLowerCase().replace(/\W+/g, '-') }, ...items]
    );
  };
  return (
    <div className="managerGrid">
      <div className="formPanel">
        {['title', 'japanese', 'english', 'studio', 'duration', 'year', 'rating', 'type', 'status', 'image', 'updatedAt', 'addedAt'].map((field) => (
          <label key={field}>
            {field === 'image' ? 'Artwork Image URL' : field}
            <input value={draft[field] ?? ''} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} />
          </label>
        ))}
        <label>
          Audio Availability
          <select
            value={getAudioLabel(draft)}
            onChange={(event) => {
              const value = event.target.value;
              setDraft({
                ...draft,
                audio: value === 'SUB + DUB' ? ['sub', 'dub'] : value === 'DUB' ? ['dub'] : ['sub']
              });
            }}
          >
            <option>SUB</option>
            <option>DUB</option>
            <option>SUB + DUB</option>
          </select>
        </label>
        <label>
          Description
          <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        </label>
        <button className="primaryButton" onClick={save}>
          <Plus size={17} /> Add / Update Anime
        </button>
      </div>
      <AdminTable title="Anime Records" rows={anime.map((item) => [item.title, item.type, item.status])} />
    </div>
  );
}

function EpisodeManager({ anime }) {
  return (
    <div className="managerGrid">
      <div className="formPanel">
        <label>Anime<select>{anime.map((item) => <option key={item.id}>{item.title}</option>)}</select></label>
        <label>Episode Number<input defaultValue="1" /></label>
        <label>Episode Title<input defaultValue="The First Signal" /></label>
        <label>Episode Thumbnail<input defaultValue="/assets/hakari-hero.png" /></label>
        <label>Episode Description<textarea defaultValue="Episode description" /></label>
        <label>SUB Video URL<input defaultValue={sampleSources.sub} /></label>
        <label>ENGLISH DUB Video URL<input defaultValue={sampleSources.dub} /></label>
        <label>HINDI DUB Video URL<input defaultValue={sampleSources.hindi} /></label>
      </div>
      <AdminTable title="Episode Records" rows={anime.slice(0, 6).map((item) => [item.title, `${item.episodes} episodes`, '3 languages'])} />
    </div>
  );
}

function SimpleManager({ title, items }) {
  return (
    <div className="managerGrid">
      <div className="formPanel">
        <label>{title} Name<input placeholder={`Add ${title.toLowerCase()}`} /></label>
        <button className="primaryButton"><Plus size={17} /> Add {title}</button>
      </div>
      <AdminTable title={title} rows={items.map((item) => [item, 'Active', 'Editable'])} />
    </div>
  );
}

function HomepageBuilder({ anime, setAnime }) {
  const move = (from, to) => {
    setAnime((items) => {
      const copy = [...items];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };
  return (
    <div className="builderList">
      {anime.map((item, index) => (
        <div key={item.id} draggable>
          <span>{index + 1}</span>
          <strong>{item.title}</strong>
          <small>{item.tags.join(', ')}</small>
          <button disabled={index === 0} onClick={() => move(index, index - 1)}>Up</button>
          <button disabled={index === anime.length - 1} onClick={() => move(index, index + 1)}>Down</button>
        </div>
      ))}
    </div>
  );
}

function TopSearchControls({ anime, searchAnalytics, setSearchAnalytics, analyticsOnly = false }) {
  const rows = getTopSearches(anime, searchAnalytics, anime.length);
  const updateCount = (id, value) => {
    setSearchAnalytics((items) => ({ ...items, [id]: Math.max(0, Number(value) || 0) }));
  };

  return (
    <div className="managerGrid">
      <div className="formPanel">
        <h3>{analyticsOnly ? 'Search Analytics' : 'Top Searches'}</h3>
        <p className="mutedText">Counts control the popular search ordering used across Hakari.</p>
        <button className="ghostButton compact" onClick={() => setSearchAnalytics(defaultSearchAnalytics)}>
          Reset Analytics
        </button>
      </div>
      <div className="adminControlList">
        {rows.map((item, index) => (
          <label key={item.id} className="controlRow">
            <span>{index + 1}</span>
            <strong>{item.title}</strong>
            <input
              type="number"
              min="0"
              value={Number(searchAnalytics[item.id] || 0)}
              onChange={(event) => updateCount(item.id, event.target.value)}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function VisibilityControls({ title, entries, values, onChange }) {
  const update = (entry) => {
    onChange({ ...values, [entry]: values[entry] === false });
  };

  return (
    <div className="settingsPanel visibilityPanel">
      <h3>{title}</h3>
      {entries.map((entry) => (
        <label key={entry}>
          <input
            type="checkbox"
            checked={values[entry] !== false}
            onChange={() => update(entry)}
          />
          {entry}
        </label>
      ))}
    </div>
  );
}

function HomepageSectionControls({ settings, setSiteSettings }) {
  const labels = {
    featured: 'Featured Anime',
    trending: 'Trending Anime',
    topAiring: 'Top Airing',
    latestEpisodes: 'Latest Episodes',
    mostPopular: 'Most Popular',
    recentlyAdded: 'Recently Added'
  };
  const values = settings.homepageSections || defaultSiteSettings.homepageSections;
  const update = (key) => {
    setSiteSettings((current) => ({
      ...current,
      homepageSections: { ...values, [key]: values[key] === false }
    }));
  };

  return (
    <div className="settingsPanel visibilityPanel">
      <h3>Homepage Sections</h3>
      {Object.entries(labels).map(([key, label]) => (
        <label key={key}>
          <input type="checkbox" checked={values[key] !== false} onChange={() => update(key)} />
          {label}
        </label>
      ))}
    </div>
  );
}

function SettingsPanel({ tab }) {
  return (
    <div className="settingsPanel">
      <label><input type="checkbox" defaultChecked /> Enable new episode notifications</label>
      <label><input type="checkbox" /> Maintenance mode</label>
      <textarea defaultValue={`${tab} notes and configuration`} />
    </div>
  );
}

function SettingsPage() {
  return (
    <section className="pageShell">
      <div className="pageHeader">
        <p>Hakari Controls</p>
        <h1>Settings</h1>
      </div>
      <SettingsPanel tab="settings" />
    </section>
  );
}

function AuthModal({ setUser, onClose }) {
  const [loading, setLoading] = useState(false);
  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      const joinDate = new Date().toLocaleDateString();
      setUser({
        username: 'Google Viewer',
        email: 'viewer@gmail.com',
        avatar: '',
        joinDate,
        verified: true,
        provider: 'google',
        role: 'member',
        preferences: defaultUserPreferences
      });
      onClose();
    }, 420);
  };
  return (
    <div className="modalBackdrop">
      <div className="authModal googleOnly">
        <button className="iconButton closeModal" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h2>Login to Hakari</h2>
        <p>Continue with your Google account. New accounts are created automatically.</p>
        <button className="googleButton" onClick={submit} disabled={loading}>
          <span>G</span>{loading ? 'Opening Google...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
}

function Footer({ navigate }) {
  return (
    <footer className="footer">
      <BrandLogo onClick={() => navigate('home')} />
      <p>Premium anime discovery, watchlists, notifications, and admin controls in one modern streaming experience.</p>
      <div>
        <button onClick={() => navigate('watchlist')}>Watchlist</button>
        <button onClick={() => navigate('profile')}>Profile</button>
        <button onClick={() => navigate('admin')}>Admin</button>
      </div>
    </footer>
  );
}

createRoot(document.getElementById('root')).render(<App />);

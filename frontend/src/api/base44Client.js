// Local stub replacing @base44/sdk so the frontend runs standalone.
// MiniGames are persisted in localStorage; LLM calls are placeholders.

const FAKE_USER = {
  id: 'local-user',
  email: 'you@localhost',
  full_name: 'Local User',
  role: 'admin',
};

const STORAGE_KEY = 'wizmath.miniGames';

const readGames = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeGames = (games) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
};

export const base44 = {
  auth: {
    me: async () => FAKE_USER,
    logout: () => {},
    redirectToLogin: () => {},
  },
  entities: {
    MiniGame: {
      list: async (sort = '-created_date', limit = 50) => {
        const games = readGames();
        const key = sort.startsWith('-') ? sort.slice(1) : sort;
        const direction = sort.startsWith('-') ? -1 : 1;
        const sorted = [...games].sort(
          (a, b) => ((a[key] || 0) - (b[key] || 0)) * direction
        );
        return sorted.slice(0, limit);
      },
      create: async (payload) => {
        const games = readGames();
        const newGame = {
          id: crypto.randomUUID(),
          created_date: Date.now(),
          ...payload,
        };
        writeGames([newGame, ...games]);
        return newGame;
      },
      delete: async (id) => {
        const games = readGames();
        writeGames(games.filter((g) => g.id !== id));
        return { success: true };
      },
    },
  },
  integrations: {
    Core: {
      InvokeLLM: async ({ response_json_schema } = {}) => {
        console.warn('[base44 stub] InvokeLLM is not wired up. Returning a placeholder.');
        if (!response_json_schema) {
          return 'LLM is not connected. Wire this to your backend (e.g. POST http://localhost:3000/api/generate).';
        }
        return {};
      },
    },
  },
};

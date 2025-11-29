# PocketLLM Frontend

A production-grade React 18.2 frontend for PocketLLM Portal - local LLM inference with document processing and RAG capabilities.

## 🎨 Design Philosophy

**Technical Precision Aesthetic** - Dark terminal-inspired interface with neon accents, glass morphism, and smooth animations. Built with attention to performance and user experience.

## 🚀 Features

- ✅ **Real-time Streaming Chat** - Token-by-token LLM responses via WebSocket
- ✅ **Document Processing** - Upload and query documents with RAG
- ✅ **Session Management** - Browse and resume conversations
- ✅ **Admin Dashboard** - System monitoring and user management
- ✅ **Role-Based Access Control** - Guest / Developer / Admin roles
- ✅ **Dark/Light Theme** - Persistent theme switching
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **TypeScript Ready** - Add `.ts`/`.tsx` extensions when needed

## 📁 Project Structure

```
pocketllm-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.jsx
│   │   ├── Layout.jsx
│   │   ├── Layout.css
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── WebSocketContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/
│   │   ├── ChatPage.jsx
│   │   ├── ChatPage.css
│   │   ├── DocumentsPage.jsx
│   │   ├── HistoryPage.jsx
│   │   ├── AdminPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── LoginPage.css
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## 🛠️ Tech Stack

- **React 18.2** - UI framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **WebSocket API** - Real-time streaming
- **Context API** - State management
- **Vite** - Build tool
- **JetBrains Mono** - Monospace font

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

### Backend Integration

The Vite dev server proxies API requests to avoid CORS issues:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:8000',
    '/ws': { target: 'ws://localhost:8000', ws: true }
  }
}
```

## 🎯 Architecture Overview

### Context Providers (Global State)

1. **AuthContext** - Authentication state, login/logout, role checking
2. **WebSocketContext** - WebSocket connection, streaming messages
3. **ThemeContext** - Theme management (dark/light mode)

### Custom Hooks

- `useAuth()` - Access authentication state
- `useWebSocket()` - Send/receive WebSocket messages
- `useTheme()` - Toggle theme

### Component Hierarchy

```
App
└── AuthProvider
    └── WebSocketProvider
        └── ThemeProvider
            └── Router
                └── Layout
                    ├── ChatPage
                    ├── DocumentsPage
                    ├── HistoryPage
                    └── AdminPage (RBAC: Admin only)
```

## 🔐 Authentication Flow

1. User logs in via `/login`
2. JWT token stored in `sessionStorage`
3. Axios default header set with Bearer token
4. ProtectedRoute checks authentication
5. Automatic redirect to login if unauthenticated

## 🌊 WebSocket Streaming Flow

1. Component subscribes to WebSocket messages
2. User sends prompt → `sendMessage()` via WebSocketContext
3. Backend streams tokens → `onmessage` event
4. State updates trigger re-renders (Virtual DOM optimization)
5. Only MessageList component re-renders (not entire page)
6. Cleanup function closes WebSocket on unmount

## 🎨 Styling System

### CSS Variables

```css
:root {
  --bg-primary: #0a0e1a;
  --text-primary: #e0e6f1;
  --accent-primary: #00ff9f;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Theme Switching

```javascript
const { theme, toggleTheme } = useTheme();
// Changes data-theme attribute on <html>
```

## 🧪 Testing Locally

### Mock Backend Response

For development without backend, modify WebSocketContext:

```javascript
// Simulate streaming response
const mockStream = () => {
  const tokens = "Hello! This is a mock response.".split(' ');
  tokens.forEach((token, i) => {
    setTimeout(() => {
      // Trigger token handler
    }, i * 100);
  });
};
```

## 📱 Responsive Design

- **Desktop** (>768px): Full sidebar navigation
- **Mobile** (<768px): Collapsible sidebar, optimized touch targets

## ⚡ Performance Optimizations

- Virtual DOM - Only changed components re-render
- WebSocket connection reuse - Single instance shared via Context
- Lazy loading - Split code by route (TODO)
- Memoization - Prevent unnecessary re-renders (TODO with React.memo)

## 🚧 Incomplete Features (To Implement)

You'll need to create these pages based on your architecture:

1. **DocumentsPage.jsx** - Document upload with progress tracking
2. **HistoryPage.jsx** - Session browser with search
3. **AdminPage.jsx** - Metrics dashboard, user management

## 🔨 Development Tips

### Adding a New Page

1. Create `src/pages/NewPage.jsx`
2. Add route in `App.jsx`
3. Add navigation link in `Layout.jsx`
4. Add ProtectedRoute if needed

### Debugging WebSocket

```javascript
// In WebSocketContext.jsx
ws.onmessage = (event) => {
  console.log('WS Message:', event.data); // Debug here
};
```

### Testing Different Roles

```javascript
// Mock different users
const mockUsers = {
  guest: { username: 'guest', role: 'GUEST' },
  developer: { username: 'dev', role: 'DEVELOPER' },
  admin: { username: 'admin', role: 'ADMIN' }
};
```

## 📚 Dependencies

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2",
  "vite": "^5.0.0"
}
```

## 🎓 Learning Resources

- [React Docs](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 📄 License

MIT - See LICENSE file

## 🤝 Contributing

This is a student assignment project. Contributions welcome for educational purposes.

---

**Built with ❤️ for CSCI 578 - Software Architecture**

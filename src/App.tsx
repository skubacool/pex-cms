import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, TABLES, WEBSITE_URL } from './config';
import Login from './Login';
import CollectionEditor from './CollectionEditor';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(TABLES[0].name);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return <div className="splash">Loading…</div>;
  if (!session) return <Login />;

  const cfg = TABLES.find((t) => t.name === active) ?? TABLES[0];

  return (
    <div className="app">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="login-bolt">⚡</span>
          <div>
            <strong>Power Express</strong>
            <small>Content Manager</small>
          </div>
        </div>
        <nav>
          {TABLES.map((t) => (
            <button
              key={t.name}
              className={`nav-item ${t.name === active ? 'active' : ''}`}
              onClick={() => {
                setActive(t.name);
                setMenuOpen(false);
              }}
            >
              <span className="nav-emoji">{t.emoji}</span>
              {t.title}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <a href={WEBSITE_URL} target="_blank" rel="noreferrer" className="nav-item">
            <span className="nav-emoji">🌐</span>Open website
          </a>
          <div className="sidebar-user" title={session.user.email ?? ''}>
            {session.user.email}
          </div>
          <button
            className="nav-item signout"
            onClick={() => supabase.auth.signOut()}
          >
            <span className="nav-emoji">🚪</span>Sign out · ออกจากระบบ
          </button>
        </div>
      </aside>
      <main className="main">
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰ Menu
        </button>
        <CollectionEditor key={cfg.name} cfg={cfg} />
      </main>
    </div>
  );
}

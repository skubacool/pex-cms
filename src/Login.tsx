import { FormEvent, useState } from 'react';
import { supabase } from './config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError(
        'Sign-in failed — please check your email and password. / เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน'
      );
      setBusy(false);
    }
    // On success the auth listener in App.tsx switches to the manager.
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">
          <span className="login-bolt">⚡</span>
          <h1>Power Express</h1>
          <p>Content Manager · ระบบจัดการเนื้อหาเว็บไซต์</p>
        </div>
        <label>
          Email · อีเมล
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />
        </label>
        <label>
          Password · รหัสผ่าน
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in · เข้าสู่ระบบ'}
        </button>
        <p className="login-note">
          Accounts are created by the administrator.
          <br />
          บัญชีผู้ใช้สร้างโดยผู้ดูแลระบบเท่านั้น
        </p>
      </form>
    </div>
  );
}

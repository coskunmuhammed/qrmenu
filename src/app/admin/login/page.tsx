'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/admin.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) {
          router.push('/admin');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Giriş yapılamadı.');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={`${styles.loginCard} glass`}>
        <div style={{ maxWidth: '240px', margin: '0 auto 16px auto' }}>
          <svg viewBox="0 0 300 110" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              .brand-dior-login {
                font-family: 'Playfair Display', 'Cormorant Garamond', 'Times New Roman', serif;
                font-size: 54px;
                fill: #1D1D1D;
                letter-spacing: 5px;
              }
              .brand-sub-login {
                font-family: 'Inter', 'Manrope', sans-serif;
                font-size: 11px;
                fill: #6D6D6D;
                letter-spacing: 5px;
                font-weight: 500;
              }
              .wave-line-login {
                stroke: #1D1D1D;
                stroke-width: 1.8;
                fill: none;
                stroke-linecap: round;
              }
            `}</style>
            <g transform="translate(150, 50)" textAnchor="middle">
              <text x="-48" y="5" className="brand-dior-login" textAnchor="middle">DI</text>
              <g transform="translate(0, -12)">
                <circle cx="0" cy="0" r="23" stroke="#1D1D1D" strokeWidth="4.5" fill="none" />
                <path d="M-15,4 Q-7,0 0,4 T15,4" className="wave-line-login" />
                <path d="M-13,-2 Q-6.5,-5 0,-2 T13,-2" className="wave-line-login" />
              </g>
              <text x="48" y="5" className="brand-dior-login" textAnchor="middle">R</text>
              <text x="0" y="38" className="brand-sub-login" textAnchor="middle">BEACH CLUB</text>
              <line x1="-105" y1="34" x2="-62" y2="34" stroke="#6D6D6D" strokeWidth="0.8" />
              <line x1="62" y1="34" x2="105" y2="34" stroke="#6D6D6D" strokeWidth="0.8" />
            </g>
          </svg>
        </div>
        <p className={styles.loginSubtitle} style={{ marginTop: '0' }}>Yönetici Giriş Paneli</p>
        
        {error && <div className={styles.loginError}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.loginFormGroup}>
            <label className={styles.loginLabel}>Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.loginInput}
              placeholder="admin"
              disabled={loading}
            />
          </div>

          <div className={styles.loginFormGroup}>
            <label className={styles.loginLabel}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.loginInput}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Giriş Yapılıyor...' : 'GİRİŞ YAP'}
          </button>
        </form>
      </div>
    </div>
  );
}

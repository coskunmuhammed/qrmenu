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
        <h1 className={`${styles.loginTitle} text-gold`}>CRYSTAL CLUB</h1>
        <p className={styles.loginSubtitle}>Yönetici Giriş Paneli</p>
        
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

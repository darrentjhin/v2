/**
 * Root App component for AI Live Tutor.
 *
 * - Header with logo, language selector, and profile button.
 * - Language selector translates all page UI (but NOT the session box).
 * - Profile panel with mock login (Google, Facebook, phone, email).
 */

import { useState } from 'react';
import TutorInterface from './components/TutorInterface';
import translations from './translations';

const LANGUAGES = Object.entries(translations).map(([code, t]) => ({
  code,
  name: t.name,
  flag: t.flag,
}));

function App() {
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [lang, setLang] = useState('en');

  // Shorthand to get a translation string for the current language
  const t = translations[lang];

  const handleLogin = async (provider, extraData = {}) => {
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, ...extraData }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || t.loginFailed);
        return;
      }
      setUser(data.user);
    } catch (err) {
      console.error('Login error:', err);
      setAuthError(t.serverError);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => setUser(null);

  return (
    <div className="app">
      <div className="app-shell">
        <header className="app-header">
          <img src="/logo.png" alt="Leren" className="app-logo" />

          <div className="header-right">
            {/* Language selector */}
            <div className="lang-selector-wrap">
              <select
                className="lang-selector"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                aria-label="Select language"
              >
                {LANGUAGES.map(({ code, name, flag }) => (
                  <option key={code} value={code}>
                    {flag} {name}
                  </option>
                ))}
              </select>
              <span className="lang-arrow" aria-hidden>▾</span>
            </div>

            {/* Profile button */}
            <button
              type="button"
              className="profile-button"
              onClick={() => setIsProfileOpen((open) => !open)}
              aria-label={t.openProfile}
            >
              <svg className="profile-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </button>
          </div>
        </header>

        <main className="app-main">
          <TutorInterface />
        </main>

        {isProfileOpen && (
          <div className="profile-overlay" onClick={() => setIsProfileOpen(false)}>
            <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
              {user ? (
                <>
                  <h2>{t.profile}</h2>
                  <p className="profile-subtitle">
                    {t.loggedInWith} <strong>{user.providerLabel}</strong>
                  </p>
                  <div className="profile-info">
                    <p><strong>{t.name_label}:</strong> {user.name}</p>
                    {user.email && <p><strong>{t.email_label}:</strong> {user.email}</p>}
                    {user.phone && <p><strong>{t.phone_label}:</strong> {user.phone}</p>}
                  </div>

                  <h3>{t.settings}</h3>
                  <p className="settings-note">{t.settingsNote}</p>
                  <ul className="settings-list">
                    <li>{t.prefLang}: <span>{t.name}</span></li>
                    <li>{t.voiceStyle}: <span>{t.voiceStyleValue}</span></li>
                  </ul>

                  <button type="button" className="logout-button" onClick={handleLogout}>
                    {t.logout}
                  </button>
                </>
              ) : (
                <>
                  <h2>{t.login}</h2>
                  <p className="profile-subtitle">{t.loginSubtitle}</p>

                  <div className="login-options">
                    <button
                      type="button"
                      className="login-option google"
                      onClick={() => handleLogin('google')}
                      disabled={isAuthLoading}
                    >
                      {t.continueGoogle}
                    </button>
                    <button
                      type="button"
                      className="login-option facebook"
                      onClick={() => handleLogin('facebook')}
                      disabled={isAuthLoading}
                    >
                      {t.continueFacebook}
                    </button>
                  </div>

                  <div className="login-divider"><span>{t.or}</span></div>

                  <PhoneLoginForm t={t} onSubmit={(phone) => handleLogin('phone', { phone })} isAuthLoading={isAuthLoading} />
                  <EmailLoginForm t={t} onSubmit={(email) => handleLogin('email', { email })} isAuthLoading={isAuthLoading} />

                  {authError && <p className="auth-error">{authError}</p>}
                  {isAuthLoading && <p className="auth-status">{t.signingIn}</p>}

                  <p className="mock-warning">{t.mockWarning}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PhoneLoginForm({ t, onSubmit, isAuthLoading }) {
  const [phone, setPhone] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.trim()) onSubmit(phone.trim());
  };
  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="login-label">
        {t.phoneLabel}
        <input type="tel" className="login-input" placeholder={t.phonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <button type="submit" className="login-option phone" disabled={isAuthLoading}>
        {t.continuePhone}
      </button>
    </form>
  );
}

function EmailLoginForm({ t, onSubmit, isAuthLoading }) {
  const [email, setEmail] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) onSubmit(email.trim());
  };
  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="login-label">
        {t.emailLabel}
        <input type="email" className="login-input" placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button type="submit" className="login-option email" disabled={isAuthLoading}>
        {t.continueEmail}
      </button>
    </form>
  );
}

export default App;

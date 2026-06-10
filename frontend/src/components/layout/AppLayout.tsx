import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../features/auth/AuthContext";

const navItems = [
  { to: "/", label: "トップ" },
  { to: "/consultations/new", label: "AI相談" },
  { to: "/stories", label: "体験談" },
  { to: "/stories/new", label: "投稿" },
  { to: "/mypage", label: "マイページ" },
];

export function AppLayout() {
  const { isConfigured, user, signOut } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand">
          Okuru
        </NavLink>
        <nav className="site-nav" aria-label="メインナビゲーション">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        {isConfigured ? (
          <div className="auth-status">
            {user ? (
              <>
                <span>{user.email}</span>
                <button className="text-button" onClick={() => void signOut()} type="button">
                  ログアウト
                </button>
              </>
            ) : (
              <NavLink className="text-button" to="/login">
                ログイン
              </NavLink>
            )}
          </div>
        ) : null}
      </header>
      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}

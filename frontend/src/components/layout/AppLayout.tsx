import type { ComponentType, SVGProps } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../features/auth/AuthContext";
import {
  BookIcon,
  GiftMarkIcon,
  HistoryIcon,
  HomeIcon,
  PlusCircleIcon,
  SparkleIcon,
  UserIcon,
} from "./NavIcons";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
};

const navItems: NavItem[] = [
  { to: "/", label: "トップ", icon: HomeIcon, end: true },
  { to: "/consultations/new", label: "AI相談", icon: SparkleIcon },
  { to: "/consultations", label: "相談履歴", icon: HistoryIcon },
  { to: "/stories", label: "体験談", icon: BookIcon },
  { to: "/stories/new", label: "投稿する", icon: PlusCircleIcon },
  { to: "/mypage", label: "マイページ", icon: UserIcon },
];

function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.end) {
    return pathname === item.to;
  }

  if (pathname !== item.to && !pathname.startsWith(`${item.to}/`)) {
    return false;
  }

  return !navItems.some(
    (other) =>
      other.to.length > item.to.length &&
      other.to.startsWith(item.to) &&
      (pathname === other.to || pathname.startsWith(`${other.to}/`)),
  );
}

export function AppLayout() {
  const { isConfigured, user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="site-sidebar">
        <NavLink to="/" className="brand" end>
          <span className="brand-mark">
            <GiftMarkIcon />
          </span>
          Okuru
        </NavLink>

        <nav className="site-nav" aria-label="メインナビゲーション">
          {navItems.map((item) => {
            const isActive = isNavItemActive(location.pathname, item);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "nav-link nav-link-active" : "nav-link"}
              >
                <item.icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {isConfigured ? (
          <div className="sidebar-footer">
            {user ? (
              <div className="auth-status">
                <span className="auth-email" title={user.email}>
                  {user.email}
                </span>
                <button className="text-button" onClick={() => void signOut()} type="button">
                  ログアウト
                </button>
              </div>
            ) : (
              <NavLink className="button-secondary sidebar-login" to="/login">
                ログイン
              </NavLink>
            )}
          </div>
        ) : null}
      </aside>
      <div className="app-main">
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

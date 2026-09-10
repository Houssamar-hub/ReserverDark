import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  Sun, Moon, LogOut, Menu, X, LayoutDashboard,
  ChevronDown, Home, Bell, CheckCheck, ExternalLink
} from "lucide-react";

const LANGS = [
  { code: "fr", label: "Francais", flag: "FR" },
  { code: "en", label: "English",  flag: "EN" },
  { code: "ar", label: "AR",       flag: "AR" },
];

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [langOpen, setLangOpen]   = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); setMenuOpen(false); };
  const changeLang   = (code) => { i18n.changeLanguage(code); setLangOpen(false); };

  const dashboardPath = user
    ? user.role === "admin" ? "/admin" : user.role === "owner" ? "/owner" : "/client"
    : "/login";

  const notificationsPath = user
    ? user.role === "admin" ? "/admin" : user.role === "owner" ? "/owner" : "/client/notifications"
    : "/login";

  const currentLang = LANGS.find(l => l.code === i18n.language) || LANGS[0];

  const navLinks = [
    { to: "/",           label: t("nav.home") || "Accueil" },
    { to: "/properties", label: t("nav.properties") },
    { to: "/about",      label: t("nav.about") },
    { to: "/contact",    label: t("nav.contact") },
  ];

  const formatNotifTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.floor((now - date) / (1000 * 60));
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin}m`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return date.toLocaleDateString([], { day: "numeric", month: "short" });
  };

  const handleNotifClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    } else if (user?.role === "client") {
      navigate("/client/notifications");
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left section: Sidebar toggle (if in dashboard on mobile/tablet) + Logo */}
          <div className="flex items-center gap-2">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl border transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                aria-label="Toggle Dashboard Menu"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 select-none">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "var(--accent)" }}>
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                ReserverDark<span style={{ color: "var(--accent)" }}>.</span>
              </span>
            </Link>
          </div>

          {/* Desktop & Tablet nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-7">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                className="text-xs lg:text-sm font-medium transition-colors relative group whitespace-nowrap"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                {label}
              </Link>
            ))}
            {user && (
              <Link to={dashboardPath}
                className="flex items-center gap-1.5 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                <LayoutDashboard className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                {t("nav.dashboard")}
              </Link>
            )}
          </div>

          {/* Controls - Desktop & Tablet */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {/* Lang */}
            <div className="relative">
              <button onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); }}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 lg:px-3 py-2 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-secondary)" }}>
                {currentLang.flag}
                <ChevronDown className="w-3 h-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 z-50 rounded-xl overflow-hidden"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                  {LANGS.map(l => (
                    <button key={l.code} onClick={() => changeLang(l.code)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left transition-colors"
                      style={{ color: i18n.language === l.code ? "var(--accent)" : "var(--text-muted)", backgroundColor: "transparent" }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-secondary)"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme */}
            <button onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-secondary)" }}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth */}
            {user ? (
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm font-semibold px-3 lg:px-4 py-2 rounded-xl transition-all whitespace-nowrap"
                style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <LogOut className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> {t("nav.logout")}
              </button>
            ) : (
              <div className="flex items-center gap-1.5 lg:gap-2">
                <Link to="/login"
                  className="text-xs lg:text-sm font-medium px-2.5 lg:px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
                  style={{ color: "var(--text-muted)" }}>
                  {t("nav.login")}
                </Link>
                <Link to="/register"
                  className="text-xs lg:text-sm font-semibold px-3.5 lg:px-5 py-2 lg:py-2.5 rounded-xl text-white transition-all hover:opacity-90 whitespace-nowrap"
                  style={{ backgroundColor: "var(--accent)" }}>
                  {t("nav.register") || "S inscrire"}
                </Link>
              </div>
            )}

            {/* Notification Bell on the far right */}
            {user && (
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); }}
                  className="relative p-2 rounded-xl border transition-all hover:bg-gray-100 dark:hover:bg-white/10"
                  style={{
                    backgroundColor: notifOpen ? "var(--bg-secondary)" : "transparent",
                    borderColor: notifOpen ? "var(--accent)" : "var(--border)",
                    color: notifOpen ? "var(--accent)" : "var(--text-primary)"
                  }}
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-md animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Window */}
                {notifOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl z-50 border transition-all animate-fade-in"
                    style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
                  >
                    {/* Header */}
                    <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" style={{ color: "var(--accent)" }} />
                        <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                          Notifications
                        </h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500">
                            {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllAsRead()}
                          className="text-xs font-semibold flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Tout lire</span>
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
                      {notifications && notifications.length > 0 ? (
                        notifications.slice(0, 6).map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotifClick(notif)}
                            className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors text-left hover:bg-gray-50 dark:hover:bg-white/5 ${
                              !notif.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              !notif.isRead
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                : "bg-gray-100 text-gray-400 dark:bg-white/5"
                            }`}>
                              <Bell className="w-3.5 h-3.5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold truncate ${
                                !notif.isRead ? "text-blue-600 dark:text-blue-400" : ""
                              }`} style={notif.isRead ? { color: "var(--text-primary)" } : {}}>
                                {notif.title || "Nouvelle notification"}
                              </p>
                              <p className="text-xs line-clamp-2 mt-0.5" style={{ color: "var(--text-muted)" }}>
                                {notif.message || notif.content}
                              </p>
                              <span className="text-[10px] mt-1 block" style={{ color: "var(--text-muted)" }}>
                                {formatNotifTime(notif.createdAt)}
                              </span>
                            </div>

                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-xs font-semibold">Aucune notification pour le moment</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t text-center bg-gray-50/50 dark:bg-white/5" style={{ borderColor: "var(--border)" }}>
                      <Link
                        to={notificationsPath}
                        onClick={() => setNotifOpen(false)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1"
                      >
                        Voir toutes les notifications <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="md:hidden flex items-center gap-2">
            {/* Notification Bell on Mobile */}
            {user && (
              <button
                type="button"
                onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); }}
                className="relative p-2 rounded-xl text-text-muted hover:text-text-primary transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" style={{ color: notifOpen ? "var(--accent)" : "var(--text-primary)" }} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            <button onClick={toggleTheme} className="p-2" style={{ color: "var(--text-muted)" }}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }} className="p-2" style={{ color: "var(--text-muted)" }}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Notifications Popup */}
      {notifOpen && (
        <div
          className="md:hidden border-t border-b shadow-2xl transition-all"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" style={{ color: "var(--accent)" }} />
              <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Notifications ({unreadCount})
              </h4>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
            {notifications && notifications.length > 0 ? (
              notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotifClick(notif)}
                  className={`p-3 flex items-start gap-3 text-left ${
                    !notif.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${
                      !notif.isRead ? "text-blue-600 dark:text-blue-400" : ""
                    }`} style={notif.isRead ? { color: "var(--text-primary)" } : {}}>
                      {notif.title || "Notification"}
                    </p>
                    <p className="text-xs line-clamp-2 mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {notif.message || notif.content}
                    </p>
                    <span className="text-[10px] mt-1 block" style={{ color: "var(--text-muted)" }}>
                      {formatNotifTime(notif.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                Aucune notification pour le moment
              </div>
            )}
          </div>

          <div className="p-3 border-t text-center" style={{ borderColor: "var(--border)" }}>
            <Link
              to={notificationsPath}
              onClick={() => setNotifOpen(false)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400"
            >
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden" style={{ backgroundColor: "var(--bg-card)", borderTop: "1px solid var(--border)" }}>
          <div className="px-4 py-4 space-y-1">
            {[...navLinks, ...(user ? [{ to: dashboardPath, label: t("nav.dashboard") }] : [])].map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className="block py-3 text-sm font-medium border-b"
                style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
                {label}
              </Link>
            ))}
            {user ? (
              <button onClick={handleLogout}
                className="w-full mt-3 py-3 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl"
                style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <LogOut className="w-4 h-4" /> {t("nav.logout")}
              </button>
            ) : (
              <div className="flex gap-2 pt-3">
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-3 text-sm font-semibold rounded-xl"
                  style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  {t("nav.login")}
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-3 text-sm font-semibold rounded-xl text-white"
                  style={{ backgroundColor: "var(--accent)" }}>
                  {t("nav.register") || "S inscrire"}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      {(langOpen || notifOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setLangOpen(false); setNotifOpen(false); }}
        />
      )}
    </nav>
  );
};

export default Navbar;


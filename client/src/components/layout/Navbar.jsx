import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon, LogOut, Menu, X, LayoutDashboard, ChevronDown, Home } from "lucide-react";

const LANGS = [
  { code: "fr", label: "Francais", flag: "FR" },
  { code: "en", label: "English",  flag: "EN" },
  { code: "ar", label: "AR",       flag: "AR" },
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]  = useState(false);
  const [langOpen, setLangOpen]  = useState(false);
  const [scrolled, setScrolled]  = useState(false);

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

  const currentLang = LANGS.find(l => l.code === i18n.language) || LANGS[0];

  const navLinks = [
    { to: "/",           label: t("nav.home") || "Accueil" },
    { to: "/properties", label: t("nav.properties") },
    { to: "/about",      label: t("nav.about") },
    { to: "/contact",    label: t("nav.contact") },
  ];

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

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--accent)" }}>
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
              ReserverDark<span style={{ color: "var(--accent)" }}>.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                className="text-sm font-medium transition-colors relative group"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                {label}
              </Link>
            ))}
            {user && (
              <Link to={dashboardPath}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                <LayoutDashboard className="w-4 h-4" />
                {t("nav.dashboard")}
              </Link>
            )}
          </div>

          {/* Controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Lang */}
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
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
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <LogOut className="w-4 h-4" /> {t("nav.logout")}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                  style={{ color: "var(--text-muted)" }}>
                  {t("nav.login")}
                </Link>
                <Link to="/register"
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "var(--accent)" }}>
                  {t("nav.register") || "S inscrire"}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2" style={{ color: "var(--text-muted)" }}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2" style={{ color: "var(--text-muted)" }}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

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
      {langOpen && <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />}
    </nav>
  );
};

export default Navbar;

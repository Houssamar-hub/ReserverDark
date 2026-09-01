import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, ArrowRight, Building2, Briefcase, Home, Trees, Landmark, Shield, Star, Users, CheckCircle, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import PropertyCard from "../../components/property/PropertyCard";
import Spinner from "../../components/common/Spinner";
import api from "../../services/api";

const propTypes = [
  { label: "Appartement", icon: Building2, count: "1 245" },
  { label: "Bureau",      icon: Briefcase, count: "1 020" },
  { label: "Maison",      icon: Home,      count: "3 460" },
  { label: "Villa",       icon: Trees,     count: "2 814" },
  { label: "Riad",        icon: Landmark,  count: "1 052" },
];

const cities = ["Casablanca", "Marrakech", "Rabat", "Agadir", "Fes", "Tanger"];

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState("rent");
  const [search, setSearch]         = useState("");
  const [selectedType, setSelectedType] = useState(0);

  useEffect(() => {
    api.get("/properties?limit=6")
      .then(res => setProperties(res.data.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const searchUrl = "/properties" + (search ? "?city=" + search : "");

  return (
    <div style={{ backgroundColor: "var(--bg-primary)" }}>

      {/* HERO */}
      <section className="pt-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center" style={{ minHeight: "calc(100vh - 64px)", paddingTop: "4rem", paddingBottom: "4rem" }}>

            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px w-8" style={{ backgroundColor: "var(--accent)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                  Trouvez votre logement ideal
                </span>
              </div>

              <h1 className="font-display leading-tight mb-6" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: "var(--text-primary)" }}>
                Louer, Acheter<br />et Vendre au
                <span style={{ color: "var(--accent)" }}> Maroc</span>
              </h1>

              <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: "var(--text-muted)" }}>
                La plateforme de reference pour la location courte duree. Appartements, villas, riads — louez en toute confiance partout au Maroc.
              </p>

              <p className="text-base font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                Trouvez votre{" "}
                <span style={{ color: "var(--accent)" }}>logement ideal.</span>
              </p>

              {/* Tabs */}
              <div className="flex items-center gap-1 mb-6 p-1 rounded-xl w-fit"
                style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                {[["rent","Louer"],["buy","Acheter"]].map(([key, label]) => (
                  <button key={key} onClick={() => setTab(key)}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={tab === key
                      ? { backgroundColor: "var(--accent)", color: "#fff", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }
                      : { color: "var(--text-muted)", backgroundColor: "transparent" }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Search box */}
              <div className="rounded-2xl p-3"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold block mb-1.5 px-1" style={{ color: "var(--text-muted)" }}>Ville</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                      <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }} />
                      <select value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full bg-transparent text-sm focus:outline-none"
                        style={{ color: search ? "var(--text-primary)" : "var(--text-muted)" }}>
                        <option value="">Toutes les villes</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold block mb-1.5 px-1" style={{ color: "var(--text-muted)" }}>Type</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                      <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }} />
                      <select className="w-full bg-transparent text-sm focus:outline-none" style={{ color: "var(--text-muted)" }}>
                        <option>Appartement</option>
                        <option>Villa</option>
                        <option>Maison</option>
                        <option>Bureau</option>
                        <option>Riad</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => navigate(searchUrl)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 whitespace-nowrap w-full sm:w-auto justify-center"
                      style={{ backgroundColor: "var(--accent)" }}>
                      <Search className="w-4 h-4" /> Rechercher
                    </button>
                  </div>
                </div>
              </div>

              {/* City pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {cities.map(city => (
                  <Link key={city} to={"/properties?city=" + city}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                    {city}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right image */}
            <div className="relative hidden md:block">
              <div className="relative rounded-3xl overflow-hidden" style={{ height: "560px" }}>
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=85"
                  alt="Propriete"
                  className="w-full h-full object-cover"
                />
                {/* Stats card */}
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl px-5 py-4 flex items-center justify-around"
                  style={{ backgroundColor: "rgba(255,255,255,0.94)", backdropFilter: "blur(12px)" }}>
                  {[
                    { label: "Proprietes", value: "1 000+" },
                    { label: "Proprietaires", value: "400+" },
                    { label: "Clients", value: "15K+" },
                  ].map((s, i) => (
                    <div key={s.label} className="text-center">
                      <div className="text-xl font-bold" style={{ color: "var(--accent)" }}>{s.value}</div>
                      <div className="text-xs" style={{ color: "#64748b" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full"
                style={{ backgroundColor: "var(--accent)", opacity: 0.12 }} />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full"
                style={{ backgroundColor: "var(--accent)", opacity: 0.08 }} />
            </div>
          </div>
        </div>
      </section>

      {/* PROPERTY TYPES */}
      <section className="py-16 px-4" style={{ backgroundColor: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-8" style={{ backgroundColor: "var(--accent)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>Types de logements</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl mb-10" style={{ color: "var(--text-primary)" }}>
            Explorer par type
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {propTypes.map(({ label, icon: Icon, count }, i) => (
              <button key={label} onClick={() => setSelectedType(i)}
                className="flex-shrink-0 flex flex-col items-center gap-3 px-8 py-6 rounded-2xl transition-all duration-200"
                style={selectedType === i
                  ? { backgroundColor: "var(--accent)", color: "#fff", boxShadow: "0 4px 16px rgba(37,99,235,0.35)" }
                  : { backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                <div className="w-12 h-12 flex items-center justify-center rounded-xl"
                  style={{ backgroundColor: selectedType === i ? "rgba(255,255,255,0.2)" : "var(--bg-card)" }}>
                  <Icon className="w-6 h-6" style={{ color: selectedType === i ? "#fff" : "var(--accent)" }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: selectedType === i ? "#fff" : "var(--text-primary)" }}>
                    {label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: selectedType === i ? "rgba(255,255,255,0.75)" : "var(--text-muted)" }}>
                    {count} proprietes
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR PROPERTIES */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-8" style={{ backgroundColor: "var(--accent)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>Proprietes populaires</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl" style={{ color: "var(--text-primary)" }}>
                Decouvrir les proprietes
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <Link to="/properties"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: "var(--accent)" }}>
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24"><Spinner size="lg" /></div>
          ) : properties.length === 0 ? (
            <div className="text-center py-24">
              <Home className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--border-strong)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun logement disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-4" style={{ backgroundColor: "var(--bg-card)", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-8" style={{ backgroundColor: "var(--accent)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>Comment ca marche</span>
            <div className="h-px w-8" style={{ backgroundColor: "var(--accent)" }} />
          </div>
          <h2 className="font-display text-3xl md:text-4xl mb-12" style={{ color: "var(--text-primary)" }}>
            Simple, rapide et securise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Search,      title: t("home.steps.search.title"), desc: t("home.steps.search.desc") },
              { step: "02", icon: CheckCircle, title: t("home.steps.book.title"),   desc: t("home.steps.book.desc") },
              { step: "03", icon: Shield,      title: t("home.steps.enjoy.title"),  desc: t("home.steps.enjoy.desc") },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step}
                className="flex flex-col items-center text-center p-8 rounded-2xl transition-all hover:-translate-y-1 duration-300"
                style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl mb-4"
                  style={{ backgroundColor: "var(--accent-light)" }}>
                  <Icon className="w-6 h-6" style={{ color: "var(--accent)" }} />
                </div>
                <div className="text-4xl font-bold mb-2" style={{ color: "var(--accent)", opacity: 0.15 }}>{step}</div>
                <h3 className="font-display text-xl mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, var(--accent) 0%, #1d4ed8 100%)" }}>
          <div className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle at 75% 50%, rgba(255,255,255,0.12) 0%, transparent 60%)" }} />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-10 py-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(191,219,254,0.9)" }}>
                Pour les proprietaires
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-3">
                Publiez votre logement
              </h2>
              <p className="text-sm leading-relaxed max-w-md" style={{ color: "rgba(191,219,254,0.85)" }}>
                Rejoignez plus de 400 proprietaires qui font confiance a ReserverDark pour louer leur bien au Maroc.
              </p>
            </div>
            <Link to="/register"
              className="flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold transition-all hover:scale-105"
              style={{ backgroundColor: "#fff", color: "var(--accent)" }}>
              <Users className="w-5 h-5" />
              Devenir proprietaire
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

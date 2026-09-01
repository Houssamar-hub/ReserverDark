import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard, TrendingUp, DollarSign,
  Building2, Download, Clock
} from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function Revenue() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('year');

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const [statsRes, bookingsRes, propertiesRes] = await Promise.all([
        api.get('/bookings/stats'),
        api.get('/bookings/owner'),
        api.get('/properties/owner/my')
      ]);

      setStats(statsRes.data.stats || {});
      setBookings(bookingsRes.data.bookings || []);
      setProperties(propertiesRes.data.properties || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  // Calculate detailed financial metrics
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
  const pendingRevenue = pendingBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

  const now = new Date();
  const currentMonthBookings = confirmedBookings.filter(b => {
    const d = new Date(b.createdAt || b.checkIn);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const currentMonthRevenue = currentMonthBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

  const avgBookingValue = confirmedBookings.length > 0
    ? Math.round(totalRevenue / confirmedBookings.length)
    : 0;

  // Monthly breakdown calculation
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthBookings = confirmedBookings.filter(b => {
      const d = new Date(b.createdAt || b.checkIn);
      return d.getMonth() === i && d.getFullYear() === now.getFullYear();
    });
    const amount = monthBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
    return { month: MONTH_NAMES[i], amount };
  });

  const maxMonthAmount = Math.max(...monthlyData.map(m => m.amount), 1000);

  // Property breakdown
  const propertyRevenueMap = {};
  confirmedBookings.forEach(b => {
    const pId = b.property?._id || b.property;
    const title = b.property?.title || 'Logement';
    if (!propertyRevenueMap[pId]) {
      propertyRevenueMap[pId] = { title, amount: 0, count: 0, image: b.property?.images?.[0] };
    }
    propertyRevenueMap[pId].amount += Number(b.totalPrice) || 0;
    propertyRevenueMap[pId].count += 1;
  });

  const propertyRevenues = Object.values(propertyRevenueMap);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            {t('nav.revenue')}
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Suivi des gains, transactions et performances financières de vos biens.
          </p>
        </div>

        <button
          onClick={() => alert('Export du relevé financier téléchargé (simulation CSV)')}
          className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Exporter le rapport
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Revenu Total Généré',
            value: formatPrice(totalRevenue),
            sub: `${confirmedBookings.length} réservations confirmées`,
            icon: DollarSign,
            color: 'var(--accent)',
            badge: '+12% vs an dernier'
          },
          {
            label: 'Revenu ce mois-ci',
            value: formatPrice(currentMonthRevenue),
            sub: `${currentMonthBookings.length} réservations ce mois`,
            icon: TrendingUp,
            color: '#22c55e',
            badge: 'En cours'
          },
          {
            label: 'En attente de validation',
            value: formatPrice(pendingRevenue),
            sub: `${pendingBookings.length} demande(s) en attente`,
            icon: Clock,
            color: '#eab308',
            badge: 'Potentiel'
          },
          {
            label: 'Panier Moyen / Séjour',
            value: formatPrice(avgBookingValue),
            sub: 'Moyenne par réservation',
            icon: CreditCard,
            color: '#8b5cf6',
            badge: 'Moyenne'
          },
        ].map(({ label, value, sub, icon: Icon, color, badge }) => (
          <div key={label} className="card p-6 relative overflow-hidden transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                {badge}
              </span>
            </div>

            <div className="text-2xl lg:text-3xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
              {value}
            </div>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {label}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Chart & Property Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Earnings Chart */}
        <div className="card p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Évolution des revenus ({now.getFullYear()})
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Revenus cumulés par mois en MAD
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
              Année {now.getFullYear()}
            </span>
          </div>

          {/* Bar Chart Visualizer */}
          <div className="h-64 flex items-end gap-2 sm:gap-4 pt-8 pb-2">
            {monthlyData.map(({ month, amount }) => {
              const heightPercent = maxMonthAmount > 0 ? (amount / maxMonthAmount) * 100 : 0;
              const isCurrent = month === MONTH_NAMES[now.getMonth()];
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white whitespace-nowrap pointer-events-none mb-1">
                    {formatPrice(amount)}
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${Math.max(heightPercent, 6)}%`,
                      backgroundColor: isCurrent ? 'var(--accent)' : 'var(--accent-muted)',
                      opacity: amount > 0 ? 1 : 0.25
                    }}
                  />
                  {/* Label */}
                  <span className="text-[10px] font-semibold" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Property */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Revenus par logement
          </h2>

          {propertyRevenues.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucun revenu enregistré pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {propertyRevenues.map((p, i) => {
                const percent = totalRevenue > 0 ? Math.round((p.amount / totalRevenue) * 100) : 0;
                return (
                  <div key={i} className="space-y-1.5 p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold truncate max-w-[140px]" style={{ color: 'var(--text-primary)' }}>
                        {p.title}
                      </span>
                      <span className="font-extrabold" style={{ color: 'var(--accent)' }}>
                        {formatPrice(p.amount)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: 'var(--accent)' }} />
                    </div>
                    <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      <span>{p.count} séjour(s)</span>
                      <span>{percent}% du total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Historique des transactions & paiements
        </h2>

        {confirmedBookings.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
            Aucune transaction complétée à ce jour.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="table-th">Logement</th>
                  <th className="table-th">Voyageur</th>
                  <th className="table-th">Dates du séjour</th>
                  <th className="table-th">Statut</th>
                  <th className="table-th text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {confirmedBookings.map(b => (
                  <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="table-td font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {b.property?.title || 'Logement'}
                    </td>
                    <td className="table-td" style={{ color: 'var(--text-muted)' }}>
                      {b.client?.name || 'Voyageur'}
                    </td>
                    <td className="table-td" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(b.checkIn)} → {formatDate(b.checkOut)} ({b.nights || 1} nuits)
                    </td>
                    <td className="table-td">
                      <span className="badge-confirmed text-xs">
                        Payé & Confirmé
                      </span>
                    </td>
                    <td className="table-td text-right font-extrabold" style={{ color: 'var(--accent)' }}>
                      +{formatPrice(b.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

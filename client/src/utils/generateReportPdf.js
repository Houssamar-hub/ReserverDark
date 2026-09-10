import { formatPrice } from './formatPrice';
import { formatDate } from './formatDate';

export const generateReportPdf = ({ user, stats, bookings }) => {
  if (!bookings || bookings.length === 0) {
    throw new Error('Aucune donnée de réservation à exporter');
  }

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
  const pendingRevenue = pendingBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Veuillez autoriser les fenêtres pop-up pour générer le PDF');
  }

  const dateNow = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>ReserverDark - Rapport Financier & Réservations</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          background: #f8fafc;
          padding: 0;
          line-height: 1.5;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .no-print-bar {
          background: #0f172a;
          color: #ffffff;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btn-print {
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }

        .btn-print:hover {
          background: #1d4ed8;
        }

        .btn-close {
          background: rgba(255,255,255,0.1);
          color: #e2e8f0;
          border: none;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-close:hover {
          background: rgba(255,255,255,0.2);
        }

        .page-container {
          background: #ffffff;
          max-width: 900px;
          margin: 24px auto;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        @page {
          size: A4 portrait;
          margin: 12mm;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 24px;
          margin-bottom: 28px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-box {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 22px;
          box-shadow: 0 4px 10px rgba(37,99,235,0.3);
        }

        .brand-name {
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .brand-dot {
          color: #2563eb;
        }

        .report-meta {
          text-align: right;
        }

        .report-title {
          font-size: 16px;
          font-weight: 800;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .report-date {
          font-size: 12px;
          color: #64748b;
        }

        .owner-info {
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          margin-top: 2px;
        }

        /* KPI Cards Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }

        .kpi-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
        }

        .kpi-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          margin-bottom: 6px;
        }

        .kpi-val {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }

        .kpi-val.accent {
          color: #2563eb;
        }

        .kpi-val.success {
          color: #16a34a;
        }

        .kpi-val.warning {
          color: #d97706;
        }

        .kpi-sub {
          font-size: 10px;
          color: #94a3b8;
          margin-top: 4px;
        }

        /* Table Section */
        .section-title {
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 28px;
          font-size: 11px;
        }

        thead tr {
          background-color: #f1f5f9;
          border-bottom: 2px solid #cbd5e1;
        }

        th {
          padding: 10px 12px;
          text-align: left;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
        }

        th.text-right {
          text-align: right;
        }

        tbody tr {
          border-bottom: 1px solid #e2e8f0;
        }

        tbody tr:nth-child(even) {
          background-color: #f8fafc;
        }

        td {
          padding: 10px 12px;
          color: #334155;
          vertical-align: middle;
        }

        td.text-right {
          text-align: right;
          font-weight: 700;
        }

        .property-cell {
          font-weight: 700;
          color: #0f172a;
        }

        .city-tag {
          font-size: 10px;
          color: #64748b;
        }

        .client-name {
          font-weight: 600;
          color: #0f172a;
        }

        .client-sub {
          font-size: 10px;
          color: #64748b;
        }

        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 9999px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .badge-confirmed {
          background: #dcfce7;
          color: #15803d;
        }

        .badge-pending {
          background: #fef3c7;
          color: #b45309;
        }

        .badge-cancelled {
          background: #fee2e2;
          color: #b91c1c;
        }

        /* Footer */
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #94a3b8;
        }

        .footer-brand {
          font-weight: 700;
          color: #64748b;
        }

        @media print {
          body {
            background: #ffffff;
            padding: 0;
          }
          .no-print-bar {
            display: none !important;
          }
          .page-container {
            max-width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <!-- On-screen action toolbar -->
      <div class="no-print-bar">
        <div style="font-size: 13px; font-weight: 700;">
          Aperçu du Rapport PDF • ReserverDark
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-print" onclick="window.print()">
            🖨️ Enregistrer / Imprimer en PDF
          </button>
          <button class="btn-close" onclick="window.close()">
            Fermer
          </button>
        </div>
      </div>

      <div class="page-container">
        <!-- Header -->
        <div class="header">
          <div class="brand">
            <div class="logo-box">R</div>
            <div>
              <div class="brand-name">ReserverDark<span class="brand-dot">.</span></div>
              <div style="font-size: 11px; color: #64748b;">Plateforme Immobilière & Réservation Maroc</div>
            </div>
          </div>

          <div class="report-meta">
            <div class="report-title">Rapport Financier & Réservations</div>
            <div class="report-date">Généré le : ${dateNow}</div>
            <div class="owner-info">Propriétaire : ${user?.name || 'Hôte'} ${user?.email ? `(${user.email})` : ''}</div>
          </div>
        </div>

        <!-- KPI Summary Cards -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Revenu Confirmé</div>
            <div class="kpi-val accent">${formatPrice(totalRevenue)}</div>
            <div class="kpi-sub">${confirmedBookings.length} réservations validées</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">Total Réservations</div>
            <div class="kpi-val">${bookings.length}</div>
            <div class="kpi-sub">Demandes reçues</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">En Attente</div>
            <div class="kpi-val warning">${pendingBookings.length}</div>
            <div class="kpi-sub">Potentiel: ${formatPrice(pendingRevenue)}</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">Taux de Confirmation</div>
            <div class="kpi-val success">
              ${bookings.length > 0 ? Math.round((confirmedBookings.length / bookings.length) * 100) : 0}%
            </div>
            <div class="kpi-sub">${confirmedBookings.length} sur ${bookings.length}</div>
          </div>
        </div>

        <!-- Bookings Table -->
        <div class="section-title">
          <span>Détail complet des réservations</span>
          <span style="font-size: 11px; font-weight: normal; color: #64748b;">${bookings.length} ligne(s)</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Logement & Ville</th>
              <th>Voyageur / Client</th>
              <th>Dates Séjour</th>
              <th>Nuits / Pers.</th>
              <th>Statut</th>
              <th class="text-right">Montant Total</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(b => {
              const checkInFormatted = b.checkIn ? formatDate(b.checkIn) : '-';
              const checkOutFormatted = b.checkOut ? formatDate(b.checkOut) : '-';
              const badgeClass = b.status === 'confirmed' || b.status === 'completed'
                ? 'badge-confirmed'
                : b.status === 'pending'
                ? 'badge-pending'
                : 'badge-cancelled';
              const statusLabel = b.status === 'confirmed'
                ? 'Confirmée'
                : b.status === 'completed'
                ? 'Complétée'
                : b.status === 'pending'
                ? 'En attente'
                : b.status === 'rejected'
                ? 'Rejetée'
                : 'Annulée';

              return `
                <tr>
                  <td>
                    <div class="property-cell">${b.property?.title || 'Logement'}</div>
                    <div class="city-tag">${b.property?.city || 'Maroc'}</div>
                  </td>
                  <td>
                    <div class="client-name">${b.client?.name || 'Voyageur'}</div>
                    <div class="client-sub">${b.client?.phone || b.client?.email || 'N/A'}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600;">${checkInFormatted} → ${checkOutFormatted}</div>
                  </td>
                  <td>
                    <div>${b.nights || 1} nuit${(b.nights || 1) > 1 ? 's' : ''}</div>
                    <div style="font-size: 10px; color: #64748b;">${b.guests || 1} pers.</div>
                  </td>
                  <td>
                    <span class="badge ${badgeClass}">${statusLabel}</span>
                  </td>
                  <td class="text-right" style="color: #2563eb; font-size: 12px;">
                    ${formatPrice(Number(b.totalPrice) || 0)}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-brand">ReserverDark — Plateforme de référence au Maroc</div>
          <div>Document officiel généré électroniquement</div>
          <div>support@reserverdark.com</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

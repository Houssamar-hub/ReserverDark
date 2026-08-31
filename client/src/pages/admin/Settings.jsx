import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t } = useTranslation();
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
        {t('nav.settings')}
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Configure system settings here.</p>
      <div className="card p-6">
        <p style={{ color: 'var(--text-primary)' }}>System configuration options are loading...</p>
      </div>
    </div>
  );
}

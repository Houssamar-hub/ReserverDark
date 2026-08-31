import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatDate';

export default function Notifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(n => n.map(x => ({ ...x, read: true })));
      toast.success(t('common.success'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(n => n.filter(x => x._id !== id));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const unread = notifications.filter(n => !n.read).length;

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            {t('nav.notifications')}
          </h1>
          {unread > 0 && (
            <p className="text-sm mt-1 text-primary-500 font-semibold">
              {unread} {t('common.noData') === 'Aucune donnée' ? 'non lue(s)' : 'unread'}
            </p>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-xs font-bold transition-all"
            style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
            <CheckCheck className="w-4 h-4" /> Tout marquer lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-20 p-6">
          <Bell className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('common.noData')}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('common.noData') === 'Aucune donnée' ? 'Vous êtes à jour !' : 'You are up to date!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n._id} onClick={() => !n.read && markRead(n._id)}
              className={`card p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-all ${
                !n.read ? 'border-primary-500/50 ring-1 ring-primary-500/20' : ''
              }`}
              style={{ borderColor: !n.read ? undefined : 'var(--border)' }}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                n.read ? 'bg-gray-100 dark:bg-white/5' : 'bg-primary-50 dark:bg-primary-600/10'
              }`}>
                <Bell className={`w-5 h-5 ${n.read ? 'text-gray-400' : 'text-primary-600 dark:text-primary-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: n.read ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {n.title || 'Notification'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{n.message || n.content}</p>
                <p className="text-[10px] mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>{formatDate(n.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {n.read && <Check className="w-4 h-4 text-green-500" />}
                <button onClick={(e) => deleteNotification(n._id, e)}
                  className="p-1 hover:text-red-500 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

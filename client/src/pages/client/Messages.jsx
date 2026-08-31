import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Messages() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get('/messages/conversations')
      .then(res => { setConversations(res.data.conversations || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected) {
      api.get(`/messages/${selected._id}`)
        .then(res => setMessages(res.data.messages || []))
        .catch(() => setMessages([]));
    }
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    setSending(true);
    try {
      const res = await api.post('/messages', { conversationId: selected._id, content: text });
      setMessages(m => [...m, res.data.message]);
      setText('');
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6" style={{ color: 'var(--text-primary)' }}>
        {t('nav.messages')}
      </h1>
      <div className="card overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 flex flex-col flex-shrink-0" style={{ borderRight: '1px solid var(--border)' }}>
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                {conversations.length} {t('common.noData') === 'Aucune donnée' ? 'conversation(s)' : 'conversation(s)'}
              </p>
            </div>
            <div className="overflow-y-auto flex-1">
              {conversations.length === 0 ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">{t('common.noData')}</p>
                </div>
              ) : conversations.map(c => (
                <button key={c._id} onClick={() => setSelected(c)}
                  className={`w-full p-4 text-left border-b hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                    selected?._id === c._id ? 'bg-primary-50 dark:bg-primary-600/10' : ''
                  }`}
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {(c.otherUser?.name || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{c.otherUser?.name || 'Utilisateur'}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.lastMessage?.content || 'Aucun message'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {selected ? (
              <>
                <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                    {(selected.otherUser?.name || 'U')[0].toUpperCase()}
                  </div>
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{selected.otherUser?.name || 'Utilisateur'}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(m => {
                    const isMine = m.sender === user?._id || m.sender?._id === user?._id;
                    return (
                      <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium'
                            : 'border text-gray-800 dark:text-gray-200'
                        }`}
                        style={isMine ? {} : { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="p-4 border-t flex gap-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                  <input value={text} onChange={e => setText(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    placeholder="Votre message..." />
                  <button type="submit" disabled={sending || !text.trim()}
                    className="p-3 btn-primary rounded-xl transition-all flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center" style={{ color: 'var(--text-muted)' }}>
                  <MessageSquare className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-sm font-semibold">Sélectionnez une conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

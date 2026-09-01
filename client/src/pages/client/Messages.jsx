import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Search, User as UserIcon, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatImageUrl, handleImageError } from '../../utils/formatImage';

export default function Messages() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      const list = res.data.conversations || [];
      setConversations(list);
      // If we have selected conversation, update its reference
      if (selected) {
        const updated = list.find(c => c._id === selected._id);
        if (updated) setSelected(updated);
      }
    } catch {
      // silent catch for background polling
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await api.get(`/messages/${conversationId}`);
      setMessages(res.data.messages || []);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selected?._id) {
      fetchMessages(selected._id);
      const msgInterval = setInterval(() => {
        fetchMessages(selected._id);
      }, 3000);
      return () => clearInterval(msgInterval);
    }
  }, [selected?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !selected) return;
    const content = text.trim();
    setText('');
    setSending(true);

    try {
      const res = await api.post('/messages', {
        conversationId: selected._id,
        content
      });
      if (res.data.message) {
        setMessages(prev => [...prev, res.data.message]);
      }
      fetchConversations();
    } catch {
      toast.error(t('common.error'));
      setText(content); // restore on error
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const name = c.otherUser?.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            {t('nav.messages')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Discutez directement avec les voyageurs et propriétaires.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden border shadow-sm rounded-2xl" style={{ height: '75vh' }}>
        <div className="flex h-full flex-col md:flex-row">
          {/* Conversations Sidebar */}
          <div className="w-full md:w-80 flex flex-col flex-shrink-0 border-b md:border-b-0 md:border-r"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            {/* Search Input */}
            <div className="p-4 border-b space-y-3" style={{ borderColor: 'var(--border)' }}>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher une conversation..."
                  className="input pl-10 text-xs py-2"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                <span>{filteredConversations.length} conversation(s)</span>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-semibold">Aucune conversation trouvée</p>
                </div>
              ) : (
                filteredConversations.map(c => {
                  const isSelected = selected?._id === c._id;
                  const other = c.otherUser || {};
                  return (
                    <button
                      key={c._id}
                      onClick={() => setSelected(c)}
                      className={`w-full p-4 text-left transition-all flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-white/5 ${
                        isSelected ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden"
                          style={{ backgroundColor: 'var(--accent)' }}>
                          {other.avatar ? (
                            <img src={formatImageUrl(other.avatar)} onError={handleImageError} alt={other.name} className="w-full h-full object-cover" />
                          ) : (
                            (other.name || 'U')[0]?.toUpperCase()
                          )}
                        </div>
                        {c.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-600 text-white shadow">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                            {other.name || 'Utilisateur'}
                          </p>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {formatTime(c.updatedAt || c.lastMessage?.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs truncate" style={{ color: c.unreadCount > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                          {c.lastMessage?.content || 'Nouvelle conversation'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {selected ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between gap-3 shadow-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden"
                      style={{ backgroundColor: 'var(--accent)' }}>
                      {selected.otherUser?.avatar ? (
                        <img src={formatImageUrl(selected.otherUser.avatar)} onError={handleImageError} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        (selected.otherUser?.name || 'U')[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {selected.otherUser?.name || 'Utilisateur'}
                      </h2>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {selected.otherUser?.email || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center" style={{ color: 'var(--text-muted)' }}>
                      <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-xs font-semibold">Envoyez le premier message pour démarrer la discussion.</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const senderId = m.sender?._id || m.sender;
                      const isMine = senderId === user?._id;

                      return (
                        <div key={m._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                              isMine
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'border rounded-bl-sm'
                            }`}
                            style={isMine ? {} : { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                          >
                            {m.content}
                          </div>
                          <span className="text-[10px] mt-1 px-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            {formatTime(m.createdAt)}
                            {isMine && <CheckCheck className="w-3 h-3 text-blue-500" />}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={sendMessage} className="p-3 md:p-4 border-t flex items-center gap-2"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Écrivez votre message..."
                    className="input flex-1 text-sm py-2.5"
                  />
                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="btn-primary p-3 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--accent-light)' }}>
                  <MessageSquare className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Vos messages
                </h3>
                <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
                  Sélectionnez une conversation dans la liste pour lire et répondre aux messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Phone, 
  User, 
  MessageSquare, 
  RefreshCw 
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { contactAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { addToast } = useToast();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await contactAPI.adminGetMessages();
      if (res.success) {
        setMessages(res.messages || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load contact messages:', err);
      addToast('Failed to load contact messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (message) => {
    try {
      const res = await contactAPI.adminMarkRead(message._id, !message.isRead);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === message._id ? { ...m, isRead: !m.isRead } : m))
        );
        setUnreadCount((prev) => (message.isRead ? prev + 1 : Math.max(0, prev - 1)));
        addToast(`Message marked as ${!message.isRead ? 'read' : 'unread'}`, 'info');
      }
    } catch (err) {
      addToast('Failed to update message status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry message?')) return;
    try {
      const res = await contactAPI.adminDeleteMessage(id);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
        addToast('Message deleted successfully', 'info');
      }
    } catch (err) {
      addToast('Failed to delete message', 'error');
    }
  };

  return (
    <AdminLayout title="Inquiries & Messages">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>Customer Inquiries</h1>
          <p style={{ margin: 0, fontSize: '0.92rem' }}>
            Messages received via website contact form. ({unreadCount} unread)
          </p>
        </div>

        <button onClick={fetchMessages} className="btn btn-outline btn-sm">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
          <p style={{ marginTop: '0.5rem' }}>Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <MessageSquare size={44} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
          <h3>No contact messages</h3>
          <p style={{ color: 'var(--text-muted)' }}>Any inquiries submitted from the website contact page will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg) => (
            <div
              key={msg._id}
              className="card"
              style={{
                padding: '1.5rem',
                borderLeft: msg.isRead ? '4px solid var(--border-color)' : '4px solid var(--primary)',
                background: msg.isRead ? '#ffffff' : 'var(--primary-light)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{msg.name}</h3>
                    {!msg.isRead && <span className="badge badge-primary">New</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={14} />
                      {msg.email}
                    </span>
                    {msg.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={14} />
                        {msg.phone}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} />
                      {new Date(msg.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleToggleRead(msg)}
                    className="btn btn-outline btn-sm"
                    title={msg.isRead ? 'Mark as Unread' : 'Mark as Read'}
                  >
                    <CheckCircle size={14} color={msg.isRead ? 'var(--text-muted)' : 'var(--success)'} />
                    <span>{msg.isRead ? 'Mark Unread' : 'Mark Read'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(msg._id)}
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--danger)' }}
                    title="Delete Message"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)', background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMessages;

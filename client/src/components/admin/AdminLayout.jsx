import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  Users, 
  Mail, 
  ExternalLink, 
  LogOut, 
  Sparkles,
  ShieldCheck,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children, title = 'Admin Dashboard' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(true);
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="brand-icon" style={{ width: '36px', height: '36px' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              Wash & Wow
            </div>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
              Admin Portal
            </div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/admin/services"
            className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}
          >
            <Layers size={18} />
            <span>Services & Pricing</span>
          </NavLink>

          <NavLink
            to="/admin/customers"
            className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}
          >
            <Users size={18} />
            <span>Customers</span>
          </NavLink>

          <NavLink
            to="/admin/messages"
            className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}
          >
            <Mail size={18} />
            <span>Messages</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}
          >
            <Sliders size={18} />
            <span>Delivery & Taxes</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <Link
            to="/"
            target="_blank"
            className="admin-nav-item"
            style={{ fontSize: '0.82rem', color: '#94a3b8' }}
          >
            <ExternalLink size={16} />
            <span>View Live Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', color: '#f87171' }}
          >
            <LogOut size={16} />
            <span>Admin Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{title}</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/" className="btn btn-outline btn-sm">
              <ExternalLink size={14} />
              <span>Customer Website</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                {user?.name?.charAt(0) || 'V'}
              </div>
              <div style={{ fontSize: '0.88rem' }}>
                <div style={{ fontWeight: 700 }}>{user?.name || 'Vikas'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

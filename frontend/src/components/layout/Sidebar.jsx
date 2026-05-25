import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, BriefcaseBusiness, Settings, BarChart3, ShieldCheck } from 'lucide-react';
import './Sidebar.css';

const nav = [
  { label: 'Workflow', items: [
    { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/upload', label: 'Upload resumes', Icon: FileText },
    { to: '/candidates', label: 'Candidates', Icon: Users },
  ]},
  { label: 'Setup', items: [
    { to: '/roles', label: 'Job roles', Icon: BriefcaseBusiness },
    { to: '/reports', label: 'Reports', Icon: BarChart3 },
  ]},
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <ShieldCheck size={16} color="#185FA5" />
        <div>
          <div className="brand-name">Screen-U</div>
          <div className="brand-sub">Recruitment Intelligence</div>
        </div>
      </div>
      {nav.map(group => (
        <div key={group.label}>
          <div className="nav-section">{group.label}</div>
          {group.items.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <NavLink to="/settings" className="nav-item">
        <Settings size={16} /> Settings
      </NavLink>
    </aside>
  );
}
import React from 'react';
import { useTheme } from './ThemeContext.jsx';
import { Sun, Moon } from 'lucide-react';
import './DarkModeToggle.css';

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`dark-mode-toggle ${theme === 'dark' ? 'active' : ''}`}
    >
      <div className="toggle-left">
        {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        <span>Dark Mode</span>
      </div>

      <div className="switch">
        <div className="switch-track"></div>
        <div className="switch-thumb"></div>
      </div>
    </button>
  );
}
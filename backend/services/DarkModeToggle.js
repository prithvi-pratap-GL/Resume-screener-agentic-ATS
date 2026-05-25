import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import './DarkModeToggle.css';

const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="dark-mode-toggle">
      {theme === 'light' ? (
        <><Sun size={16} /> Light Mode</>
      ) : (
        <><Moon size={16} /> Dark Mode</>
      )}
    </button>
  );
};

export default DarkModeToggle;
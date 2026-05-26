import { elements } from '../dom/elements.js';
import { showToast } from './toast.js';

export function initTheme() {
  const savedTheme = localStorage.getItem('study-notes-theme') || 'dark';
  const isDark = savedTheme === 'dark';
  document.body.classList.toggle('dark-theme', isDark);
  elements.themeToggleBtn.innerHTML = isDark
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

export function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('study-notes-theme', isDark ? 'dark' : 'light');
  elements.themeToggleBtn.innerHTML = isDark
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
  showToast(`${isDark ? 'Dark' : 'Light'} theme activated`, 'info');
}

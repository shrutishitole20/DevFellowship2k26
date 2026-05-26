import { elements } from '../dom/elements.js';
import { getState, setActiveView } from '../state/store.js';
import { showToast } from './toast.js';

function setLayoutClasses(view) {
  const className = view === 'list' ? 'notes-grid list-layout' : 'notes-grid grid-layout';
  elements.allNotesGrid.className = className;
  elements.pinnedNotesGrid.className = className;
  elements.viewGridBtn.classList.toggle('active', view === 'grid');
  elements.viewListBtn.classList.toggle('active', view === 'list');
}

export function initLayout() {
  const savedLayout = localStorage.getItem('study-notes-layout') || 'grid';
  setActiveView(savedLayout);
  setLayoutClasses(getState().activeView);
}

export function changeLayout(view) {
  if (view === getState().activeView) return;
  setActiveView(view);
  localStorage.setItem('study-notes-layout', view);
  setLayoutClasses(view);
  showToast(`Switched to ${view} view`, 'info');
}

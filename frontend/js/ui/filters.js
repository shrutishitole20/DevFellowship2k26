import { elements } from '../dom/elements.js';
import { getState, setCategoryFilter, setSearchQuery } from '../state/store.js';
import { renderNotesList } from './notesRenderer.js';

export function applyFilters() {
  elements.notesLoader.style.display = 'none';
  const state = getState();
  const searchLower = state.currentSearchQuery.toLowerCase().trim();
  const filtered = state.allNotes.filter((note) => {
    const categoryMatch = state.currentCategoryFilter === 'all' || note.category.toLowerCase() === state.currentCategoryFilter.toLowerCase();
    const searchMatch = !searchLower || note.title.toLowerCase().includes(searchLower) || note.content.toLowerCase().includes(searchLower);
    return categoryMatch && searchMatch;
  });
  if (!filtered.length) {
    elements.allNotesGrid.innerHTML = '';
    elements.pinnedNotesGrid.innerHTML = '';
    elements.pinnedSectionWrapper.style.display = 'none';
    elements.emptyStateContainer.style.display = 'flex';
    elements.emptyStateText.textContent = state.currentSearchQuery || state.currentCategoryFilter !== 'all'
      ? 'No notes match your active search or category filters.'
      : 'Your study space is empty! Create your first study note on the left.';
    return;
  }
  elements.emptyStateContainer.style.display = 'none';
  const pinned = filtered.filter((n) => n.pinned === 1);
  const regular = filtered.filter((n) => n.pinned !== 1);
  elements.pinnedSectionWrapper.style.display = pinned.length ? 'block' : 'none';
  if (pinned.length) renderNotesList(pinned, elements.pinnedNotesGrid);
  elements.allNotesHeading.textContent = pinned.length ? 'Other Notes' : 'All Notes';
  renderNotesList(regular, elements.allNotesGrid);
}

export function onCategoryFilterClick(target) {
  if (!target.classList.contains('filter-badge')) return;
  elements.categoryFiltersContainer.querySelectorAll('.filter-badge').forEach((b) => b.classList.remove('active'));
  target.classList.add('active');
  setCategoryFilter(target.getAttribute('data-category'));
  applyFilters();
}

export function onSearchInput(value) {
  setSearchQuery(value);
  elements.clearSearchBtn.style.display = value ? 'block' : 'none';
  applyFilters();
}

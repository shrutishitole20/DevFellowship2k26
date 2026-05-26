import { elements } from './dom/elements.js';
import { getState, setNotes, setSearchQuery } from './state/store.js';
import { fetchNotesApi, createNoteApi, updateNoteApi, deleteNoteApi } from './services/notesApi.js';
import { showToast } from './ui/toast.js';
import { initTheme, toggleTheme } from './ui/theme.js';
import { initLayout, changeLayout } from './ui/layout.js';
import { applyFilters, onCategoryFilterClick, onSearchInput } from './ui/filters.js';
import { fillFormForEdit, readFormPayload, resetForm, updateCharCounter } from './ui/form.js';

async function fetchNotes() {
  elements.notesLoader.style.display = 'flex';
  elements.emptyStateContainer.style.display = 'none';
  try {
    setNotes(await fetchNotesApi());
    applyFilters();
  } catch (error) {
    showToast('Failed to load notes. Please verify backend state.', 'error');
    elements.notesLoader.style.display = 'none';
    elements.emptyStateContainer.style.display = 'flex';
    elements.emptyStateText.textContent = 'Backend unreachable. Please run server and refresh.';
  }
}

function findNote(id) {
  return getState().allNotes.find((n) => n.id === id);
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const payload = readFormPayload();
  if (!payload) return;
  const editingId = elements.noteIdInput.value;
  elements.submitBtn.disabled = true;
  try {
    if (editingId) await updateNoteApi(editingId, payload);
    else await createNoteApi(payload);
    showToast(editingId ? 'Note updated successfully!' : 'Note created successfully!', 'success');
    resetForm();
    await fetchNotes();
  } catch (error) { showToast(error.message, 'error'); }
  finally { elements.submitBtn.disabled = false; }
}

async function handleNoteAction(event) {
  const actionBtn = event.target.closest('button[data-action]');
  const card = event.target.closest('article.note-card');
  if (!actionBtn || !card) return;
  const noteId = Number(card.dataset.id);
  const note = findNote(noteId);
  if (!note) return;
  if (actionBtn.dataset.action === 'edit') {
    fillFormForEdit(note);
    showToast(`Editing Note: "${note.title.substring(0, 15)}..."`, 'info');
  }
  if (actionBtn.dataset.action === 'pin') {
    await updateNoteApi(note.id, { pinned: note.pinned !== 1 });
    showToast(note.pinned === 1 ? 'Note successfully unpinned' : 'Note successfully pinned to top', 'success');
    await fetchNotes();
  }
  if (actionBtn.dataset.action === 'delete' && confirm(`Are you sure you want to permanently delete the note: "${note.title}"?`)) {
    await deleteNoteApi(note.id);
    if (elements.noteIdInput.value === String(note.id)) resetForm();
    showToast('Note deleted successfully.', 'success');
    await fetchNotes();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme(); initLayout(); updateCharCounter();
  elements.themeToggleBtn.addEventListener('click', toggleTheme);
  elements.viewGridBtn.addEventListener('click', () => changeLayout('grid'));
  elements.viewListBtn.addEventListener('click', () => changeLayout('list'));
  elements.noteContentInput.addEventListener('input', updateCharCounter);
  elements.noteForm.addEventListener('submit', handleFormSubmit);
  elements.cancelEditBtn.addEventListener('click', resetForm);
  elements.categoryFiltersContainer.addEventListener('click', (e) => onCategoryFilterClick(e.target));
  elements.searchInput.addEventListener('input', (e) => onSearchInput(e.target.value));
  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = ''; setSearchQuery(''); elements.clearSearchBtn.style.display = 'none'; applyFilters();
  });
  elements.allNotesGrid.addEventListener('click', handleNoteAction);
  elements.pinnedNotesGrid.addEventListener('click', handleNoteAction);
  fetchNotes();
});

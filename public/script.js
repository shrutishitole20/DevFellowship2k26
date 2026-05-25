/**
 * script.js
 * Frontend controller for Smart Study Notes Manager.
 * Orchestrates API calls, dynamic UI states, filtering, search, and premium animations.
 */

// Global State
let allNotes = []; // Holds the master list of notes fetched from server
let currentCategoryFilter = 'all'; // Current selected category filter
let currentSearchQuery = ''; // Current active search string
let activeView = 'grid'; // Grid or List layout

// DOM Elements
const noteForm = document.getElementById('note-form');
const noteIdInput = document.getElementById('note-id');
const noteTitleInput = document.getElementById('note-title');
const noteCategorySelect = document.getElementById('note-category');
const noteContentInput = document.getElementById('note-content');
const notePinnedCheckbox = document.getElementById('note-pinned');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const formTitle = document.getElementById('form-title');
const charCounter = document.getElementById('char-counter');

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const themeToggleBtn = document.getElementById('theme-toggle');

const categoryFiltersContainer = document.getElementById('category-filters-container');
const viewGridBtn = document.getElementById('view-grid');
const viewListBtn = document.getElementById('view-list');

const pinnedSectionWrapper = document.getElementById('pinned-section-wrapper');
const pinnedNotesGrid = document.getElementById('pinned-notes-grid');
const allNotesGrid = document.getElementById('all-notes-grid');
const allNotesHeading = document.getElementById('all-notes-heading');

const notesLoader = document.getElementById('notes-loader');
const emptyStateContainer = document.getElementById('empty-state');
const emptyStateText = document.getElementById('empty-state-text');
const toastContainer = document.getElementById('toast-container');

// Category Visual Configuration
const CATEGORY_COLORS = {
  'Study': { color: 'var(--cat-study)', light: 'var(--cat-study-light)', icon: '📚' },
  'Work': { color: 'var(--cat-work)', light: 'var(--cat-work-light)', icon: '💼' },
  'Personal': { color: 'var(--cat-personal)', light: 'var(--cat-personal-light)', icon: '🏡' },
  'Ideas': { color: 'var(--cat-ideas)', light: 'var(--cat-ideas-light)', icon: '💡' },
  'General': { color: 'var(--cat-general)', light: 'var(--cat-general-light)', icon: '📝' }
};

// ==========================================
// 1. Initialization and Setup
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLayout();
  setupEventListeners();
  fetchNotes();
});

/**
 * Initializes Light/Dark theme from localStorage
 */
function initTheme() {
  const savedTheme = localStorage.getItem('study-notes-theme') || 'dark'; // Default to dark for rich look
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    document.body.classList.remove('dark-theme');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
}

/**
 * Initializes layout view (grid/list) from localStorage
 */
function initLayout() {
  const savedLayout = localStorage.getItem('study-notes-layout') || 'grid';
  activeView = savedLayout;
  
  if (activeView === 'list') {
    viewListBtn.classList.add('active');
    viewGridBtn.classList.remove('active');
    allNotesGrid.className = 'notes-grid list-layout';
    pinnedNotesGrid.className = 'notes-grid list-layout';
  } else {
    viewGridBtn.classList.add('active');
    viewListBtn.classList.remove('active');
    allNotesGrid.className = 'notes-grid grid-layout';
    pinnedNotesGrid.className = 'notes-grid grid-layout';
  }
}

/**
 * Binds DOM event listeners
 */
function setupEventListeners() {
  // Theme Toggle Button
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Layout Controls
  viewGridBtn.addEventListener('click', () => changeLayout('grid'));
  viewListBtn.addEventListener('click', () => changeLayout('list'));

  // Form input validation & word counters
  noteContentInput.addEventListener('input', updateCharCounter);
  noteTitleInput.addEventListener('input', () => validateField(noteTitleInput, 'title-error'));
  noteContentInput.addEventListener('input', () => validateField(noteContentInput, 'content-error'));

  // Form submission
  noteForm.addEventListener('submit', handleFormSubmit);

  // Cancel edit button
  cancelEditBtn.addEventListener('click', resetForm);

  // Category filters
  categoryFiltersContainer.addEventListener('click', handleCategoryFilter);

  // Real-time Search
  searchInput.addEventListener('input', handleSearchInput);
  clearSearchBtn.addEventListener('click', clearSearch);
}

// ==========================================
// 2. State & Style Actions
// ==========================================

/**
 * Toggles theme between Light and Dark mode
 */
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('study-notes-theme', isDark ? 'dark' : 'light');
  themeToggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  showToast(`${isDark ? 'Dark' : 'Light'} theme activated`, 'info');
}

/**
 * Swaps grid/list layouts fluidly
 */
function changeLayout(viewType) {
  if (viewType === activeView) return;
  activeView = viewType;
  localStorage.setItem('study-notes-layout', viewType);
  
  initLayout();
  showToast(`Switched to ${viewType} view`, 'info');
}

/**
 * Real-time character counter and estimated reading time calculation
 */
function updateCharCounter() {
  const text = noteContentInput.value;
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);
  
  charCounter.textContent = `${charCount} chars | ~${readingTime} min read`;
}

// ==========================================
// 3. Form Validation & Submissions
// ==========================================

/**
 * Validates a single input element on input change
 */
function validateField(inputEl, errorId) {
  const errorEl = document.getElementById(errorId);
  const parent = inputEl.parentElement;
  
  if (!inputEl.value || !inputEl.value.trim()) {
    parent.classList.add('invalid');
    return false;
  } else {
    parent.classList.remove('invalid');
    return true;
  }
}

/**
 * Resets the note creator form to its original default state
 */
function resetForm() {
  noteForm.reset();
  noteIdInput.value = '';
  
  // Clear validation classes
  noteTitleInput.parentElement.classList.remove('invalid');
  noteContentInput.parentElement.classList.remove('invalid');
  
  // Reset buttons & header
  formTitle.innerHTML = '<i class="fa-solid fa-file-pen"></i> Create New Note';
  submitBtn.querySelector('.btn-text').textContent = 'Save Note';
  cancelEditBtn.style.display = 'none';
  
  updateCharCounter();
}

/**
 * Validates whole form and sends payload to appropriate API
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const isTitleValid = validateField(noteTitleInput, 'title-error');
  const isContentValid = validateField(noteContentInput, 'content-error');
  
  if (!isTitleValid || !isContentValid) {
    showToast('Please fix all empty fields before saving.', 'error');
    return;
  }

  const payload = {
    title: noteTitleInput.value.trim(),
    category: noteCategorySelect.value,
    content: noteContentInput.value.trim(),
    pinned: notePinnedCheckbox.checked
  };

  const editingId = noteIdInput.value;
  submitBtn.disabled = true;

  try {
    if (editingId) {
      // Put operation
      const response = await fetch(`/notes/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update note.');
      
      showToast('Note updated successfully!', 'success');
    } else {
      // Post operation
      const response = await fetch('/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create note.');
      
      showToast('Note created successfully!', 'success');
    }
    
    resetForm();
    await fetchNotes(); // Re-fetch from server to display latest data and update master list
  } catch (error) {
    console.error('Submit Error:', error);
    showToast(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
  }
}

// ==========================================
// 4. API Operations
// ==========================================

/**
 * Fetches all study notes from the Node API backend
 */
async function fetchNotes() {
  notesLoader.style.display = 'flex';
  emptyStateContainer.style.display = 'none';
  allNotesGrid.innerHTML = '';
  pinnedNotesGrid.innerHTML = '';
  pinnedSectionWrapper.style.display = 'none';

  try {
    const response = await fetch('/notes');
    if (!response.ok) throw new Error('Could not fetch notes from study server.');
    
    allNotes = await response.json();
    applyFilters();
  } catch (error) {
    console.error('Fetch Error:', error);
    showToast('Failed to load notes. Please verify backend state.', 'error');
    
    notesLoader.style.display = 'none';
    emptyStateContainer.style.display = 'flex';
    emptyStateText.textContent = 'Backend unreachable. Please run server and refresh.';
  }
}

/**
 * Toggles pinning status on a note (instantly synchronizes to database)
 */
async function togglePin(noteId, currentPinnedStatus) {
  try {
    const response = await fetch(`/notes/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: !currentPinnedStatus })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to pin note.');
    
    const action = !currentPinnedStatus ? 'pinned to top' : 'unpinned';
    showToast(`Note successfully ${action}`, 'success');
    await fetchNotes();
  } catch (error) {
    console.error('Pin Error:', error);
    showToast(error.message, 'error');
  }
}

/**
 * Loads note fields into the side panel form for editing
 */
function editNote(noteId) {
  const note = allNotes.find(n => n.id === noteId);
  if (!note) {
    showToast('Requested note not found.', 'error');
    return;
  }

  // Populate form fields
  noteIdInput.value = note.id;
  noteTitleInput.value = note.title;
  noteCategorySelect.value = note.category;
  noteContentInput.value = note.content;
  notePinnedCheckbox.checked = note.pinned === 1;

  // Visual update of panel state
  formTitle.innerHTML = `<i class="fa-solid fa-edit"></i> Editing Note #${note.id}`;
  submitBtn.querySelector('.btn-text').textContent = 'Update Note';
  cancelEditBtn.style.display = 'block';

  updateCharCounter();
  
  // Smooth scroll form into view on mobile layout
  noteForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // Focus the title field
  noteTitleInput.focus();
  showToast(`Editing Note: "${note.title.substring(0, 15)}..."`, 'info');
}

/**
 * Triggers safe modal delete or deletion call
 */
async function deleteNote(noteId, noteTitle) {
  const confirmDelete = confirm(`Are you sure you want to permanently delete the note: "${noteTitle}"?`);
  if (!confirmDelete) return;

  try {
    const response = await fetch(`/notes/${noteId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete note.');
    
    showToast('Note deleted successfully.', 'success');
    
    // If the note being deleted was currently loaded in editor, reset editor
    if (noteIdInput.value === String(noteId)) {
      resetForm();
    }
    
    await fetchNotes();
  } catch (error) {
    console.error('Delete Error:', error);
    showToast(error.message, 'error');
  }
}

// ==========================================
// 5. Search & Filtering Mechanics
// ==========================================

/**
 * Category badge click event handler
 */
function handleCategoryFilter(e) {
  if (!e.target.classList.contains('filter-badge')) return;

  // Toggle active class on siblings
  const badges = categoryFiltersContainer.querySelectorAll('.filter-badge');
  badges.forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');

  currentCategoryFilter = e.target.getAttribute('data-category');
  applyFilters();
}

/**
 * Search input typing event handler
 */
function handleSearchInput(e) {
  currentSearchQuery = e.target.value;
  
  if (currentSearchQuery) {
    clearSearchBtn.style.display = 'block';
  } else {
    clearSearchBtn.style.display = 'none';
  }
  
  applyFilters();
}

/**
 * Clears active search inputs
 */
function clearSearch() {
  searchInput.value = '';
  currentSearchQuery = '';
  clearSearchBtn.style.display = 'none';
  applyFilters();
  searchInput.focus();
}

/**
 * Helper to highlight matching queries in the search results
 */
function highlightText(text, searchStr) {
  if (!searchStr || !searchStr.trim()) return text;
  
  try {
    // Escape regex characters safely
    const escapedStr = searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedStr})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  } catch (err) {
    return text;
  }
}

/**
 * Applies search and category query constraints to the in-memory allNotes array
 */
function applyFilters() {
  notesLoader.style.display = 'none';
  
  // Filter core array based on category & search terms
  const filtered = allNotes.filter(note => {
    const matchesCategory = (currentCategoryFilter === 'all' || note.category.toLowerCase() === currentCategoryFilter.toLowerCase());
    
    const searchLower = currentSearchQuery.toLowerCase().trim();
    const matchesSearch = !searchLower || 
                          note.title.toLowerCase().includes(searchLower) || 
                          note.content.toLowerCase().includes(searchLower);
                          
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    allNotesGrid.innerHTML = '';
    pinnedNotesGrid.innerHTML = '';
    pinnedSectionWrapper.style.display = 'none';
    emptyStateContainer.style.display = 'flex';
    
    if (currentSearchQuery || currentCategoryFilter !== 'all') {
      emptyStateText.textContent = 'No notes match your active search or category filters.';
    } else {
      emptyStateText.textContent = 'Your study space is empty! Create your first study note on the left.';
    }
    return;
  }

  emptyStateContainer.style.display = 'none';

  // Partition into Pinned vs Unpinned arrays
  const pinnedNotes = filtered.filter(n => n.pinned === 1);
  const regularNotes = filtered.filter(n => n.pinned !== 1);

  // Render Pinned Section
  if (pinnedNotes.length > 0) {
    pinnedSectionWrapper.style.display = 'block';
    renderNotesList(pinnedNotes, pinnedNotesGrid);
  } else {
    pinnedSectionWrapper.style.display = 'none';
  }

  // Render Regular Section
  if (regularNotes.length > 0) {
    allNotesHeading.textContent = pinnedNotes.length > 0 ? 'Other Notes' : 'All Notes';
    renderNotesList(regularNotes, allNotesGrid);
  } else {
    allNotesGrid.innerHTML = '';
    allNotesHeading.textContent = 'All Notes';
  }
}

/**
 * Renders notes objects into specified target HTML grids
 */
function renderNotesList(notes, targetContainer) {
  targetContainer.innerHTML = '';

  notes.forEach(note => {
    const card = document.createElement('article');
    card.className = `glass-card note-card ${note.pinned ? 'pinned' : ''}`;
    
    // Inject dynamic category styles via CSS Custom Properties
    const config = CATEGORY_COLORS[note.category] || CATEGORY_COLORS['General'];
    card.style.setProperty('--cat-color', config.color);
    card.style.setProperty('--cat-color-light', config.light);

    // Calculate reading time for display
    const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;
    const readingTime = Math.ceil(wordCount / 200);

    // Dynamic highlights for active searches
    const highlightedTitle = highlightText(escapeHTML(note.title), currentSearchQuery);
    const highlightedContent = highlightText(escapeHTML(note.content), currentSearchQuery);

    // Date formatting (readable locale format)
    const formattedDate = new Date(note.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    card.innerHTML = `
      <div class="note-header">
        <span class="note-badge">
          ${config.icon} ${note.category}
        </span>
        ${note.pinned ? '<i class="fa-solid fa-thumbtack note-pin-indicator" title="Pinned to Top"></i>' : ''}
      </div>
      
      <h3 class="note-title">${highlightedTitle}</h3>
      
      <div class="note-body">${highlightedContent}</div>
      
      <div class="note-footer">
        <div class="note-meta">
          <span class="note-date"><i class="fa-regular fa-calendar"></i> ${formattedDate}</span>
          <span class="note-reading-time"><i class="fa-regular fa-clock"></i> ~${readingTime} min read</span>
        </div>
        
        <div class="note-actions">
          <button class="card-action-btn pin-btn" title="${note.pinned ? 'Unpin note' : 'Pin note'}" onclick="event.stopPropagation(); window.togglePin(${note.id}, ${note.pinned})">
            <i class="fa-solid ${note.pinned ? 'fa-slash' : 'fa-thumbtack'}"></i>
          </button>
          <button class="card-action-btn edit-btn" title="Edit note" onclick="event.stopPropagation(); window.editNote(${note.id})">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="card-action-btn delete-btn" title="Delete note" onclick="event.stopPropagation(); window.deleteNote(${note.id}, '${escapeQuote(note.title)}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;

    targetContainer.appendChild(card);
  });
}

// Make callback handles available on the global window context since cards are rendered dynamically
window.togglePin = togglePin;
window.editNote = editNote;
window.deleteNote = deleteNote;

// ==========================================
// 6. Security & Utility Helper Actions
// ==========================================

/**
 * Escapes HTML characters to defend against XSS injection vulnerabilities
 */
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Cleans quotes to prevent string breaches in dynamic HTML inline handles
 */
function escapeQuote(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'");
}

/**
 * Displays beautifully animated responsive toast messages
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '<i class="fa-solid fa-circle-info"></i>';
  if (type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';
  if (type === 'error') icon = '<i class="fa-solid fa-circle-exclamation"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  toastContainer.appendChild(toast);

  // Automatically remove toast DOM element after slide-out animation terminates
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

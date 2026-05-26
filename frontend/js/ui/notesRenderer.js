import { CATEGORY_COLORS } from '../config/categories.js';
import { getState } from '../state/store.js';
import { escapeHTML, formatDate, estimateReadTime, highlightText } from '../utils/text.js';

function createCard(note) {
  const card = document.createElement('article');
  card.className = `glass-card note-card ${note.pinned ? 'pinned' : ''}`;
  card.dataset.id = String(note.id);
  const config = CATEGORY_COLORS[note.category] || CATEGORY_COLORS.General;
  card.style.setProperty('--cat-color', config.color);
  card.style.setProperty('--cat-color-light', config.light);
  const highlightedTitle = highlightText(escapeHTML(note.title), getState().currentSearchQuery);
  const highlightedContent = highlightText(escapeHTML(note.content), getState().currentSearchQuery);
  card.innerHTML = `
    <div class="note-header"><span class="note-badge">${config.icon} ${note.category}</span>
    ${note.pinned ? '<i class="fa-solid fa-thumbtack note-pin-indicator" title="Pinned to Top"></i>' : ''}</div>
    <h3 class="note-title">${highlightedTitle}</h3><div class="note-body">${highlightedContent}</div>
    <div class="note-footer"><div class="note-meta">
    <span class="note-date"><i class="fa-regular fa-calendar"></i> ${formatDate(note.created_at)}</span>
    <span class="note-reading-time"><i class="fa-regular fa-clock"></i> ~${estimateReadTime(note.content)} min read</span>
    </div><div class="note-actions">
    <button class="card-action-btn pin-btn" data-action="pin" title="${note.pinned ? 'Unpin note' : 'Pin note'}"><i class="fa-solid ${note.pinned ? 'fa-slash' : 'fa-thumbtack'}"></i></button>
    <button class="card-action-btn edit-btn" data-action="edit" title="Edit note"><i class="fa-solid fa-pen-to-square"></i></button>
    <button class="card-action-btn delete-btn" data-action="delete" title="Delete note"><i class="fa-solid fa-trash-can"></i></button>
    </div></div>`;
  return card;
}

export function renderNotesList(notes, container) {
  container.innerHTML = '';
  notes.forEach((note) => container.appendChild(createCard(note)));
}

import { elements } from '../dom/elements.js';
import { estimateReadTime } from '../utils/text.js';
import { showToast } from './toast.js';

function validateField(inputEl) {
  const parent = inputEl.parentElement;
  const valid = !!inputEl.value && !!inputEl.value.trim();
  parent.classList.toggle('invalid', !valid);
  return valid;
}

export function updateCharCounter() {
  const text = elements.noteContentInput.value;
  const readTime = estimateReadTime(text);
  elements.charCounter.textContent = `${text.length} chars | ~${readTime} min read`;
}

export function resetForm() {
  elements.noteForm.reset();
  elements.noteIdInput.value = '';
  elements.noteTitleInput.parentElement.classList.remove('invalid');
  elements.noteContentInput.parentElement.classList.remove('invalid');
  elements.formTitle.innerHTML = '<i class="fa-solid fa-file-pen"></i> Create New Note';
  elements.submitBtn.querySelector('.btn-text').textContent = 'Save Note';
  elements.cancelEditBtn.style.display = 'none';
  updateCharCounter();
}

export function fillFormForEdit(note) {
  elements.noteIdInput.value = note.id;
  elements.noteTitleInput.value = note.title;
  elements.noteCategorySelect.value = note.category;
  elements.noteContentInput.value = note.content;
  elements.notePinnedCheckbox.checked = note.pinned === 1;
  elements.formTitle.innerHTML = `<i class="fa-solid fa-edit"></i> Editing Note #${note.id}`;
  elements.submitBtn.querySelector('.btn-text').textContent = 'Update Note';
  elements.cancelEditBtn.style.display = 'block';
  updateCharCounter();
  elements.noteForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  elements.noteTitleInput.focus();
}

export function readFormPayload() {
  const titleOk = validateField(elements.noteTitleInput);
  const contentOk = validateField(elements.noteContentInput);
  if (!titleOk || !contentOk) {
    showToast('Please fix all empty fields before saving.', 'error');
    return null;
  }
  return {
    title: elements.noteTitleInput.value.trim(),
    category: elements.noteCategorySelect.value,
    content: elements.noteContentInput.value.trim(),
    pinned: elements.notePinnedCheckbox.checked
  };
}

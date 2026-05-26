const state = {
  allNotes: [],
  currentCategoryFilter: 'all',
  currentSearchQuery: '',
  activeView: 'grid'
};

export function getState() {
  return state;
}

export function setNotes(notes) {
  state.allNotes = Array.isArray(notes) ? notes : [];
}

export function setCategoryFilter(filter) {
  state.currentCategoryFilter = filter || 'all';
}

export function setSearchQuery(query) {
  state.currentSearchQuery = query || '';
}

export function setActiveView(view) {
  state.activeView = view || 'grid';
}

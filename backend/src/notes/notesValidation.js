function isFilledString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeOnCreate(body) {
  const title = isFilledString(body.title) ? body.title.trim() : '';
  const content = isFilledString(body.content) ? body.content.trim() : '';
  const category = isFilledString(body.category) ? body.category.trim() : 'General';
  const pinned = body.pinned ? 1 : 0;
  return { title, content, category, pinned };
}

function normalizeOnUpdate(body, existing) {
  const title = body.title === undefined ? existing.title : body.title;
  const content = body.content === undefined ? existing.content : body.content;
  const category = body.category === undefined ? existing.category : body.category;
  const pinned = body.pinned === undefined ? existing.pinned : (body.pinned ? 1 : 0);
  return {
    title: typeof title === 'string' ? title.trim() : title,
    content: typeof content === 'string' ? content.trim() : content,
    category: typeof category === 'string' ? category.trim() || 'General' : 'General',
    pinned
  };
}

module.exports = {
  isFilledString,
  normalizeOnCreate,
  normalizeOnUpdate
};

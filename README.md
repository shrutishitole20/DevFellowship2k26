# Smart Study Notes Manager

A simple full-stack notes management app built for the Dev Weekends Fellowship 2026.  
Users can create, edit, delete, search, and organize study notes with a clean and responsive UI.

---

## Features
- Create, update, and delete notes
- Search notes instantly
- Pin important notes
- Dark/Light theme toggle
- Grid & List view
- Responsive design
- SQLite database storage

---

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: SQLite3

---

## Project Structure

```text
study-notes-app/
├── backend/
│   ├── server.js
│   └── src/
│       ├── app/
│       ├── config/
│       ├── db/
│       ├── middleware/
│       └── notes/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── js/
│       ├── config/
│       ├── dom/
│       ├── services/
│       ├── state/
│       ├── ui/
│       ├── utils/
│       └── main.js
├── package.json
├── README.md
├── ANSWERS.md
└── database.db
```

---

## Run Project

### Install Dependencies
```bash
npm install
```

### Start Server
```bash
npm start
```

Open in browser:
```text
http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | /notes | Get all notes |
| POST | /notes | Create note |
| PUT | /notes/:id | Update note |
| DELETE | /notes/:id | Delete note |

---

## Author
Shruti Shitole
Yuvraj Jagtap

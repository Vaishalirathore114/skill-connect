# SkillConnect: Student Skills Exchange and Peer Learning Platform

Static web app (HTML, CSS, JavaScript). No server or build step. Data is stored in the visitor's browser (localStorage).

## Features
Registration and login, student profile, skill management (teach and learn), skill search, two-way matching engine (with related-skill matching such as web development, HTML, CSS, JavaScript), exchange requests, session scheduling, chat, ratings, admin panel.

## Run on Windows
Double-click `index.html`.

## Publish on GitHub Pages
1. Create a new repository on github.com (public).
2. Upload all files from this folder (drag and drop in "Add file > Upload files"), then commit.
3. Open Settings > Pages. Under Source choose "Deploy from a branch", branch `main`, folder `/ (root)`, and save.
4. After about a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.

## Demo accounts
Students: rahul@demo.com, priya@demo.com, aman@demo.com, neha@demo.com (password `demo123`). Admin: admin@skillconnect.com / `admin123`.

## Notes
Because GitHub Pages is static, accounts and messages live only in the browser that created them. To make data shared between users, replace the `db` functions in `app.js` with calls to a backend (for example Spring Boot + MySQL, as in the project plan). Passwords here are only encoded, not securely hashed, so this version is a demo.

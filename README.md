# Campus Incident Reporting System

A role-based web platform for reporting, triaging and auditing campus security
incidents, built for **AAMUSTED** (Akenten Appiah-Menka University of Skills
Training and Entrepreneurial Development), Ghana.

This is a modern re-implementation of my undergraduate research project at the
University of Education, Winneba. The original system (PHP/MySQL, 2022) is
documented in the accompanying study *Design and Implementation of a Web-Based
Incident Reporting System for AAMUSTED*; this repository rebuilds it on a
JavaScript stack with a cleaner data model and a proper audit trail.

---

## Why it exists

Campus incidents — theft, assault, vandalism, harassment, fire, medical
emergencies — were reported on paper. That process had five failure modes,
identified through stakeholder interviews with students, security officers and
administrative staff:

1. **Delayed reporting.** Limited access to reporting channels meant incidents
   surfaced long after they occurred.
2. **Inconsistent data.** Paper forms were frequently incomplete.
3. **Fragile records.** Physical files were vulnerable to loss, damage and
   unauthorised access.
4. **No analytics.** Trends across time, location and category were invisible.
5. **No transparency.** A reporter could not find out what happened to a report.

The system addresses each directly: structured submission, a status lifecycle
the reporter can follow, and an append-only update log.

---

## Features

**For reporters (students and staff)**
- Register and authenticate; passwords hashed with bcrypt
- File an incident with category, location, date, priority and description
- Attach evidence (image or document upload)
- Track status through the lifecycle: `pending → investigating → resolved → closed`
- Every report gets a human-readable reference code

**For administrators**
- Dashboard with incident statistics
- Review and filter all incidents
- Update status, assign an owner, and record admin notes
- User management
- Every change is written to `incident_updates` as an audit record

**Taxonomy**
- Categories: `theft`, `assault`, `vandalism`, `harassment`, `cybercrime`, `fire`, `medical`, `other`
- Priority: `low`, `medium`, `high`, `critical`
- Status: `pending`, `investigating`, `resolved`, `closed`

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, plain CSS |
| Backend | Node.js, Express 5 |
| Database | SQLite via `better-sqlite3` |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| Uploads | `multer` |

---

## Data model

```
users                incidents                     incident_updates
─────                ─────────                     ────────────────
id                   id                            id
name                 reference      (unique)       incident_id  → incidents.id
email    (unique)    reporter_id    → users.id     updated_by   → users.id
password (hashed)    title                         note
role     user|admin  description                   status_changed_to
student_id           category       (8 values)     created_at
department           location
created_at           incident_date
                     status         (4 values)
                     priority       (4 values)
                     evidence_file
                     admin_notes
                     assigned_to
                     resolved_at
                     created_at / updated_at
```

`incident_updates` is append-only: it preserves who changed what and when, so
the incident history cannot be silently rewritten.

---

## API

**Auth** — `/api/auth`

| Method | Route | Description |
|---|---|---|
| `POST` | `/register` | Create an account |
| `POST` | `/login` | Exchange credentials for a JWT |
| `GET` | `/me` | Current user (authenticated) |

**Incidents** — `/api/incidents`

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | List the caller's incidents |
| `GET` | `/:id` | Single incident with its update history |
| `POST` | `/` | File an incident (multipart, optional `evidence`) |

**Admin** — `/api/admin` (admin role required)

| Method | Route | Description |
|---|---|---|
| `GET` | `/stats` | Aggregate counts for the dashboard |
| `GET` | `/incidents` | All incidents |
| `PUT` | `/incidents/:id` | Update status, assignee or notes |
| `GET` | `/users` | List users |

---

## Running locally

**Requirements:** Node.js 18 or later.

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env          # then set a real JWT_SECRET
npm run dev                   # http://localhost:5001

# 2. Frontend (separate terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

The SQLite database (`aamusted.db`) and its schema are created automatically on
first run — there is no migration step.

### Environment

| Variable | Purpose |
|---|---|
| `PORT` | Backend port (default `5001`) |
| `JWT_SECRET` | Signing secret for tokens — **set your own** |

---

## Project status

Working prototype. Known gaps, in the order I would address them:

- Email notifications on status change (present in the original PHP system)
- Server-side validation of upload MIME types and size limits
- Pagination on the admin incident list
- Automated tests

---

## Background

The original study evaluated the paper-to-digital transition with black-box
testing and user acceptance testing across 20 stakeholders from different
departments, and reported improved efficiency, higher data accuracy and
increased reporting participation.

Undergraduate research project, Department of Information Technology Education,
University of Education, Winneba, October 2022, with Esther Aboagye Danquah and
Marfo Frank Kwame.

## Author

**Abdul Ganiyu Abdul Latif** — [GitHub](https://github.com/Abdulking9) · [LinkedIn](https://linkedin.com/in/abdulganiyuabdullatif)

## Licence

MIT

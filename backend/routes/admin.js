const express = require('express');
const db = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate, adminOnly);

// Dashboard stats
router.get('/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM incidents').get().count;
  const pending = db.prepare("SELECT COUNT(*) as count FROM incidents WHERE status = 'pending'").get().count;
  const investigating = db.prepare("SELECT COUNT(*) as count FROM incidents WHERE status = 'investigating'").get().count;
  const resolved = db.prepare("SELECT COUNT(*) as count FROM incidents WHERE status = 'resolved'").get().count;
  const closed = db.prepare("SELECT COUNT(*) as count FROM incidents WHERE status = 'closed'").get().count;
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get().count;

  const byCategory = db
    .prepare('SELECT category, COUNT(*) as count FROM incidents GROUP BY category')
    .all();

  const recent = db
    .prepare(`SELECT i.*, u.name as reporter_name FROM incidents i
              JOIN users u ON i.reporter_id = u.id
              ORDER BY i.created_at DESC LIMIT 5`)
    .all();

  res.json({ total, pending, investigating, resolved, closed, totalUsers, byCategory, recent });
});

// All incidents
router.get('/incidents', (req, res) => {
  const { status, category, priority } = req.query;
  let query = `SELECT i.*, u.name as reporter_name, u.email as reporter_email, u.student_id
               FROM incidents i JOIN users u ON i.reporter_id = u.id WHERE 1=1`;
  const params = [];
  if (status) { query += ' AND i.status = ?'; params.push(status); }
  if (category) { query += ' AND i.category = ?'; params.push(category); }
  if (priority) { query += ' AND i.priority = ?'; params.push(priority); }
  query += ' ORDER BY i.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

// Update incident status / notes
router.put('/incidents/:id', (req, res) => {
  const { status, priority, admin_notes, assigned_to } = req.body;
  const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const resolved_at = status === 'resolved' || status === 'closed'
    ? new Date().toISOString() : incident.resolved_at;

  db.prepare(`UPDATE incidents SET status = ?, priority = ?, admin_notes = ?, assigned_to = ?,
              resolved_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(
      status ?? incident.status,
      priority ?? incident.priority,
      admin_notes ?? incident.admin_notes,
      assigned_to ?? incident.assigned_to,
      resolved_at,
      incident.id
    );

  if (req.body.note) {
    db.prepare('INSERT INTO incident_updates (incident_id, updated_by, note, status_changed_to) VALUES (?, ?, ?, ?)')
      .run(incident.id, req.user.id, req.body.note, status ?? null);
  }

  res.json(db.prepare('SELECT * FROM incidents WHERE id = ?').get(incident.id));
});

// All users
router.get('/users', (req, res) => {
  res.json(db.prepare("SELECT id, name, email, role, student_id, department, created_at FROM users ORDER BY created_at DESC").all());
});

module.exports = router;

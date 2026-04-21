const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const generateRef = () => `INC-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

router.use(authenticate);

// Get current user's incidents
router.get('/', (req, res) => {
  const incidents = db
    .prepare('SELECT * FROM incidents WHERE reporter_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json(incidents);
});

// Get single incident (reporter or admin)
router.get('/:id', (req, res) => {
  const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  if (incident.reporter_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Access denied' });

  const updates = db
    .prepare(`SELECT iu.*, u.name as updated_by_name FROM incident_updates iu
              JOIN users u ON iu.updated_by = u.id
              WHERE iu.incident_id = ? ORDER BY iu.created_at ASC`)
    .all(incident.id);
  res.json({ ...incident, updates });
});

// Report a new incident
router.post('/', upload.single('evidence'), (req, res) => {
  const { title, description, category, location, incident_date, priority } = req.body;
  if (!title || !description || !category || !location || !incident_date)
    return res.status(400).json({ error: 'All required fields must be filled' });

  const reference = generateRef();
  const evidence_file = req.file ? req.file.filename : null;

  const result = db
    .prepare(`INSERT INTO incidents (reference, reporter_id, title, description, category, location, incident_date, priority, evidence_file)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(reference, req.user.id, title, description, category, location, incident_date, priority || 'medium', evidence_file);

  const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(incident);
});

module.exports = router;

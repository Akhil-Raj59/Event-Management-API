const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { validateCreateEvent } = require('../utils/validators');

exports.createEvent = async (req, res, next) => {
  try {
    const errors = validateCreateEvent(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const { title, date_time, location, capacity } = req.body;
    const id = uuidv4();
    await db.query(
      `INSERT INTO events (id, title, event_datetime, location, capacity)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, title, new Date(date_time).toISOString(), location, capacity]
    );
    res.status(201).json({ eventId: id });
  } catch (err) {
    next(err);
  }
};

exports.getEventDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const e = await db.query('SELECT * FROM events WHERE id=$1', [id]);
    if (!e.rowCount) return res.status(404).json({ error: 'Event not found' });

    const users = await db.query(
      `SELECT u.id, u.name, u.email FROM registrations r
       JOIN users u ON u.id = r.user_id WHERE r.event_id=$1`,
      [id]
    );
    res.json({ ...e.rows[0], registrations: users.rows });
  } catch (err) {
    next(err);
  }
};

exports.registerForEvent = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { id } = req.params;
    const { userId, name, email } = req.body;
    await client.query('BEGIN');

    const eventRes = await client.query('SELECT * FROM events WHERE id=$1 FOR UPDATE', [id]);
    if (!eventRes.rowCount) throw { status: 404, message: 'Event not found' };
    const event = eventRes.rows[0];

    if (new Date(event.event_datetime) <= new Date())
      throw { status: 400, message: 'Cannot register for past event' };

    let uid = userId;
    if (!uid) {
      const ex = await client.query('SELECT id FROM users WHERE email=$1', [email]);
      if (ex.rowCount) uid = ex.rows[0].id;
      else {
        uid = uuidv4();
        await client.query('INSERT INTO users (id, name, email) VALUES ($1, $2, $3)', [
          uid,
          name,
          email
        ]);
      }
    }

    const dup = await client.query(
      'SELECT 1 FROM registrations WHERE event_id=$1 AND user_id=$2',
      [id, uid]
    );
    if (dup.rowCount) throw { status: 409, message: 'Already registered' };

    const count = await client.query(
      'SELECT COUNT(*)::int AS c FROM registrations WHERE event_id=$1',
      [id]
    );
    if (count.rows[0].c >= event.capacity)
      throw { status: 400, message: 'Event is full' };

    const regId = uuidv4();
    await client.query(
      'INSERT INTO registrations (id, event_id, user_id) VALUES ($1, $2, $3)',
      [regId, id, uid]
    );

    await client.query('COMMIT');
    res.status(201).json({ registrationId: regId, userId: uid, eventId: id });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
};

exports.cancelRegistration = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { id, userId } = req.params;
    await client.query('BEGIN');

    const reg = await client.query(
      'SELECT id FROM registrations WHERE event_id=$1 AND user_id=$2 FOR UPDATE',
      [id, userId]
    );
    if (!reg.rowCount) throw { status: 404, message: 'Registration not found' };

    await client.query('DELETE FROM registrations WHERE id=$1', [reg.rows[0].id]);
    await client.query('COMMIT');
    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
};

exports.listUpcomingEvents = async (_, res, next) => {
  try {
    const now = new Date().toISOString();
    const events = await db.query(
      `SELECT * FROM events WHERE event_datetime>$1 ORDER BY event_datetime ASC, location ASC`,
      [now]
    );
    res.json({ events: events.rows });
  } catch (err) {
    next(err);
  }
};

exports.getEventStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ev = await db.query('SELECT capacity FROM events WHERE id=$1', [id]);
    if (!ev.rowCount) return res.status(404).json({ error: 'Event not found' });

    const cap = ev.rows[0].capacity;
    const c = await db.query(
      'SELECT COUNT(*)::int AS cnt FROM registrations WHERE event_id=$1',
      [id]
    );
    const total = c.rows[0].cnt;
    res.json({
      totalRegistrations: total,
      remainingCapacity: cap - total,
      percentageCapacityUsed: Math.round((total / cap) * 10000) / 100
    });
  } catch (err) {
    next(err);
  }
};
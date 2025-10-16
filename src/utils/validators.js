function isISODateTime(str) {
  const d = new Date(str);
  return !isNaN(d.getTime());
}

function validateCreateEvent(body) {
  const { title, event_datetime, location, capacity } = body;
  const errors = [];
  if (!title) errors.push('title required');
  if (!event_datetime || !isISODateTime(event_datetime)) errors.push('event_datetime invalid');
  if (!location) errors.push('location required');
  if (!Number.isInteger(capacity) || capacity <= 0 || capacity > 1000)
    errors.push('capacity must be 1–1000');
  return errors;
}

module.exports = { validateCreateEvent };

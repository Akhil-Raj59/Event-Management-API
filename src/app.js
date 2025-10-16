const express = require('express');
const bodyParser = require('body-parser');
const eventsRouter = require('./routes/events');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('Event Management API is running 🚀');
});

app.use('/api/events', eventsRouter);
app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.use(errorHandler);

module.exports = app;

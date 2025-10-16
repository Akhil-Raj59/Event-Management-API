const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventsController');

router.post('/', controller.createEvent);
router.get('/', controller.listUpcomingEvents);
router.get('/:id', controller.getEventDetails);
router.post('/:id/register', controller.registerForEvent);
router.delete('/:id/register/:userId', controller.cancelRegistration);
router.get('/:id/stats', controller.getEventStats);

module.exports = router;

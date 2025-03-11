const express = require('express');
const router = express.Router();
const pollController = require('../controllers/poll.controller');

// Create a new poll
router.post('/', pollController.createPoll);

// Get poll by ID
router.get('/:pollId', pollController.getPollById);

// Vote on a poll
router.post('/:pollId/vote', pollController.votePoll);

// Add reaction to a poll
router.post('/:pollId/reaction', pollController.addReaction);

// Get poll results (only available after expiration if hideResults is true)
router.get('/:pollId/results', pollController.getPollResults);

module.exports = router;

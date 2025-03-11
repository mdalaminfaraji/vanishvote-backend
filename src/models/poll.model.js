const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  votes: {
    type: Number,
    default: 0
  }
});

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  pollId: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(10)
  },
  options: [optionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  hideResults: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  reactions: {
    trending: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  // Store IPs to prevent multiple votes from the same person
  // Only store hashed IPs for privacy
  voterIps: {
    type: [String],
    select: false // Don't return this field by default
  }
});

// Index for finding expired polls
pollSchema.index({ expiresAt: 1 });

// Pre-save middleware to set expiration date if not provided
pollSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Default to 24 hours from now
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Virtual property to check if the poll has expired
pollSchema.virtual('isExpired').get(function() {
  return Date.now() > this.expiresAt;
});

// Method to increment vote count for a specific option
pollSchema.methods.vote = function(optionIndex) {
  if (optionIndex >= 0 && optionIndex < this.options.length) {
    this.options[optionIndex].votes += 1;
    return true;
  }
  return false;
};

// Method to add a reaction to the poll
pollSchema.methods.addReaction = function(reactionType) {
  if (reactionType === 'trending') {
    this.reactions.trending += 1;
    return true;
  } else if (reactionType === 'like') {
    this.reactions.likes += 1;
    return true;
  }
  return false;
};

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;

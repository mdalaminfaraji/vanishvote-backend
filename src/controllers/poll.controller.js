const Poll = require("../models/poll.model");
const { createError } = require("../utils/error.utils");
const { validatePoll, validateVote } = require("../utils/validation.utils");
const { hashIP } = require("../utils/privacy.utils");

// Create a new poll
exports.createPoll = async (req, res, next) => {
  try {
    const { error } = validatePoll(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const { title, options, expiresIn, hideResults, isPrivate } = req.body;

    // Calculate expiration date based on user selection
    let expirationMs;
    switch (expiresIn) {
      case "1hour":
        expirationMs = 60 * 60 * 1000; // 1 hour
        break;
      case "12hours":
        expirationMs = 12 * 60 * 60 * 1000; // 12 hours
        break;
      case "24hours":
      default:
        expirationMs = 24 * 60 * 60 * 1000; // 24 hours (default)
    }

    // Format options array
    const formattedOptions = options.map((option) => ({ text: option }));

    // Create new poll
    const poll = new Poll({
      title,
      options: formattedOptions,
      expiresAt: new Date(Date.now() + expirationMs),
      hideResults: hideResults || false,
      isPrivate: isPrivate || true,
    });

    const savedPoll = await poll.save();

    res.status(201).json({
      success: true,
      data: {
        pollId: savedPoll.pollId,
        title: savedPoll.title,
        options: savedPoll.options,
        expiresAt: savedPoll.expiresAt,
        hideResults: savedPoll.hideResults,
        isPrivate: savedPoll.isPrivate,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get poll by ID
exports.getPollById = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findOne({ pollId });

    if (!poll) {
      return next(createError(404, "Poll not found"));
    }

    // Check if poll has expired
    if (Date.now() > new Date(poll.expiresAt).getTime()) {
      return next(
        createError(410, "This poll has expired and is no longer available")
      );
    }

    // If hideResults is true and poll is still active, don't send vote counts
    const response = {
      success: true,
      data: {
        pollId: poll.pollId,
        title: poll.title,
        options: poll.hideResults
          ? poll.options.map((opt) => ({ _id: opt._id, text: opt.text }))
          : poll.options,
        expiresAt: poll.expiresAt,
        hideResults: poll.hideResults,
        isPrivate: poll.isPrivate,
        reactions: poll.reactions,
      },
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
};

// Vote on a poll
exports.votePoll = async (req, res, next) => {
  try {
    const { pollId } = req.params;
    const { optionId } = req.body;

    // Validate request
    const { error } = validateVote(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    // Find the poll
    const poll = await Poll.findOne({ pollId }).select("+voterIps");

    if (!poll) {
      return next(createError(404, "Poll not found"));
    }

    // Check if poll has expired
    if (Date.now() > new Date(poll.expiresAt).getTime()) {
      return next(
        createError(
          410,
          "This poll has expired and votes are no longer accepted"
        )
      );
    }

    // Get user IP and hash it for privacy
    const ip = req.ip || req.connection.remoteAddress;
    const hashedIp = hashIP(ip);

    // Check if user has already voted
    // if (poll.voterIps.includes(hashedIp)) {
    //   return next(createError(403, 'You have already voted on this poll'));
    // }

    // Find the option to vote for
    const optionIndex = poll.options.findIndex(
      (opt) => opt._id.toString() === optionId
    );

    if (optionIndex === -1) {
      return next(createError(404, "Option not found in this poll"));
    }

    // Increment vote count and add user IP to the list
    poll.options[optionIndex].votes += 1;
    poll.voterIps.push(hashedIp);

    await poll.save();

    // Return poll data (without showing results if hideResults is true)
    const response = {
      success: true,
      data: {
        pollId: poll.pollId,
        title: poll.title,
        options: poll.hideResults
          ? poll.options.map((opt) => ({ _id: opt._id, text: opt.text }))
          : poll.options,
        expiresAt: poll.expiresAt,
        message: "Vote recorded successfully",
      },
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
};

// Add reaction to a poll
exports.addReaction = async (req, res, next) => {
  try {
    const { pollId } = req.params;
    const { reactionType } = req.body;

    if (!reactionType || !["trending", "like"].includes(reactionType)) {
      return next(
        createError(400, 'Invalid reaction type. Must be "trending" or "like"')
      );
    }

    const poll = await Poll.findOne({ pollId });

    if (!poll) {
      return next(createError(404, "Poll not found"));
    }

    // Check if poll has expired
    if (Date.now() > new Date(poll.expiresAt).getTime()) {
      return next(
        createError(
          410,
          "This poll has expired and reactions are no longer accepted"
        )
      );
    }

    // Increment the appropriate reaction counter
    if (reactionType === "trending") {
      poll.reactions.trending += 1;
    } else {
      poll.reactions.likes += 1;
    }

    await poll.save();

    res.json({
      success: true,
      data: {
        pollId: poll.pollId,
        reactions: poll.reactions,
        message: "Reaction added successfully",
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get results for a poll (even if hideResults is true)
exports.getPollResults = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findOne({ pollId });

    if (!poll) {
      return next(createError(404, "Poll not found"));
    }

    // Check if poll has expired or if hideResults is false
    if (poll.hideResults && Date.now() < new Date(poll.expiresAt).getTime()) {
      return next(
        createError(403, "Results for this poll are hidden until it expires")
      );
    }

    res.json({
      success: true,
      data: {
        pollId: poll.pollId,
        title: poll.title,
        options: poll.options,
        expiresAt: poll.expiresAt,
        reactions: poll.reactions,
        isExpired: Date.now() > new Date(poll.expiresAt).getTime(),
      },
    });
  } catch (err) {
    next(err);
  }
};

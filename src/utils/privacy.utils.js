const crypto = require('crypto');

/**
 * Hash an IP address for privacy
 * This is used to prevent multiple votes without storing actual IP addresses
 * @param {string} ip - IP address to hash
 * @returns {string} - Hashed IP
 */
exports.hashIP = (ip) => {
  // Add a salt to make it more secure (should be in environment variables in production)
  const salt = 'vanishvote-salt';
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
};

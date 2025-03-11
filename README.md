# VanishVote Backend

A simple RESTful API for creating anonymous polls that expire after a set time.

## Features

- Create & Share Polls
  - Multiple-choice or yes/no polls
  - Each poll gets a unique link for sharing
  - Polls expire after a set time (1 hour, 12 hours, 24 hours)

- Vote & View Results
  - Anonymous voting
  - Option to hide results until the poll ends
  - Basic reactions: (🔥 Trending, 👍 Like)

- Privacy & Simplicity
  - No login required
  - Private polls (only accessible via link)

## Tech Stack

- Node.js/Express - Backend framework
- MongoDB - Database
- Various middleware for security and validation

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/vanishvote
   NODE_ENV=development
   ```
4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Polls

- `POST /api/polls` - Create a new poll
- `GET /api/polls/:pollId` - Get poll by ID
- `POST /api/polls/:pollId/vote` - Vote on a poll
- `POST /api/polls/:pollId/reaction` - Add reaction to a poll
- `GET /api/polls/:pollId/results` - Get poll results (respects the hideResults setting)

## Request & Response Examples

### Create a Poll

**Request:**
```json
POST /api/polls
{
  "title": "What's your favorite programming language?",
  "options": ["JavaScript", "Python", "Java", "C++"],
  "expiresIn": "24hours",
  "hideResults": false,
  "isPrivate": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pollId": "abc123xyz",
    "title": "What's your favorite programming language?",
    "options": [
      { "_id": "60d21b4667d0d8992e610c85", "text": "JavaScript", "votes": 0 },
      { "_id": "60d21b4667d0d8992e610c86", "text": "Python", "votes": 0 },
      { "_id": "60d21b4667d0d8992e610c87", "text": "Java", "votes": 0 },
      { "_id": "60d21b4667d0d8992e610c88", "text": "C++", "votes": 0 }
    ],
    "expiresAt": "2023-06-22T15:30:45.123Z",
    "hideResults": false,
    "isPrivate": true
  }
}
```

### Vote on a Poll

**Request:**
```json
POST /api/polls/abc123xyz/vote
{
  "optionId": "60d21b4667d0d8992e610c85"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pollId": "abc123xyz",
    "title": "What's your favorite programming language?",
    "options": [
      { "_id": "60d21b4667d0d8992e610c85", "text": "JavaScript", "votes": 1 },
      { "_id": "60d21b4667d0d8992e610c86", "text": "Python", "votes": 0 },
      { "_id": "60d21b4667d0d8992e610c87", "text": "Java", "votes": 0 },
      { "_id": "60d21b4667d0d8992e610c88", "text": "C++", "votes": 0 }
    ],
    "expiresAt": "2023-06-22T15:30:45.123Z",
    "message": "Vote recorded successfully"
  }
}
```

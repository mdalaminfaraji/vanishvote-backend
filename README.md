# VanishVote Backend

VanishVote is an anonymous polling application that allows users to create polls that automatically expire after a set time. This repository contains the backend API built with Node.js, Express, and MongoDB.

## Features

- **Create & Share Polls**
  - Multiple-choice polls with customizable options
  - Each poll gets a unique ID for sharing
  - Polls expire after a set time (1 hour, 12 hours, 24 hours)

- **Vote & View Results**
  - Anonymous voting with IP-based duplicate prevention
  - Option to hide results until the poll ends
  - Support for reactions: (🔥 Trending, 👍 Like)

- **Privacy & Security**
  - No login required
  - Private polls (only accessible via direct link)
  - Secure CORS configuration
  - Data validation and sanitization

## Technology Stack

- **Node.js/Express**: Backend framework
- **MongoDB/Mongoose**: Database and ODM
- **Joi**: Request validation
- **Helmet**: Security headers
- **CORS**: Cross-Origin Resource Sharing
- **Morgan**: HTTP request logger
- **Dotenv**: Environment variable management
- **Nodemon**: Development server with hot reload

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16.0.0 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd vanishvote-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/vanishvote
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The server will run on [http://localhost:5000](http://localhost:5000) by default.

## API Endpoints

### Polls

#### Create a Poll
- **URL**: `POST /api/polls`
- **Body**:
  ```json
  {
    "title": "Your poll question",
    "options": [
      { "text": "Option 1" },
      { "text": "Option 2" },
      { "text": "Option 3" }
    ],
    "expiresAt": "2025-03-12T12:00:00Z",
    "hideResults": false,
    "isPrivate": false
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "pollId": "abc123def456",
      "title": "Your poll question",
      "options": [
        { "_id": "option1Id", "text": "Option 1" },
        { "_id": "option2Id", "text": "Option 2" },
        { "_id": "option3Id", "text": "Option 3" }
      ],
      "expiresAt": "2025-03-12T12:00:00Z",
      "hideResults": false,
      "isPrivate": false
    }
  }
  ```

#### Get Poll by ID
- **URL**: `GET /api/polls/:pollId`
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "pollId": "abc123def456",
      "title": "Your poll question",
      "options": [
        { "_id": "option1Id", "text": "Option 1", "votes": 3 },
        { "_id": "option2Id", "text": "Option 2", "votes": 1 },
        { "_id": "option3Id", "text": "Option 3", "votes": 0 }
      ],
      "expiresAt": "2025-03-12T12:00:00Z",
      "hideResults": false,
      "isPrivate": false,
      "reactions": {
        "trending": 2,
        "like": 5
      }
    }
  }
  ```
- **Note**: If `hideResults` is true and the poll is still active, the vote counts will not be included in the response.

#### Vote on a Poll
- **URL**: `POST /api/polls/:pollId/vote`
- **Body**:
  ```json
  {
    "optionId": "option1Id"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "pollId": "abc123def456",
      "title": "Your poll question",
      "options": [
        { "_id": "option1Id", "text": "Option 1", "votes": 4 },
        { "_id": "option2Id", "text": "Option 2", "votes": 1 },
        { "_id": "option3Id", "text": "Option 3", "votes": 0 }
      ],
      "expiresAt": "2025-03-12T12:00:00Z",
      "hideResults": false,
      "isPrivate": false
    }
  }
  ```
- **Error Cases**:
  - 403: "You have already voted on this poll" (if the same IP attempts to vote twice)
  - 404: "Poll not found" or "Option not found in this poll"
  - 410: "This poll has expired and votes are no longer accepted"

#### Add Reaction to a Poll
- **URL**: `POST /api/polls/:pollId/reaction`
- **Body**:
  ```json
  {
    "reactionType": "trending" // or "like"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "reactions": {
        "trending": 3,
        "like": 5
      }
    }
  }
  ```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

- **200 OK**: The request was successful
- **400 Bad Request**: Invalid request body or parameters
- **403 Forbidden**: The request is understood but not allowed (e.g., duplicate votes)
- **404 Not Found**: The requested resource does not exist
- **410 Gone**: The resource existed but is no longer available (e.g., expired polls)
- **500 Internal Server Error**: An unexpected server error occurred

Error responses follow this format:
```json
{
  "success": false,
  "error": {
    "message": "Error message here",
    "code": "ERROR_CODE"
  }
}
```

## System Architecture

```
src/
├── config/         # Configuration files
│   └── db.js       # MongoDB connection
├── controllers/    # Request handlers
│   └── poll.controller.js
├── middleware/     # Express middleware
│   ├── error.middleware.js
│   └── validator.middleware.js
├── models/         # Mongoose models
│   └── poll.model.js
├── routes/         # API routes
│   └── poll.routes.js
├── utils/          # Utility functions
│   ├── errorHandler.js
│   └── validation.js
└── server.js       # Main Express application
```

## CORS Configuration

The backend is configured to accept cross-origin requests from the frontend application running on http://localhost:3000. If you need to allow requests from other origins, modify the CORS configuration in `server.js`.

## Security Features

- **IP Hashing**: User IP addresses are hashed for privacy before being stored (to prevent duplicate votes)
- **Helmet**: HTTP headers are secured using the Helmet middleware
- **Input Validation**: All user inputs are validated using Joi schemas
- **Error Sanitization**: Error messages are sanitized to prevent information leakage

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

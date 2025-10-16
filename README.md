
# Event Management API

A RESTful API for managing events, built with **Node.js, Express, and PostgreSQL**. It allows users to create events, register/cancel registrations, list upcoming events, and view event statistics. Business rules such as capacity limits and preventing duplicate registrations are enforced.

## Features

- Create, view, and list upcoming events
- Register and cancel user registrations
- Event statistics: total registrations, remaining capacity, percentage used
- Data validation and error handling
- Many-to-many relationship between users and events in PostgreSQL

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Unique IDs:** UUID
- **Middleware:** Body-parser, custom error handling

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/USERNAME/event-management-api.git
cd event-management-api
````

2. **Install dependencies**

```bash
npm install
```

3. **Set up PostgreSQL database**

```sql
CREATE DATABASE eventdb;
-- Run your migrations to create tables
```

4. **Configure environment variables**

Create a `.env` file in the root:

```
PORT=3000
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventdb
```

5. **Run the server**

```bash
npm run dev
```

Server will run on `http://localhost:3000`.

## API Endpoints

| Method | Endpoint                           | Description                  |
| ------ | ---------------------------------- | ---------------------------- |
| POST   | `/api/events`                      | Create a new event           |
| GET    | `/api/events`                      | List upcoming events         |
| GET    | `/api/events/:id`                  | Get event details by ID      |
| POST   | `/api/events/:id/register`         | Register a user for an event |
| DELETE | `/api/events/:id/register/:userId` | Cancel a user’s registration |
| GET    | `/api/events/:id/stats`            | Get event statistics         |

### Example: Create Event

```json
POST /api/events
{
  "title": "AI Workshop",
  "date_time": "2025-11-01T10:00:00",
  "location": "Delhi",
  "capacity": 200
}
```

### Example: Register User

```json
POST /api/events/:id/register
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

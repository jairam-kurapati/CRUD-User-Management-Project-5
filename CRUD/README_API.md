# CRUD User Management API Reference

This reference document describes the available REST API endpoints for the CRUD User Management application.

## Base URL

```text
http://127.0.0.1:5000/
```

## Endpoints

### GET /api/users

Returns the full list of users.

#### Response

```json
[
  {
    "id": 1,
    "name": "Raj",
    "age": 25,
    "prediction": "Young Professional"
  }
]
```

### POST /api/users

Create a new user.

#### Request Body

```json
{
  "name": "Raj",
  "age": 25
}
```

#### Response

```json
{
  "id": 1,
  "name": "Raj",
  "age": 25,
  "prediction": "Young Professional"
}
```

### PUT /api/users/<id>

Update an existing user.

#### Request Body

```json
{
  "name": "Raj Updated",
  "age": 26
}
```

#### Response

```json
{
  "id": 1,
  "name": "Raj Updated",
  "age": 26,
  "prediction": "Young Professional"
}
```

### DELETE /api/users/<id>

Delete a user by ID.

#### Response

```json
{
  "message": "User deleted successfully."
}
```

### GET /api/predict/<age>

Generate an age category prediction without creating a user.

#### Response

```json
{
  "age": 25,
  "prediction": "Young Professional"
}
```

## Notes

- All API responses return JSON.
- The app currently uses in-memory storage only; data resets when the server restarts.
- Use the UI for read/edit/delete operations, or consume the API directly for automation.

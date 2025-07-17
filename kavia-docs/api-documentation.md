# Notes Backend API Documentation

This document covers all RESTful API endpoints, request/response schemas, authentication requirements, and sample usages for the notes backend Express API. It is based on the backend implementation and OpenAPI schema.

## Base URL

- Local: `http://localhost:3001`
- API Docs: `/docs` (Swagger UI if running)
- All endpoints are prefixed relative to the base URL.

---

## Table of Contents

1. [Authentication](#authentication)
   - [User Signup](#user-signup)
   - [User Login](#user-login)
2. [Notes Management (Protected Routes)](#notes-management-protected-routes)
   - [Create Note](#create-note)
   - [Get All Notes](#get-all-notes)
   - [Get Note By ID](#get-note-by-id)
   - [Update Note](#update-note)
   - [Delete Note](#delete-note)
3. [Health Check](#health-check)
4. [Authentication Model](#authentication-model)
5. [Example JWT Workflow](#example-jwt-workflow)
6. [HTTP Status Codes](#http-status-codes)

---

## Authentication

### User Signup

- **POST** `/api/signup`
- **Public**: No authentication required.

#### Request Body

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

#### Responses

- `201 Created`  
  ```json
  {
    "id": 1,
    "username": "user1",
    "created_at": "2024-06-10T13:25:34.000Z"
  }
  ```
- `400 Bad Request`  
  ```json
  { "message": "Username and password are required" }
  ```
- `409 Conflict`  
  ```json
  { "message": "Username already exists" }
  ```

#### Usage Example (cURL)

```sh
curl -X POST http://localhost:3001/api/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"mypassword"}'
```

---

### User Login

- **POST** `/api/login`
- **Public**: No authentication required.

#### Request Body

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

#### Responses

- `200 OK`
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "username": "alice"
    }
  }
  ```
- `401 Unauthorized`
  ```json
  { "message": "Invalid username or password" }
  ```

#### Usage Example (cURL)

```sh
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"mypassword"}'
```

---

## Notes Management (Protected Routes)

> All notes endpoints require authentication.
> 
> The client must send a header:
> 
>     Authorization: Bearer <JWT_TOKEN>
>
> The token is provided by the `/api/login` endpoint.

---

### Create Note

- **POST** `/api/notes`

#### Request Headers

- `Authorization: Bearer <JWT_TOKEN>`

#### Request Body

```json
{
  "title": "My Note Title (required)",
  "content": "Note details (optional)"
}
```

#### Responses

- `201 Created`
  ```json
  {
    "id": 2,
    "user_id": 1,
    "title": "My Note Title",
    "content": "Note details",
    "created_at": "2024-06-10T13:50:01.000Z",
    "updated_at": "2024-06-10T13:50:01.000Z"
  }
  ```
- `400 Bad Request`
  ```json
  { "message": "Title is required" }
  ```
- `401 Unauthorized`
  ```json
  { "message": "Missing or malformed Authorization header" }
  ```

#### Usage Example (cURL)

```sh
curl -X POST http://localhost:3001/api/notes \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My first note", "content":"Hello, world!"}'
```

---

### Get All Notes

- **GET** `/api/notes`
- **Optional Query**: `?q=search_term` to search notes by content or title.

#### Request Headers

- `Authorization: Bearer <JWT_TOKEN>`

#### Responses

- `200 OK`: Returns an array of notes (may be empty)
  ```json
  [
    {
      "id": 2,
      "user_id": 1,
      "title": "My Note Title",
      "content": "Note details",
      "created_at": "2024-06-10T13:50:01.000Z",
      "updated_at": "2024-06-10T13:55:10.000Z"
    }
  ]
  ```
- `401 Unauthorized`
  ```json
  { "message": "Missing or malformed Authorization header" }
  ```

#### Usage Example (cURL)

```sh
curl "http://localhost:3001/api/notes?q=meeting" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### Get Note By ID

- **GET** `/api/notes/{id}`

#### Request Headers

- `Authorization: Bearer <JWT_TOKEN>`

#### Path Parameters

- `id` – Note ID (integer)

#### Responses

- `200 OK`
  ```json
  {
    "id": 2,
    "user_id": 1,
    "title": "My Note Title",
    "content": "Note details",
    "created_at": "2024-06-10T13:50:01.000Z",
    "updated_at": "2024-06-10T13:55:10.000Z"
  }
  ```
- `404 Not Found`
  ```json
  { "message": "Note not found" }
  ```
- `401 Unauthorized`
  ```json
  { "message": "Missing or malformed Authorization header" }
  ```

#### Usage Example (cURL)

```sh
curl http://localhost:3001/api/notes/2 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### Update Note

- **PUT** `/api/notes/{id}`

#### Request Headers

- `Authorization: Bearer <JWT_TOKEN>`

#### Path Parameters

- `id` – Note ID (integer)

#### Request Body

```json
{
  "title": "New title (optional)",
  "content": "New content (optional)"
}
```

#### Responses

- `200 OK`: Returns updated note object
- `404 Not Found`
  ```json
  { "message": "Note not found" }
  ```
- `401 Unauthorized`
  ```json
  { "message": "Missing or malformed Authorization header" }
  ```

#### Usage Example (cURL)

```sh
curl -X PUT http://localhost:3001/api/notes/2 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title"}'
```

---

### Delete Note

- **DELETE** `/api/notes/{id}`

#### Request Headers

- `Authorization: Bearer <JWT_TOKEN>`

#### Path Parameters

- `id` – Note ID (integer)

#### Responses

- `204 No Content`: Note deleted successfully (response is empty).
- `404 Not Found`
  ```json
  { "message": "Note not found" }
  ```
- `401 Unauthorized`
  ```json
  { "message": "Missing or malformed Authorization header" }
  ```

#### Usage Example (cURL)

```sh
curl -X DELETE http://localhost:3001/api/notes/2 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## Health Check

- **GET** `/`
- **Public**

#### Responses

- `200 OK`
  ```json
  {
    "status": "ok",
    "message": "Service is healthy",
    "timestamp": "2024-06-10T13:25:34.000Z",
    "environment": "development"
  }
  ```

---

## Authentication Model

All endpoints under `/api/notes` require a JWT (JSON Web Token) authentication.  
Tokens are provided in the response from `/api/login` and must be sent in the `Authorization` header as a Bearer token.

### JWT Example

- Header: `Authorization: Bearer <JWT_TOKEN>`
- JWT Payload:
  ```json
  {
    "id": 1,
    "username": "alice",
    "iat": 1718008060,
    "exp": 1718612860
  }
  ```
- Tokens expire after 7 days.

### Error Cases

- Missing header, malformed header, or invalid/expired token will return `401 Unauthorized`.

---

## Example JWT Workflow

1. **Register**
2. **Login:** Get JWT token.
3. **Access Notes:** Pass `Authorization: Bearer <JWT_TOKEN>` in your requests.

---

## HTTP Status Codes

- `200 OK`: Request succeeded (GET, PUT)
- `201 Created`: Resource created (POST)
- `204 No Content`: Resource deleted
- `400 Bad Request`: Input validation error or missing required fields
- `401 Unauthorized`: Authentication missing or invalid
- `404 Not Found`: Resource not found
- `409 Conflict`: Username exists during signup
- `500 Internal Server Error`: Unhandled error

---

## OpenAPI/Swagger

Interactive API docs are available (if server is running) at:  
`[BASE_URL]/docs`

---

### Mermaid Diagram – API Endpoint Overview

```mermaid
graph TD
    A[User] --> B[POST /api/signup]
    A --> C[POST /api/login]
    C -- JWT --> D[Protected]
    D --> E[POST /api/notes]
    D --> F[GET /api/notes]
    D --> G[GET /api/notes/{id}]
    D --> H[PUT /api/notes/{id}]
    D --> I[DELETE /api/notes/{id}]
    A --> J[GET /]
```

---

## Changelog

- 2024-06: Initial documentation, generated from Express code.

---

> For further details, see implementation in the `/src` directory and the [OpenAPI spec](../notes_backend/interfaces/openapi.json).

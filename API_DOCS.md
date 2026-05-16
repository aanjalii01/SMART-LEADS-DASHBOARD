# Smart Leads API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

---

## Authentication

### POST /auth/register

Register a new user.

**Request Body**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123",
  "role": "sales"
}
```

**Role values:** `admin` | `sales` (default: `sales`)

**Response 201**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "665abc123def456ghi789",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": "sales"
    }
  }
}
```

**Error 409** — Email already registered
```json
{ "success": false, "message": "Email already registered." }
```

**Error 400** — Validation failed
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "field", "message": "Name must be at least 2 characters" }]
}
```

---

### POST /auth/login

Login with credentials.

**Request Body**
```json
{
  "email": "rahul@example.com",
  "password": "password123"
}
```

**Response 200**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "665abc123def456ghi789",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": "sales"
    }
  }
}
```

**Error 401** — Invalid credentials
```json
{ "success": false, "message": "Invalid email or password." }
```

---

### GET /auth/me

Get the currently authenticated user. **🔒 Protected**

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "665abc123def456ghi789",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "role": "sales"
  }
}
```

---

## Leads

### GET /leads

List leads with filters and pagination. **🔒 Protected**

> `admin` — sees ALL leads  
> `sales` — sees ONLY their own leads

**Query Parameters**

| Param | Type | Values | Default |
|---|---|---|---|
| `status` | string | `New`, `Contacted`, `Qualified`, `Lost` | — |
| `source` | string | `Website`, `Instagram`, `Referral` | — |
| `search` | string | free text (searches name & email) | — |
| `sort` | string | `latest`, `oldest` | `latest` |
| `page` | number | ≥ 1 | `1` |
| `limit` | number | 1–100 | `10` |

**Example**
```
GET /leads?status=Qualified&source=Instagram&search=Rahul&sort=latest&page=1
```

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "_id": "665abc123",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "status": "Qualified",
      "source": "Instagram",
      "notes": "Very interested",
      "createdBy": { "_id": "...", "name": "Admin", "email": "admin@example.com" },
      "createdAt": "2024-06-01T10:00:00.000Z",
      "updatedAt": "2024-06-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### GET /leads/:id

Get a single lead by ID. **🔒 Protected**

**Response 200**
```json
{
  "success": true,
  "data": { /* Lead object */ }
}
```

**Error 404**
```json
{ "success": false, "message": "Lead not found." }
```

---

### POST /leads

Create a new lead. **🔒 Protected**

**Request Body**
```json
{
  "name": "Priya Singh",
  "email": "priya@example.com",
  "status": "New",
  "source": "Referral",
  "notes": "Referred by Amit"
}
```

**Field rules:**
- `name` — required, 2–100 chars
- `email` — required, valid format
- `status` — optional, default `New`
- `source` — required: `Website` | `Instagram` | `Referral`
- `notes` — optional, max 1000 chars

**Response 201**
```json
{
  "success": true,
  "message": "Lead created successfully.",
  "data": { /* Created Lead object */ }
}
```

---

### PUT /leads/:id

Update an existing lead. **🔒 Protected** (sales: own leads only)

**Request Body** (all fields optional)
```json
{
  "status": "Contacted",
  "notes": "Sent follow-up email"
}
```

**Response 200**
```json
{
  "success": true,
  "message": "Lead updated successfully.",
  "data": { /* Updated Lead object */ }
}
```

---

### DELETE /leads/:id

Delete a lead. **🔒 Protected** (sales: own leads only)

**Response 200**
```json
{
  "success": true,
  "message": "Lead deleted successfully."
}
```

---

### GET /leads/stats

Aggregated stats for the dashboard. **🔒 Protected**

**Response 200**
```json
{
  "success": true,
  "data": {
    "totalLeads": 42,
    "statusStats": [
      { "_id": "New", "count": 15 },
      { "_id": "Contacted", "count": 12 },
      { "_id": "Qualified", "count": 10 },
      { "_id": "Lost", "count": 5 }
    ],
    "sourceStats": [
      { "_id": "Website", "count": 20 },
      { "_id": "Instagram", "count": 14 },
      { "_id": "Referral", "count": 8 }
    ]
  }
}
```

---

### GET /leads/export

Export leads as CSV. **🔒 Protected** Supports same filters as GET /leads (except page/limit).

**Response** — `text/csv` file download

**Filename:** `leads-YYYY-MM-DD.csv`

**Columns:** Name, Email, Status, Source, Notes, Created At

---

## Error Responses

All errors follow this shape:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

| Status | Meaning |
|---|---|
| 400 | Bad Request / Validation error |
| 401 | Unauthenticated (missing/expired token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Internal server error |

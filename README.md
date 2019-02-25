# Server
Node server to manage api endpoints

Api link:
    https://joseph-frank.com

## Endpoints:

**Undocumented API endpoints will only send back string responses (for now)**

### /api/users
  
POST (Create a new user):
- Send initial user information
- Datatype must be `"application/json"`
- All data sent in body of request as JSON

Request format:

``` json
{
    "email": "string",
    "password": "string",
    "firstname": "string",
    "lastname": "string"
}
```

---

### /api/login

POST (Login to account):
- Send login information
- Datatype must be `"application/json"`
- All data sent in body of request as JSON

Request format:

```json
{
    "email": "string",
    "password": "string"
}
```

Response format:

```json
{
    "auth" : "bool",
    "token" : "string"
}

```

* response includes authentication status `"auth"`, and a Json Web Token `"token"`
* **All other request must include this token in the request header as the `"x-access-token"` parameter**
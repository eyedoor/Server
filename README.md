# Server
Node server to manage api endpoints

Api link:
    https://joseph-frank.com

## Endpoints:


### /api/users
  
POST (Create a new user):
- Send initial user information
- Datatype must be `"application/json"`
- All data sent in body of request as JSON

Data format:

``` json
{
    "email": "example@gmail.com",
    "password": "test",
    "firstname": "John",
    "lastname": "Smith"
}
```

- Will only send back string responses with different messages (for now)

---

### /api/login

POST (Login to account):
- Send login information
- Datatype must be `"application/json"`
- All data sent in body of request as JSON

Data format:

```json
{
    "email": "example@gmail.com",
    "password": "test"
}
```

- Will only send back string responses with different messages (for now)

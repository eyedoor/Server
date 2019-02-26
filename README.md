# Server
Node server to manage api endpoints

Api link:
    https://joseph-frank.com

## Endpoints:

**Undocumented API endpoints will only send back string responses (for now)**

|Route| POST<br />(Create) | GET<br />(Read) | PUT<br />(Update) | DELETE<br />(Delete) |
|:---| :---: | :---: | :---: | :---: |
|/api/login| Creates new JWT<br />for user authentication | - | - | - |
|/api/images| Creates a new<br />entry from image/gif | Returns the User's<br />current image/gif | - | - |
|/api/users| Creates a new<br />User | - | Update User<br />information | - |
|/api/events| Add event | Returns list of<br />events for<br />User | - | - |
|/api/people| Create new person<br />entry from image | - | - | Remove person entry |



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
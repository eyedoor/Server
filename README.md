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
  
**POST (Create a new user):**
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

**POST (Login to account):**
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
* "token" is the jwt to be used from the user's application
* "deviceToken" is the jwt to be sent to the device to be used during image upload

```json
{
    "auth" : "bool",
    "token" : "string",
    "deviceToken" : "string"
}
```

* response includes authentication status `"auth"`, and a Json Web Token `"token"`
* **All other request must include this token in the request header as the `"x-access-token"` parameter**

---

### /api/events

**GET (Retrieve list of events):**


Headers:
* `"Content-Type"` : `"application/json"`
* `"x-access-token"` : The current user's JSON Web token

Response format:
* Array of events with newest event first

```json
[
    {
        "EventID": 1,
        "Timesent": "2019-03-12T20:41:31.000Z"
    }
]
```

---

### /api/images

**GET (Download single image by event ID):**

Headers:
* `"x-access-token"` : The current user's JSON Web token

Query Parameters:
* `"eventId"` : ID number of event to download, find using the events endpoint

Response:
* Content-Type: `text/html; charset=utf-8`
* An image string encoded in Base64, must be decoded back into a `.png` file
<br><br>


**POST (Upload Image):**
<br>**For device use only**

Headers:
* `"Content-Type"` : `"application/x-www-form-urlencoded"`
* `"x-access-token"` : The device's JSON Web token

Request format:
* An image string encoded in Base64 in the request body
* File **must** be less than 500kb

Response:
* Confirmation/Error Message
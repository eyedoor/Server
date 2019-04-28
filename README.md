# Server
Node server to manage api endpoints

Api link:
    https://joseph-frank.com

## Endpoints:

|Route| POST<br />(Create) | GET<br />(Read) | PUT<br />(Update) | DELETE<br />(Delete) |
|:---| :---: | :---: | :---: | :---: |
|/api/login| Creates new JWT<br />for user authentication | - | - | - |
|/api/images| Creates a new<br />entry from image/gif | Returns the User's<br />current image/gif | - | - |
|/api/users| Creates a new<br />User | - | Update User<br />information | - |
|/api/events| Add event | Returns list of<br />events for a User | - | - |
|/api/events/friends| - | Returns list of<br />friends for an event | - | - |
|/api/friends| Create new Friend<br />entry from image | Returns User's saved Friends | - | Remove Friend entry |
|/api/friends/events| - | Returns list of events<br>that a friend appears in | - | - |
|/api/friendImage| - | Return friend's image | - | - |


---


### /api/users
  
**POST (Create a new user):**
- Send initial user information
- Datatype must be `"application/json"`
- All data sent in body of request as JSON

Request body format:

``` json
{
    "email": "String",
    "password": "String",
    "phone" : "String",
    "firstname": "String",
    "lastname": "String"
}
```

---

* `"phone" requires country code followed by a sequence of numbers only, ex. +12223334444`

### /api/login

**POST (Login to account):**
- Send login information
- Datatype must be `"application/json"`
- All data sent in body of request as JSON

Request body format:

```json
{
    "email": "String",
    "password": "String"
}
```

Response format:
* "token" is the jwt to be used from the user's application
* "deviceToken" is the jwt to be sent to the device to be used during image upload

```json
{
    "auth" : "bool",
    "token" : "String",
    "deviceToken" : "String",
    "firstname" : "String",
    "lastname" : "String",
    "email" : "String"
}
```

* response includes authentication status `"auth"`, and a Json Web Token `"token"`
* **All other request must include this token in the request header as the `"x-access-token"` parameter**

**GET (Verify User JWT):**

Request Headers:
* `"x-access-token"` : The current user's JSON Web token

Response format:

```json
[
    {
        "auth": "Boolean",
        "message": "String"
    }
]
```

* auth True if valid token, False otherwise
* message contains further error/success information

---

### /api/events

**GET (Retrieve list of events):**


Request Headers:
* `"Content-Type"` : `"application/json"`
* `"x-access-token"` : The current user's JSON Web token

Response format:
* Array of events with newest event first

```json
[
    {
        "EventID": "Integer",
        "Timesent": "YYYY-MM-DDTHH:MI:SS.000Z",
        "EventMessage": "String"
    }
]
```
* In `"Timesent"`, `T` and `.000Z` are alway present in this exact format

---

### /api/events/friends

**GET (Retrieve list of friends that appear in an event):**

Request Headers:
* `"x-access-token"` : The current user's JSON Web token

Query Parameters:
* `"eventId"` : The ID of event to return friends for

Response format:
* Array of friends

```json
[
    {
        "FriendID": "Integer",
        "FriendFirst": "String",
        "FriendLast": "String"
    }
]
```

---

### /api/images

**GET (Download single image by event ID):**

Request Headers:
* `"x-access-token"` : The current user's JSON Web token

Query Parameters:
* `"eventId"` : ID number of event to download, find using the events endpoint

Response:
* Content-Type: `text/html; charset=utf-8`
* An image string encoded in Base64, must be decoded back into a `.png` file
<br><br>


**POST (Upload Image):**
<br>**For device use only**

Request Headers:
* `"Content-Type"` : `"application/x-www-form-urlencoded"`
* `"x-access-token"` : The device's JSON Web token

Request body format:
```json
{
    "image" : "String"
}

```
* Image string encoded in Base64
* Request **must** be less than 500kb

Response:
* Confirmation/Error Message

---

### /api/friends


**POST (Create a new Friend entry):**


Request Headers:
* `"Content-Type"` : `"application/x-www-form-urlencoded"`
* `"x-access-token"` : The user's JSON Web token

Request body format:
```json
{
    "firstname" : "String",
    "lastname" : "String",
    "image" : "String"
}

```
* Image string encoded in Base64
* Request **must** be less than 1mb

Response:
* Confirmation/Error Message


**GET (Retrieve a list of friends):**

Request Headers:
* `"x-access-token"` : The user's JSON Web token

Response format:
* Array of people

```json
[
    {
        "FriendID": "Integer",
        "FriendFirst": "String",
        "FriendLast": "String"
    }
]
```

**DELETE (Delete a friend):**

Request Headers:
* `"x-access-token"` : The user's JSON Web token

Query Parameters:
* `"friendId"` : ID number of friend to delete

Response format:
* String message

---

### /api/friends/events


**GET (Get events that a friend appears in):**

Request Headers:
* `"x-access-token"` : The user's JSON Web token

Query Parameters:
* `"friendId"` : The ID of the friend to get image of

Response format:
* Array of events with newest event first

```json
[
    {
        "EventID": "Integer",
        "Timesent": "YYYY-MM-DDTHH:MI:SS.000Z"
    }
]
```
* In `"Timesent"`, `T` and `.000Z` are alway present in this exact format


---

### /api/friendImage

**GET (Retrieve a friend's image):**

Request Headers:
* `"x-access-token"` : The user's JSON Web token

Query Parameters:
* `"friendId"` : The ID of the friend to get image of

Response:
* Content-Type: `text/html; charset=utf-8`
* An image string encoded in Base64, must be decoded back into a `.png` file
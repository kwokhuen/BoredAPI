# BoredAPI
### What is this repository for? ###
This is a repo for the backend API service of Bored.

### How to run? ###
* Clone the sources
* npm install
* npm start

### Important!
* Make sure your Node.js version is v6.10.3, which is stable.
* Also, your npm version should be v3.10.10, which is stable.

## Folder and file structure
```
./
├── server/
|   ├── db
|   |   ├── models
|   |   |   ├── Event.js                              * Event Model
|   |   |   ├── Location.js                           * Location Model
|   |   |   ├── User.js                               * User Model
|   |   |
|   |   ├── schemas
|   |   |   ├── EventSchema.js                        * Schema for Event Model
|   |   |   ├── LocationSchema.js                     * Schema for Location Model
|   |   |   ├── UserSchema.js                         * Schema for User Model
|   |   |
|   |   ├── mongoose.js                               * database set up script
|   |
|   ├── src
|   |   ├── routes
|   |   |   ├── events
|   |   |   |   ├── index.js                          * events routes handler
|   |   |   |
|   |   |   ├── users
|   |   |   |   ├── index.js                          * users routes handler
|   |   |   |
|   |   |   ├── index.js                              * routes handler
|   |
|   ├── server.js                                     * main script
|
├── .gitignore
├── README.md
├── Story.js
├── package-lock.json
├── package.json                                      * libraries dependencies
|
```

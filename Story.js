// version 1.0.0 Backend
// User's story
// 1. login with facebook - authentication with Facebook API
// 2. create an event - 48 hours period of time
// API:  GET localhost:3000/users/:userId/events/new
// 3. update an event - e.g location, time, date, name
// API: PUT localhost:3000/users/:userId/events/:eventId
    // 4. delete an event - the whole event will be terminated if the host decided to remove the event
    // API: DELETE localhost:3000/users/:userId/events/:eventId
    // 4. leave an event
    // API DELETE localhost:3000/users/:userId/events/:eventId
// 5. attend an event - any person could join an event
// API POST localhost:3000/users/:userId/events/:eventId
// 6. webSocket after joining the event (broadcast socket for all participants)
// socket.io
// 7. update user profile
// API PUT localhost:3000/users/:userId
// 8. create user profile - interest, age, name, description, gender, religion, ethnicity, location
// API POST localhost:3000/users/new
// things to do: figure out what data could be fetched from Facebook (!important)
// 9. get an event list based on location (within 10 miles) and time (within 48 hours) on the first page
// API GET localhost:3000/users/:userId/events
// 10. search an event based on location
// API POST localhost:3000/search?location=xxx
// 11. bookmark events (saved on their phone / server ?)
// API POST localhost:3000/users/:userId/events/:eventId/bookmark



// 2. create an event - 48 hours period of time
// API: POST localhost:3000/users/:userId/events

// 3. update an event by host - e.g location, time, date, name
// API: PUT localhost:3000/users/:userId/events/:eventId

// 4. delete an event - the whole event will be terminated if the host decided to remove the event
// API: DELETE localhost:3000/users/:userId/events/:eventId

// 4. leave an event
// API DELETE localhost:3000/users/:userId/events/:eventId

// 5. attend an event - any person could join an event
// API POST localhost:3000/users/:userId/events/:eventId

// 7. update user profile
// API PUT localhost:3000/users/:userId

// 8. create user profile - interest, age, name, description, gender, religion, ethnicity, location
// API POST localhost:3000/users
// things to do: figure out what data could be fetched from Facebook (!important)

// 9. get an event list based on location (within 10 miles) and time (within 48 hours) on the first page
// API GET localhost:3000/users/:userId/events

// 10. search an event based on location
// API POST localhost:3000/search?location=xxx

// 11. bookmark events (saved on their phone / server ?)
// API POST localhost:3000/users/:userId/events/:eventId/bookmark

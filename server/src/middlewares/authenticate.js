const {User} = require('db/models/User');
const authenticate = (req,res,next) => {
  const token = req.header('x-auth');
  User.findByToken(token).then(user => {
    if (!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next();
  }).catch(e => {
    res.status(401).json({
      "error": {
          "code": "BadToken",
          "target": "auth_token",
          "message": "Authurization token is invalid or has expired"
      }
    });
  });
}

module.exports = authenticate;

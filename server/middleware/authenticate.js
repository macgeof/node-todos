const {User} = require('./../models/user');

const authenticate = (request, response, next) => {
  const token = request.header('x-auth');
  User.findByToken(token)
    .then((user) => {
      if(!user) {
        return Promise.reject();
      }

      request.user = user;
      request.token = token;
      next();
    })
    .catch((err) => {
      // console.log('Finding user for token has failed');
      response.status(401);
      response.send();
    });
};


module.exports = {
  authenticate
}

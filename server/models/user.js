const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const UserSchema = new mongoose.Schema({
  email:{
    type:String,
    required:true,
    trim:true,
    unique:true,
    validate: {
      validator: validator.isEmail,
      message:'{VALUE} is not a valid email'
    }
  },
  password:{
    type:String,
    required:true,
    minlength:6
  },
  tokens:[{
    access:{
      type:String,
      required:true
    },
    token:{
      type:String,
      required:true
    }
  }]
});

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email'])
};

UserSchema.methods.generateAuthToken = function() {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({
    _id:user._id.toHexString(),
    access}, 'abc123').toString();

  user.tokens = user.tokens.concat([{
    access,
    token
  }]);
  return user.save()
    .then(() => {
      return token;
    });
};

UserSchema.statics.findByToken = function (token) {
  const User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (err) {
    console.log('Token decoding failed', token);
    return Promise.reject();
  }

  return User.findOne({
    '_id':decoded._id,
    'tokens.token':token,
    'tokens.access':'auth'
  });
};

var User = mongoose.model('User', UserSchema);

module.exports = {
  User
}


// EXAMPLE
// var user = new User({
//   email:' geof.brownbridge@mac.com '
// });
// user.save()
//   .then((doc) => {
//     console.log(JSON.stringify(doc, undefined, 1));
//   })
//   .catch((error) => {
//     console.log('Unable to save user', error);
//   });

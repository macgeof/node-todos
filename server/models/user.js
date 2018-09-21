const mongoose = require('mongoose');

var User = mongoose.model('User', {
  email:{
    type:String,
    required:true,
    minLength:1,
    trim:true
  }
});

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

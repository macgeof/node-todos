const mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required : true,
    minLength:1,
    trim:true
  },
  completed: {
    type: Boolean,
    default : false
  },
  completedAt: {
    type: Number,
    default:null
  },
  _creator : {
    type:mongoose.Schema.Types.ObjectId,
    required:true
  }
});

module.exports = {
  Todo
}

// EXAMPLE
// var secondTodo = new Todo({
//   text:' Edit me '
//     });
// secondTodo.save()
//   .then((doc) => {
//     console.log('Saved todo 2', doc);
//   })
//   .catch((error) => {
//     console.log('Unable to save Todo', error);
//   });

const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


// Todo.deleteMany()
//   .then((result) => {
//     console.log(result);
//   });

// Todo.findOneAndRemove()
Todo.findByIdAndRemove('5ba4e61badcb72d0c7ed1718')
  .then((doc) => {
    console.log(JSON.stringify(doc, undefined, 2));
  })

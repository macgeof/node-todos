const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// const id = '5ba4c5c0a3ed0221c1c49a5111';
//
// if (!ObjectID.isValid(id)) {
//   console.log('Id not valid');
// }

// Todo.find({
//   _id: id
// })
//   .then((todos) => {
//     console.log('Todos', todos);
//   });
//
// Todo.findOne({
//   _id: id
// })
//   .then((todo) => {
//     console.log('Todo', todo);
//   });

// Todo.findById(id)
//   .then((todo) => {
//     if (todo !== null)
//       console.log('Todo by Id', todo);
//     else
//       console.log('Todo not found with id', id);
//   })
//   .catch((err) => {
//     console.log(err);
//   })

const userId = '5ba4b407e208f51a0c761161';

User.findById(userId)
  .then((user) => {
    if (user !== null)
      console.log('User', user);
    else
      console.log('User not found with id', userId);
  })
  .catch((err) => {
    console.log('Error retrieving user', err);
  })

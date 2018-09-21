const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

beforeEach((done) => {
  Todo.remove({})
    .then(() => done());
});

const app = express();

app.use(bodyParser.json());

app.post('/todos', (request, response) => {
  console.log(request.body);
  const todo = new Todo({
    text : request.body.text
  });
  todo.save()
    .then((doc) => {
      response.send(doc);
    })
    .catch((error) => {
      response.status(400);
      response.send(error);
    });
});

app.listen(3000, () => {
  console.log('Started on port 3000');
})

module.exports = {
  app
}

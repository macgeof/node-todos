const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (request, response) => {
  console.log(request.body);
  const todo = new Todo({
    text : request.body.text
  });
  todo.save()
    .then((doc) => {
      return response.send(doc);
    })
    .catch((error) => {
      response.status(400);
      return response.send(error);
    });
});

app.get('/todos', (request, response) => {
  Todo.find()
    .then((todos) => {
      return response.send({
        todos
      });
    })
    .catch((err) => {
      response.status(400);
      return response.send(err);
    })
});

app.get('/todos/:id', (request, response) => {
  const id = request.params.id;
  if (!ObjectID.isValid(id)) {
    console.log('Invalid Id', id);
    response.status(404);
    return response.send();
  }
  else
  {
    Todo.findById(id)
      .then((todo) => {
        if (todo !== null) {
          console.log('Returning todo with Id', id);
          return response.send({todo});
        }
        else {
          console.log('No todo found with Id', id);
          response.status(404);
          return response.send();
        }
      })
      .catch((err) => {
        console.log('Unable to complete request');
        response.status(400);
        return response.send();
      })
  }
})

app.listen(port, () => {
  console.log(`Started on port ${port}`);
})

module.exports = {
  app
}

require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

const app = express();

app.use(bodyParser.json());

app.post('/users', (request, response) => {
var body = _.pick(request.body, ['email', 'password']);
  const user = new User(body);
  user.save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then((token) => {
      response.header('x-auth', token)
      response.send(user);
    })
    .catch((err) => {
      // console.log('Unable to save user', err);
      response.status(400);
      response.send(err);
    })
});

app.get('/users/me',  authenticate, (request, response) => {
  response.send(request.user);
});

app.post('/users/login', (request, response) => {
  var body = _.pick(request.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password)
    .then((user) => {
      return  user.generateAuthToken()
        .then((token) => {
          response.header('x-auth', token)
          response.send(user);
        })
    })
    .catch ((err) => {
      response.status(400);
      response.send();
    })
});

app.delete('/users/me/token', authenticate, (request, response) => {
  request.user.removeToken(request.token)
    .then(() => {
      response.status(200);
      response.send()
    })
    .catch((err) => {
      response.status(400);
      response.send();
    })
});

app.post('/todos', authenticate, (request, response) => {
  // console.log(request.body);
  const todo = new Todo({
    text : request.body.text,
    _creator : request.user._id
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

app.get('/todos', authenticate, (request, response) => {
  Todo.find({
    _creator:request.user._id
  })
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

app.get('/todos/:id', authenticate, (request, response) => {
  const id = request.params.id;
  if (!ObjectID.isValid(id)) {
    // console.log('Invalid Id', id);
    response.status(404);
    return response.send();
  }
  else
  {
    Todo.findOne({
      _id:id,
      _creator:request.user._id
    })
      .then((todo) => {
        if (todo !== null) {
          // console.log('Returning todo with Id', id);
          return response.send({todo});
        }
        else {
          // console.log('No todo found with Id', id);
          response.status(404);
          return response.send();
        }
      })
      .catch((err) => {
        console.log('Unable to complete request');
        response.status(400);
        return response.send();
      })
  };
});

app.delete('/todos/:id', authenticate, (request, response) => {
  const id = request.params.id;
  if(!ObjectID.isValid(id))
  {
    // console.log('Invalid Id', id);
    response.status(404);
    return response.send();
  }
  else {
    Todo.findOneAndDelete({
      _id:id,
      _creator:request.user._id
    })
    .then((todo) => {
      if (!todo) {
        // console.log('Todo not found for Id', id);
        response.status(404);
        return response.send();
      }
      else {
        return response.send({todo})
      }
    })
    .catch((err) => {
      response.status(400);
      return response.send();
    });
  };
});

app.patch('/todos/:id', authenticate, (request, response) => {
  const id = request.params.id;
  var body = _.pick(request.body, ['text', 'completed']);
  if (!ObjectID.isValid(id)) {
    // console.log('Invalid Id', id);
    response.status(404);
    return response.send();
  } else {
    if(_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    }
    else {
      body.completed = false;
      body.completedAt = null;
    }
    Todo.findOneAndUpdate({
      _id:id,
      _creator:request.user._id
    }, {
      $set : body
    },
    {
      new : true
    })
      .then((todo) => {
        if (!todo) {
          response.status(404);
          response.send();
        }
        else {
          response.send({todo});
        }
      })
      .catch ((err) => {
        response.status(400);
        response.send();
      });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Started on port ${process.env.PORT}`);
});

module.exports = {
  app
}

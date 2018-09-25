const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({
        text
      })
      .expect(200)
      .expect((response) => {
        expect(response.body.text).toBe(text);
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }

        Todo.find({text})
          .then((todos) => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch((err) => done(err));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    const text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((error, response) => {
        if (error) {
          return done(error);
        }

        Todo.find()
          .then((todos) => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch((err) => done(err));
      });
  });
});

describe('GET /todos endpoint', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((response) => {
        expect(response.body.todos.length).toBe(2)
      })
      .end(done);
  })
});

describe('GET /todos/:id endpoint', () => {
  it('should get a single todo by id', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return a 404 if todo not found', (done) => {
    const id = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it('should return a 404 for non valid object id', (done) => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  })
});

describe('DELETE /todos/:id endpoint', () => {
  it('should remove a todo', (done) => {
    const id = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.todo._id).toBe(id);
      })
      .end((err, response) => {
        if(err) {
          return done(err);
        }
        else {
          Todo.findById(id)
            .then((todo) => {
              expect(todo).toBeFalsy();
              done();
            })
            .catch((err) => done(err));
        }
      })
  });

  it('should return 404 if todo not found', (done) => {
    const id = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  });
  it('should return 400 if todo id not valid', (done) => {
    request(app)
      .delete('/todos/123')
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id endpoint', () => {
  it('should update the todo', (done) => {
    const id = todos[0]._id.toHexString();
    const text = 'This should be the new text';
    request(app)
      .patch(`/todos/${id}`)
      .send({
        completed:true,
        text
      })
      .expect(200)
      .expect((response) => {
        // console.log(JSON.stringify(response, undefined, 2));
        expect(response.body.todo.text).toBe(text);
        expect(response.body.todo.completed).toBe(true);
        expect(typeof response.body.todo.completedAt).toBe('number');
        expect(response.body.todo.completedAt).toBeLessThanOrEqual(new Date().getTime());
      })
      .end(done)
  });

  it('should clear completedAt when todo is not completed', (done) => {

      const id = todos[1]._id.toHexString();
      const text = 'This should be the new text';
      request(app)
        .patch(`/todos/${id}`)
        .send({
          completed:false,
          text
        })
        .expect(200)
        .expect((response) => {
          expect(response.body.todo.text).toBe(text);
          expect(response.body.todo.completed).toBe(false);
          expect(response.body.todo.completedAt).toBeNull();
        })
        .end(done)
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((response) => {
        expect(response.body._id).toBe(users[0]._id.toHexString());
        expect(response.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((response) => {
        expect(response.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = '123mnb!';
    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(200)
      .expect((response) => {
        expect(response.headers['x-auth']).toBeTruthy();
        expect(response.body._id).toBeTruthy();
        expect(response.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.findOne({email})
          .then((user) => {
            expect(user).toBeTruthy();
            expect(user.password === password).toBeFalsy();
            done();
          })
          .catch((err) => {
            done(err);
          })
      });
  });

  it('should return validation errors if request invalid', (done) => {
    var email = 'example-example.com';
    var password = '123mn';
    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(400)
      .expect((response) => {
        const body = _.pick(response.body, ['_message', 'errors']);
        expect(body._message).not.toBeUndefined();
        expect(body.errors.email).not.toBeUndefined();
        expect(body.errors.password).not.toBeUndefined();
      })
      .end(done);
  });

  it('should not create a user if email in use', (done) => {
    const email = users[0].email;
    const password = 'abcdef!123';
    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(400)
      .expect((response) => {
        expect(response.body).not.toBeUndefined();
      })
      .end(done);
  });
});

describe ('/POST /users/login', () => {
  // it('should login user and return auth token', (done) => {
  //   request(app)
  //     .post('/users/login')
  //     .send({
  //       email:users[1].email,
  //       password:users[1].password
  //     })
  //     .expect(200)
  //     .expect((response) => {
  //       expect(response.headers['x-auth']).toBeTruthy();
  //     })
  //     .end((err, response) => {
  //       if (err) {
  //         return done(err);
  //       }
  //
  //       User.findById(users[1]._id)
  //         .then((user) => {
  //           expect(user.tokens[0]).objectContaining({
  //             access:'auth',
  //             token: response.headers['x-auth']
  //           });
  //           done();
  //         })
  //         .catch((err) => {
  //           done(err);
  //         })
  //     })
  // });

  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then((user) => {
            expect(user.tokens[0]).toEqual(expect.objectContaining({
              access: 'auth',
              token: res.headers['x-auth']
            }));
            done();
          })
          .catch((e) => done(e));
      });
  });



  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then((user) => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch((e) => done(e));
      });
  });

  // it('should reject invalid login', (done) => {
  //   request(app)
  //     .post('/users/login')
  //     .send({
  //       email: users[1].email,
  //       password: 'invalid password'
  //     })
  //     .expect(400)
  //     .expect((res) => {
  //       expect(res.headers['x-auth']).toBeFalsy();
  //     })
  //     .end((err, res) => {
  //       if (err) {
  //         return done(err);
  //       }
  //
  //       User.findById(users[1]._id)
  //         .then((user) => {
  //           expect(user.tokens.length).toBe(0);
  //           done();
  //         })
  //         .catch((err) => done(err));
  //     });
  // });
});

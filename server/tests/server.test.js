const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed:false,
  completedAt:666
}];

beforeEach((done) => {
  Todo.deleteMany()
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
});

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

// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// var obj = new ObjectID();
// console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser : true}, (error, client) => {
  if (error) {
    return console.log('Unable to connect to TodoApp MongoDB');
  }
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp');

  // db.collection('Todos').find({
  //     _id:new ObjectID('5ba385329e81080f4d418a5e')
  //   }).toArray()
  //   .then((docs) => {
  //     console.log('Todos');
  //     console.log(JSON.stringify(docs, undefined, 2));
  //   })
  //   .then(() => {
  //     client.close();
  //   })
  //   .catch((error) => {
  //     console.log('Error finding Todos.', error);
  //   });

  // db.collection('Todos').find().count()
  //   .then((count) => {
  //     console.log(`Todos count:${count}`);
  //   })
  //   .then(() => {
  //     client.close();
  //   })
  //   .catch((error) => {
  //     console.log('Error finding Todos.', error);
  //   });

  db.collection('Users').find({name:'Geof Brownbridge'}).toArray()
    .then((docs) => {
      console.log(JSON.stringify(docs, undefined, 2));
    })
    .then(() => {
      client.close();
    })
    .catch((error) => {
      console.log('Error finding Todos.', error);
    });

  // client.close();
});

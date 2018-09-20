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

  // db.collection('Todos').findOneAndUpdate({
  //   _id : new ObjectID('5ba3a0a6adcb72d0c7ecfc86')
  // }, {
  //   $set : {
  //     completed: true
  //   }
  // }, {
  //   returnOriginal : false
  // })
  //   .then((result) => {
  //     console.log(result);
  //   });

  db.collection('Users').findOneAndUpdate({
    _id : new ObjectID('5ba386f8af776b0f82a33eed')
  }, {
    $set : {
      name: 'Geof Brownbridge'
    },
    $inc : {
      age : 1
    }
  }, {
    returnOriginal : false
  })
    .then((result) => {
      console.log(result);
    });

  // client.close();
});

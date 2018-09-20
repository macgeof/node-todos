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

  // delete many
  // db.collection('Todos').deleteMany({text:'Eat lunch'})
  //   .then((result) => {
  //     console.log(result);
  //   });

  // delete one
  // db.collection('Todos').deleteOne({text:'Eat lunch'})
  //   .then((result) => {
  //     console.log(result);
  //   });

  // find one and delete
  // db.collection('Todos').findOneAndDelete({completed:false})
  //   .then((result) => {
  //     console.log(result);
  //   });

  // db.collection('Users').deleteMany({name:'Geof Brownbridge'})
  //   .then((result) => {
  //     console.log(result);
  //   });

  db.collection('Users').findOneAndDelete({
      _id:new ObjectID('5ba387be34c3910f987b68ef')
    })
    .then((result) => {
      console.log(JSON.stringify(result, undefined, 2));
    });


  // client.close();
});

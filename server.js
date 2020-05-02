'use strict';

require('dotenv').config();

const express = require('express');
const PORT = process.env.PORT || 3000;
const superagent = require('superagent');

const app = express();

// Brings in EJS
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./www'));

// Check to see if route found
app.get('/', (request, response) => {
  response.status(200).render('pages/index.ejs');
});


// New search route
app.get('/searches/new', (request, response) => {
  response.status(200).render('pages/searches/new.ejs');
});

//Google API route
app.post('/searches', (request, response) => {
  let url = 'https://www.googleapis.com/books/v1/volumes';
  let queryObject = {
    q: `${request.body.searchby}:${request.body.search}`,
  };

  console.log(queryObject);

  superagent.get(url)
    .query(queryObject)
    .then(results => {
      // results.body is ... the data from Google
      // create an array of book objects by mapping over the results and using a Constructor
      let books = results.body.items.map(book => new Book(book));
      // send the array of new Book() to the template
      response.status(200).render('pages/searches/show.ejs', { books: books });
    });
});

let url = 'https://i.imgur.com/J5LVHEL.jpg';
function Book(data) {
  this.title = data.volumeInfo.title;
  this.author = data.volumeInfo.authors;
  this.image_url = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : url;
  this.description = data.volumeInfo.description;
}


app.post('/books', (request, response) => {
  console.log(request.body)
  // Create the SQL to insert into the db
  // Do a client.query() with that and the values from request.body
  // .then() ... do a redirect to /book/ID
  response.status(200).send('ok');
});

// 404 Handler
app.use('*', (request, response) => {
  response.status(404).render('pages/404');
});

// Error Handler
app.use((err, request, response, next) => {
  console.error(err);
  response.status(500).render('pages/500', { error: err });
});

// Startup

function startServer() {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

startServer();
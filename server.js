'use strict';

require('dotenv').config();

const express = require('express');
const PORT = process.env.PORT || 3000;
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

const app = express();

// Brings in EJS
const client = new pg.Client(process.env.DATABASE_URL);

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static('./www'));

// Check to see if route found
app.get('/', (request, response) => {
  const SQL =  `SELECT * FROM books`;
  client.query(SQL)
    .then(results => {
      response.status(200).render('pages/index.ejs', {books: results.rows});
    })
    .catch ( error => {
      throw new Error (error);
    });
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

  // console.log(queryObject);

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
  this.isbn = data.volumeInfo.industryIdentifiers[0].identifier;
  this.image_url = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : url;
  this.description = data.volumeInfo.description ? data.volumeInfo.description:"Book App is HELL";
}


app.post('/books', (request, response) => {
  // console.log(request.body)
  // Create the SQL to insert into the db
  let SQL = `INSERT INTO books (title, author, isbn, image_url, description)
  VALUES ($1, $2, $3, $4, $5)`;
  let VALUES = [
    request.body.title,
    request.body.author,
    request.body.isbn,
    request.body.image_url,
    request.body.description
  ];

  if ( ! (request.body.title || request.body.author || request.body.isbn || request.body.image_url || request.body.description) ) {
    throw new Error('invalid input');
  }
  // Do a client.query() with that and the values from request.body
  client.query(SQL, VALUES)
  // .then() ... do a redirect to /book/ID
    .then(results => {
      console.log(results);
      response.status(200).redirect('/');
    });
  // response.status(200).send('ok');
});

app.get('/addbook/:id', addBook);


app.delete('/delete/:id', deleteBook);

function addBook (request, response) {
  let SQL = `SELECT * FROM books WHERE id = $1`;
  let VALUES = [request.params.id];
  client.query(SQL, VALUES)
    .then(results =>{
      response.status(200).render('pages/addbook', { book:results.rows[0]});
    });
}

function deleteBook (request, response) {
  let id = request.params.id;
  let SQL = `DELETE FROM books WHERE id = $1`;
  let VALUES = [id];
  client.query(SQL, VALUES)
    .then(results => {
      response.status(200).redirect('/');
    });
}

app.put('/update-book/:id', handleUpdate);

function handleUpdate (request, response) {
  let SQL = 'UPDATE books set title = $1, author= $2, description= $3, isbn = $4, image_url= $5 WHERE id = $6';
  let VALUES = [
    request.body.title,
    request.body.author,
    request.body.isbn,
    request.body.image_url,
    request.body.description,
    request.params.id,
  ];

  client.query(SQL, VALUES)
    .then(results => {
      response.status(200).redirect(`/addbook/${request.params.id}`);
    });
}


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
  client.connect()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    });
}

startServer();
'use strict';

require('dotenv').config();

const express = require('express');
const PORT = process.env.PORT || 3000;
const superagent = require('superagent');

const app = express();

// Brings in EJS
app.set('view engine', 'ejs');

app.use( express.urlencoded({extended:true }));
app.use( express.static('./www') );

// Check to see if route found
app.get('/', (request, response) => {
  response.status(200).send('Hello World');
});

// Route index.ejs works
app.get('/index', (request, response) => {
  response.status(200).render('pages/index.ejs');
});

// New search route
app.get('/new', (request, response) => {
  response.status(200).render('pages/searches/new.ejs');
});

//Google API route
app.get('/searches', (request, response) => {
  let url = 'https://www.googleapis.com/books/v1/volumes';
  let queryObject = {
    q: `${request.body.searchby}:${request.body.search}`,
  };

  superagent.get(url)
    .query(queryObject)
    .then(results => {
      let books = results.body.items.map(book => new Book(book));
      response.status(200).render('pages/searches/show.ejs', {books: books});
    });
});

let url = 'https://i.imgur.com/J5LVHEL.jpg';
function Book(data) {
  this.title = data.volumeInfo.title;
  this.author = data.volumeInfo.authors;
  this.image = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : url;
  this.description = data.volumeInfo.description;
}


// This will force an error
app.get('/badthing', (request,response) => {
  throw new Error('WTF???');
});

// 404 Handler
app.use('*', (request, response) => {
  console.log(request);
  response.status(404).send(`Can't Find ${request.pathname}`);
});

// Error Handler
app.use( (err,request,response,next) => {
  console.error(err);
  response.status(500).send(err.message);
});

// Startup

function startServer() {
  app.listen( PORT, () => console.log(`Server running on ${PORT}`));
}

startServer();
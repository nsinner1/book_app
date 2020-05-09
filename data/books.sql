DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(8000),
  author VARCHAR(8000),
  isbn VARCHAR(8000),
  image_url VARCHAR(8000),
  description VARCHAR(8000),
  bookshelf VARCHAR(8000),
  listPrice VARCHAR(8000)
);


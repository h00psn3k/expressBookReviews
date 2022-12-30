const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const asyncHandler = require('express-async-handler')

public_users.use(express.json({extended: true}));
public_users.use(express.urlencoded({ extended: true }));

const arrBooks = Object.values(books);

// Promise method to retrieve all books in the database
function getBooks() {
  return new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      }
      else {
        reject({status:404, message: "Books Database is Empty"});
      }
  });
}

// Promise method to retrieve a book based on ISBN
function getBooksByISBN(isbn) {
  return new Promise((resolve, reject) => {
      let book = books[isbn];
      if (book) {
        resolve(book);
      }
      else {
        reject({status:404, message: "ISBN Not Found"});
      }
  });
}

// Promise method to retrieve books based on author
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    let booksByAuthor = arrBooks.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));

    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    }
    else{
      reject({status:404, message: "No books by this author found"});
    }
  });
}

// Promise method to retrieve books based on title
function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    let booksByTitle = arrBooks.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));

    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    }
    else{
      reject({status:404, message: "No books with this title found"});
    }
  });
}

// Register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop without Promises
// public_users.get('/', (req, res) => {
//   if (books) {
//     res.send(books);
//   }
//   else {
//     return res.status(404).json({message: "Books Database is Empty"});
//   }
// });

public_users.get('/',function (req, res) { // Get the book list available in the shop with Promises
  getBooks()
    .then(
      result => res.send(result),
      error => res.status(error.status).json({message: error.message})
    );
});

// Get book details based on ISBN without Promises
// public_users.get('/isbn/:isbn',function (req, res) {
//   let isbn = req.params.isbn;
//   book = books[isbn];
//   if (book) {
//     res.send(books[isbn]);
//   }
//   else {
//     return res.status(404).json({message: "ISBN Not Found"});
//   }
//  });

public_users.get('/isbn/:isbn',function (req, res) { // Get book details based on ISBN with Promises
  getBooksByISBN(req.params.isbn)
    .then(
      result => res.send(result),
      error => res.status(error.status).json({message: error.message})
    );
});
  
// Get book details based on author without Promises
// public_users.get('/author/:author',function (req, res) {
//   let author = req.params.author;
//   //let booksByAuthor = arrBooks.filter(book => new RegExp(author, 'i').test(book.author)); //This is a potentially unsafe way to do this. Would be better to convert both strings to lowercase and then compare - see below
//   let booksByAuthor = arrBooks.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));

//   if (booksByAuthor.length > 0) {
//     res.send(booksByAuthor);
//   }
//   else {
//     return res.status(404).json({message: "No books by this author found"});
//   }
// });

public_users.get('/author/:author',function (req, res) { // Get book details based on author with Promises
  getBooksByAuthor(req.params.author)
    .then(
      result => res.send(result),
      error => res.status(error.status).json({message: error.message})
    );
});

// Get all books based on title without Promises
// public_users.get('/title/:title',function (req, res) {
//   let title = req.params.title;
//   let booksByTitle = arrBooks.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));

//   if (booksByTitle.length > 0) {
//     res.send(booksByTitle);
//   }
//   else {
//     return res.status(404).json({message: "No books with this title found"});
//   }
// });

public_users.get('/title/:title',function (req, res) { // Get all books based on title with Promises
  getBooksByTitle(req.params.title)
    .then(
      result => res.send(result),
      error => res.status(error.status).json({message: error.message})
    );
}); 

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  book = books[isbn];
  if (Object.keys(book["reviews"]).length > 0) {
    res.send(book["reviews"]);
  }
  else {
    return res.status(404).json({message: "This book has no reviews"});
  }
});

module.exports.general = public_users;

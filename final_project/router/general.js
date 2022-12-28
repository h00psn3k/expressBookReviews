const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.use(express.json({extended: true}));
public_users.use(express.urlencoded({ extended: true }));

const arrBooks = Object.values(books);

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

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  if (books) {
    res.send(books);
  }
  else {
    return res.status(404).json({message: "Books Database is Empty"});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  book = books[isbn];
  if (book) {
    res.send(books[isbn]);
  }
  else {
    return res.status(404).json({message: "ISBN Not Found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  //let booksByAuthor = arrBooks.filter(book => new RegExp(author, 'i').test(book.author)); //This is a potentially unsafe way to do this. Would be better to convert both strings to lowercase and then compare - see below
  let booksByAuthor = arrBooks.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));

  if (booksByAuthor.length > 0) {
    res.send(booksByAuthor);
  }
  else {
    return res.status(404).json({message: "No books by this author found"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title;
  let booksByTitle = arrBooks.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));

  if (booksByTitle.length > 0) {
    res.send(booksByTitle);
  }
  else {
    return res.status(404).json({message: "No books with this title found"});
  }
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

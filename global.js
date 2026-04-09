// GLOBAL DATABASE SYSTEM

function getDB() {
  return JSON.parse(localStorage.getItem("libraryDB")) || {
    books: [
      {
        id: "1",
        title: "Atomic Habits",
        author: "James Clear",
        category: "self-help",
        material: "book",
        status: "available"
      },
      {
        id: "2",
        title: "He's Into Her",
        author: "Maxinejiji",
        category: "romance",
        material: "book",
        status: "available"
      },
      {
        id: "3",
        title: "Introduction to Computing",
        author: "John Smith",
        category: "technology",
        material: "book",
        status: "available"
      }
    ],
    borrowed: [],
    history: []
  };
}

function saveDB(db) {
  localStorage.setItem("libraryDB", JSON.stringify(db));
}

/* ---------- BORROW ---------- */
function borrowBook(bookId) {
  const db = getDB();
  const book = db.books.find(b => b.id === bookId);

  if (!book || book.status !== "available") return;

  book.status = "borrowed";

  const borrowedItem = {
    ...book,
    borrowedDate: new Date().toLocaleDateString(),
    dueDate: "7 days",
    status: "borrowed"
  };

  db.borrowed.push(borrowedItem);

  db.history.push({
    ...borrowedItem,
    returnedDate: ""
  });

  saveDB(db);
}

/* ---------- RETURN ---------- */
function returnBook(bookId) {
  const db = getDB();

  const book = db.books.find(b => b.id === bookId);
  if (book) book.status = "available";

  db.borrowed = db.borrowed.filter(b => b.id !== bookId);

  const historyItem = db.history.find(h => h.id === bookId && h.status === "borrowed");
  if (historyItem) {
    historyItem.status = "returned";
    historyItem.returnedDate = new Date().toLocaleDateString();
  }

  saveDB(db);
}

[
  {
    id: 1,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    category: "Book",
    image: "images/algorithms.jpg",
    status: "borrowed"
  },
  {
    id: 2,
    title: "Database Systems",
    author: "Elmasri",
    category: "Book",
    image: "images/database.jpg",
    status: "pending"
  }
]


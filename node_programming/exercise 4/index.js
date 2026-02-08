let todos = [];

// CREATE
export function createTodo(req, res) {
  const { date, bookname, bookid, authorname } = req.body;

  if (!date || !bookname || !bookid || !authorname) {
    return res.status(400).json({
      message: "date, bookname, bookid, and authorname are required"
    });
  }


  const exists = todos.find(t => t.bookid === bookid);
  if (exists) {
    return res.status(409).json({ message: "Book with this bookid already exists" });
  }

  const newTodo = {
    date,
    bookname,
    bookid,
    authorname
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
}


export function getTodos(req, res) {
  res.json(todos);
}


export function getTodoByBookId(req, res) {
  const { bookid } = req.params;
  const todo = todos.find(t => t.bookid === bookid);

  if (!todo) {
    return res.status(404).json({ message: "Record not found" });
  }

  res.json(todo);
}


export function updateTodo(req, res) {
  const { bookid } = req.params;
  const { date, bookname, authorname } = req.body;

  const todo = todos.find(t => t.bookid === bookid);

  if (!todo) {
    return res.status(404).json({ message: "Record not found" });
  }

  if (date !== undefined) todo.date = date;
  if (bookname !== undefined) todo.bookname = bookname;
  if (authorname !== undefined) todo.authorname = authorname;

  res.json(todo);
}

export function deleteTodo(req, res) {
  const { bookid } = req.params;
  const index = todos.findIndex(t => t.bookid === bookid);

  if (index === -1) {
    return res.status(404).json({ message: "Record not found" });
  }

  todos.splice(index, 1);
  res.json({ message: "Record deleted successfully" });
}
const express = require("express");
const cors = require("cors")
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return res.status(404).json({ error: "User not found!" })
  }

  req.user = user;

  return next();
}

app.post("/users", (req, res) => {
  const { name, username } = req.body;

  const user = users.some(user => user.username === username);

  if (user) {
    return res.status(400).json({ error: "User already exist!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  return res.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  const newTask = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTask);

  return res.status(201).json(newTask);
});

app.put("/todos/:id", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;
  const { id } = req.params;

  const task = user.todos.find(task => task.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found!" });
  }

  task.title = title;
  task.deadline = new Date(deadline);

  return res.json(task);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const task = user.todos.find(task => task.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found!" });
  }

  task.done = true;

  return res.json(task);
});

app.delete("/todos/:id", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todoIndex = user.todos.findIndex(task => task.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Task not found!" });
  }

  user.todos.splice(todoIndex, 1);

  return res.status(204).json();
});

module.exports = app;


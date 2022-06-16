const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const users = [];

function getTask(user, id) {
  const todo = user.todo.find(task => task.id === id);

  return todo;
}

function checkIfUserExistByUsername(req, res, next) {
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
    todo: []
  }

  users.push(newUser);

  return res.status(201).json(newUser);
});

app.get("/user", checkIfUserExistByUsername, (req, res) => {
  const { user } = req;

  return res.json(user);
});

app.get("/todo", checkIfUserExistByUsername, (req, res) => {
  const { user } = req;

  return res.json(user.todo);
});

app.post("/todo", checkIfUserExistByUsername, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  const newTask = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    createAt: new Date()
  }

  user.todo.push(newTask);

  return res.status(201).json(newTask);
});

app.put("/todo/:id", checkIfUserExistByUsername, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;
  const { id } = req.params;

  const task = getTask(user, id);

  if (!task) {
    return res.status(404).json({ error: "Task not found!" });
  }

  task.title = title;
  task.deadline = new Date(deadline);

  return res.status(201).send();
});

app.patch("/todo/:id/done", checkIfUserExistByUsername, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const task = getTask(user, id);

  if (!task) {
    return res.status(404).json({ error: "Task not found!" });
  }

  task.done = true;

  return res.status(201).send();
});

app.delete("/todo/:id", checkIfUserExistByUsername, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const task = getTask(user, id);

  if (!task) {
    return res.status(404).json({ error: "Task not found!" });
  }

  user.todo.splice(task, 1);

  return res.status(201).send();
});

app.listen("8080", () => {
  console.log("Server running...");
});


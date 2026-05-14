// src/app.js — Express app (tách riêng để dễ test)
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ──────────────────────────────────────
// In-memory "database" (demo purposes)
// ──────────────────────────────────────
let tasks = [
  { id: 1, title: "Learn CI/CD", done: false },
  { id: 2, title: "Setup GitHub Actions", done: false },
  { id: 3, title: "Deploy to AWS EC2", done: false },
  { id: 4, title: "Monitor with Render Logs", done: false },
  { id: 5, title: "Write unit tests for API", done: false },
  { id: 6, title: "Write TEST CI/CD pipeline", done: false },
];
let nextId = 7;

// ──────────────────────────────────────
// Routes
// ──────────────────────────────────────

// Health check — dùng để CI kiểm tra app còn sống không
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// GET all tasks
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// GET single task
app.get("/api/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

// POST create task
app.post("/api/tasks", (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }
  const task = { id: nextId++, title: title.trim(), done: false };
  tasks.push(task);
  res.status(201).json(task);
});

// PATCH update task (toggle done)
app.patch("/api/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  if (req.body.done !== undefined) task.done = req.body.done;
  if (req.body.title !== undefined) task.title = req.body.title;
  res.json(task);
});

// DELETE task
app.delete("/api/tasks/:id", (req, res) => {
  const index = tasks.findIndex((t) => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Task not found" });
  tasks.splice(index, 1);
  res.status(204).send();
});

// Helper để reset data trong tests
app.resetTasks = () => {
  tasks = [
    { id: 1, title: "Learn CI/CD", done: false },
    { id: 2, title: "Setup GitHub Actions", done: false },
  ];
  nextId = 3;
};

module.exports = app;

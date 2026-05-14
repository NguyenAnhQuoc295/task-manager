import React, { useState, useEffect } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks từ backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/tasks`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Thêm task mới
  const handleAdd = async (title) => {
    const res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const newTask = await res.json();
      setTasks((prev) => [...prev, newTask]);
    }
  };

  // Toggle done
  const handleToggle = async (id, done) => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  };

  // Xóa task
  const handleDelete = async (id) => {
    const res = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
    if (res.status === 204) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Manager</h1>
        <p className="subtitle">
          CI/CD Pipeline Demo — deployed automatically via GitHub Actions
        </p>
        <div className="stats">
          {doneCount}/{tasks.length} tasks completed
        </div>
      </header>

      <main className="app-main">
        <TaskForm onAdd={handleAdd} />

        {loading && <p className="status">Loading tasks...</p>}
        {error && <p className="status error">Error: {error}</p>}

        {!loading && !error && (
          <TaskList
            tasks={tasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}

export default App;

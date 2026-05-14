import React, { useState } from "react";

function TaskForm({ onAdd }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} data-testid="task-form">
      <input
        type="text"
        placeholder="Add a new task..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="task-input"
        data-testid="task-input"
        maxLength={100}
      />
      <button type="submit" className="btn-add" data-testid="btn-add">
        + Add Task
      </button>
    </form>
  );
}

export default TaskForm;

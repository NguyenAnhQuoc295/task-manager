import React from "react";

function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return <p className="empty">No tasks yet. Add one above!</p>;
  }

  return (
    <ul className="task-list" data-testid="task-list">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={`task-item ${task.done ? "done" : ""}`}
          data-testid={`task-item-${task.id}`}
        >
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => onToggle(task.id, !task.done)}
            data-testid={`checkbox-${task.id}`}
          />
          <span className="task-title">{task.title}</span>
          <button
            className="btn-delete"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete ${task.title}`}
            data-testid={`btn-delete-${task.id}`}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

export default TaskList;

// src/__tests__/TaskList.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import TaskList from "../components/TaskList";

const mockTasks = [
  { id: 1, title: "Learn CI/CD", done: false },
  { id: 2, title: "Deploy to AWS", done: true },
];

describe("TaskList", () => {
  it("renders all tasks", () => {
    render(
      <TaskList tasks={mockTasks} onToggle={() => {}} onDelete={() => {}} />,
    );
    expect(screen.getByText("Learn CI/CD")).toBeInTheDocument();
    expect(screen.getByText("Deploy to AWS")).toBeInTheDocument();
  });

  it("shows empty message when no tasks", () => {
    render(<TaskList tasks={[]} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it("calls onDelete when delete button clicked", () => {
    const mockDelete = vi.fn();
    render(
      <TaskList tasks={mockTasks} onToggle={() => {}} onDelete={mockDelete} />,
    );
    fireEvent.click(screen.getByTestId("btn-delete-1"));
    expect(mockDelete).toHaveBeenCalledWith(1);
  });

  it("calls onToggle with correct id and toggled done value", () => {
    const mockToggle = vi.fn();
    render(
      <TaskList tasks={mockTasks} onToggle={mockToggle} onDelete={() => {}} />,
    );
    fireEvent.click(screen.getByTestId("checkbox-1"));
    expect(mockToggle).toHaveBeenCalledWith(1, true); // done was false → toggle to true
  });

  it("applies done class to completed tasks", () => {
    render(
      <TaskList tasks={mockTasks} onToggle={() => {}} onDelete={() => {}} />,
    );
    expect(screen.getByTestId("task-item-2")).toHaveClass("done");
    expect(screen.getByTestId("task-item-1")).not.toHaveClass("done");
  });
});

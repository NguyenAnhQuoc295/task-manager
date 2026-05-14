// src/__tests__/TaskForm.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskForm from "../components/TaskForm";

describe("TaskForm", () => {
  it("renders input and button", () => {
    render(<TaskForm onAdd={() => {}} />);
    expect(screen.getByTestId("task-input")).toBeInTheDocument();
    expect(screen.getByTestId("btn-add")).toBeInTheDocument();
  });

  it("calls onAdd with trimmed title on submit", async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();
    render(<TaskForm onAdd={mockOnAdd} />);

    await user.type(screen.getByTestId("task-input"), "  New Task  ");
    await user.click(screen.getByTestId("btn-add"));

    expect(mockOnAdd).toHaveBeenCalledWith("New Task");
  });

  it("clears input after submit", async () => {
    const user = userEvent.setup();
    render(<TaskForm onAdd={() => {}} />);
    const input = screen.getByTestId("task-input");

    await user.type(input, "Some task");
    await user.click(screen.getByTestId("btn-add"));

    expect(input.value).toBe("");
  });

  it("does NOT call onAdd when input is empty", async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();
    render(<TaskForm onAdd={mockOnAdd} />);

    await user.click(screen.getByTestId("btn-add"));
    expect(mockOnAdd).not.toHaveBeenCalled();
  });
});

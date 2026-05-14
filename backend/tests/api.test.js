// tests/api.test.js
const request = require("supertest");
const app = require("../src/app");

// Reset data trước mỗi test để tránh ảnh hưởng lẫn nhau
beforeEach(() => {
  app.resetTasks();
});

// ─────────────────────────────────────────
describe("GET /health", () => {
  it("should return status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

// ─────────────────────────────────────────
describe("GET /api/tasks", () => {
  it("should return array of tasks", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("each task should have id, title, done fields", async () => {
    const res = await request(app).get("/api/tasks");
    const task = res.body[0];
    expect(task).toHaveProperty("id");
    expect(task).toHaveProperty("title");
    expect(task).toHaveProperty("done");
  });
});

// ─────────────────────────────────────────
describe("POST /api/tasks", () => {
  it("should create a new task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "New demo task" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("New demo task");
    expect(res.body.done).toBe(false);
    expect(res.body.id).toBeDefined();
  });

  it("should return 400 when title is missing", async () => {
    const res = await request(app).post("/api/tasks").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });

  it("should return 400 when title is empty string", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "   " });
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────
describe("PATCH /api/tasks/:id", () => {
  it("should update task done status", async () => {
    const res = await request(app).patch("/api/tasks/1").send({ done: true });
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });

  it("should return 404 for non-existent task", async () => {
    const res = await request(app).patch("/api/tasks/999").send({ done: true });
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────
describe("DELETE /api/tasks/:id", () => {
  it("should delete a task and return 204", async () => {
    const res = await request(app).delete("/api/tasks/1");
    expect(res.status).toBe(204);
  });

  it("should return 404 after deleting", async () => {
    await request(app).delete("/api/tasks/1");
    const res = await request(app).get("/api/tasks/1");
    expect(res.status).toBe(404);
  });
});

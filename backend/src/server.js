// src/server.js — Entry point, chỉ start server ở đây
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Task Manager API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

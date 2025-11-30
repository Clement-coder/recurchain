const { Pool } = require("pg");
const config = require("./config");
const app = require("./app");

const pool = new Pool({
  ...config.postgres,
  ssl: { rejectUnauthorized: false } // ✅ REQUIRED FOR RENDER
});

pool.connect()
  .then(() => {
    console.log("✅ PostgreSQL connected securely to Render");

    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });
  })
  .catch(err => {
    console.error("❌ Database connection error:", err);
  });

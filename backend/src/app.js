const express = require("express");
const cors = require("cors");

const agentRoutes = require("./routes/agents");
const walletRoutes = require("./routes/wallet");
const offrampRoutes = require("./routes/offramp");

const app = express();

app.use(cors());
app.use(express.json());

/* ✅ ROOT HEALTH ROUTE */
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "✅ RecurChain Backend is Live on Render 🚀"
  });
});

app.use("/api/agents", agentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/offramp", offrampRoutes);

module.exports = app;

const express = require("express");
const cors = require("cors");
const agentRoutes = require("./routes/agents");
const walletRoutes = require("./routes/wallet");
const offrampRoutes = require("./routes/offramp");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/agents", agentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/offramp", offrampRoutes);

module.exports = app;

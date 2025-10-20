require("dotenv").config();
const express = require("express");
const { connect } = require("./config/database");


const authRoutes = require("./routes/authRoute");
const adminRoutes = require("./routes/adminRoute");
const chatRoutes = require("./routes/chatRoute");

const app = express();
app.use(express.json());

app.use("/api", authRoutes);
app.use("/admin/api", adminRoutes);
app.use("/api/chat", chatRoutes);

const startServer = async () => {
  await connect();  // now waits until DB is connected and console logged
  const port = process.env.PORT || 3000;
 app.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`Server is running at ${url}`);
});
};

startServer();

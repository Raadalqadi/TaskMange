require('dotenv').config();
const express = require("express");
const app = express();
const port = process.env.PORT || 6000;
const cors = require("cors");
const userRoutes = require("./Router/UserRouter");
const taskRoutes = require("./Router/TaskRouter");
/* const path = require('path'); */

app.use(cors());
app.use(express.json());
app.use(userRoutes);
app.use(taskRoutes);
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
/* app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
}); */


app.listen(port, () => {
  console.log("sevrer is running");
});

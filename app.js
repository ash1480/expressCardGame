const express = require("express");
const port = 1000;

const app = express();
app.use(express.json());

const userData = require("./data/users.json");
const cardData = require("./data/cards.json");

app.get("/cards", (req, res) => {
  res.json(cardData);
  // filter cards
});

app.post("/cards", (req, res) => {
  // create new cards
});

app.post("/cards", (req, res) => {
  // edit existing cards
});

app.delete("/cards", (req, res) => {
  // delete a cards
});


// listing
app.listen(port, (req, res) => {
  console.log(`on port ${port}`);
});

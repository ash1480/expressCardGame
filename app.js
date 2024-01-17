const express = require("express");
const port = 1000;

const app = express();
const fs = require("fs");
const path = require("path");
app.use(express.json());

const userData = require("./data/users.json");
const cardData = require("./data/cards.json");
let cardFilePath = path.join(__dirname, "data/cards.json");
let id;

//serch cards function
const searchCards = (req, currentMatchs, currSearch) => {
  const query = req.query;
  let cards = [];
  currentMatchs.map((element) => {
    const currValue = String(element[currSearch]);
    const searchParams = query[currSearch];
    console.log(currValue, searchParams);
    if (currValue === searchParams) {
      cards.push(element);
    }
  });
  return cards;
};

// home endpoint
app.get("/", (req, res) => {
  res.send("Welcome");
});

// search cards endpoint
app.get("/cards", (req, res) => {
  let cardsThatMatch = cardData.cards;
  Object.keys(req.query).forEach((currSearch) => {
    cardsThatMatch = searchCards(req, cardsThatMatch, currSearch);
  });
  res.json(cardsThatMatch);
});

//create card endpoint
app.post("/cards/create", (req, res) => {
  fs.readFile(cardFilePath, "utf8", (err, data) => {
    if (err) res.send("error reading file", err);
    try {
      const jsonCards = JSON.parse(data);
      id = jsonCards.cards[jsonCards.cards.length - 1].id + 1;
      let doupId = jsonCards.cards.find((card) => card.id === id);
      while (doupId) {
        id++;
      }
      const newCard = { id: id, ...req.body };
      jsonCards.cards.push(newCard);
      fs.writeFile(cardFilePath, JSON.stringify(jsonCards, null, 2), (err) => {
        if (err) console.error("error writing file", err);
      });
      res.send(`your card was added to the deck: ${JSON.stringify(newCard)}`);
    } catch (parseError) {
      res.send("Error parsing JSON data", parseError);
    }
  });
});

//edit card endpoint
app.put("/cards/:id", (req, res) => {
  const cardId = Number(req.params.id);
  const userChanges = req.body;
  const listOfChanges = Object.keys(req.body);
  try {
    fs.readFile(cardFilePath, "utf8", (err, data) => {
      const jsonCards = JSON.parse(data);
      if (!jsonCards.cards) {
        res.status(404).send("card not found");
      }
      let currCard = jsonCards.cards.find(({ id }) => id === cardId);
      listOfChanges.forEach((change) => {
        currCard[change] = userChanges[change];
      });
      console.log(currCard);
      fs.writeFile(cardFilePath, JSON.stringify(jsonCards, null, 2), (err) => {
        if (err) res.status(err).send("error writing file");
      });
      res.send(
        `card has been edited. updated card: \n${JSON.stringify(currCard)}`
      );
    });
  } catch (parseErr) {
    res.send("Error parsing JSON data", parseErr);
  }
});

// delete card endpoint
app.delete("/cards/:id", (req, res) => {
  const cardId = Number(req.params.id);
  try {
    fs.readFile(cardFilePath, "utf8", (err, data) => {
      const jsonCards = JSON.parse(data);
      if (!jsonCards.cards) {
        res.status(404).send("card not found");
      }
      let currCardIndex = jsonCards.cards.findIndex(({ id }) => id === cardId);
      let currCard = jsonCards.cards.find(({ id }) => id === cardId);
      if (currCard) {
        jsonCards.cards.splice(currCardIndex, 1);
        console.log(currCard);
        fs.writeFile(
          cardFilePath,
          JSON.stringify(jsonCards, null, 2),
          (err) => {
            if (err) res.status(err).send("error writing file");
          }
        );
        res.send(`deleted card: ${JSON.stringify(currCard)}`);
      } else {
        res.send("card not found");
      }
    });
  } catch (parseErr) {
    res.send("Error parsing JSON data", parseErr);
  }
});

// listeing to port
app.listen(port, (req, res) => {
  console.log(`on port ${port}`);
});

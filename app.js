const express = require("express");
const port = 1000;

const jwt = require("jsonwebtoken");
const { expressjwt } = require("express-jwt");

const app = express();
const fs = require("fs");
const path = require("path");

app.use(express.json());
require("dotenv").config();

const userData = require("./data/users.json");
const cardData = require("./data/cards.json");
const secret = process.env.SECRET;

let cardFilePath = path.join(__dirname, "data/cards.json");
let currUser;
let id;

//check auth
const checkAuth = expressjwt({ secret: secret, algorithms: ["HS256"] });

// function to send new jwt key
const authKey = (username) => {
  if (currUser) {
    const token = jwt.sign({ username: username }, secret, {
      algorithm: "HS256",
      expiresIn: "10s",
    });
    return token;
  }
  return "please log in";
};

//serch cards function
const searchCards = (req, currentMatchs, currSearch) => {
  const query = req.query;
  let cards = [];
  currentMatchs.map((element) => {
    const currValue = String(element[currSearch]);
    const searchParams = query[currSearch];
    if (currValue === searchParams) {
      cards.push(element);
    }
  });
  return cards;
};

// auth endpoint
app.post("/getToken", (req, res, next) => {
  const { username, password } = req.body;
  const user = userData.users.find((user) => user.username === username);
  if (!user || user.password !== password) {
    return res.status(401).json({ errorMessage: "username or password incorect" });
  }
  currUser = { username: username };
  res.send(`you're logged in`)
  next();
});

// auth middleware
app.use((req, res, next) => {
  console.log(currUser)
  if (!currUser) {
    res.send("you have to login at /getToken to accsess that");
  } else {
    const token = authKey(currUser.username);
    req.headers.authorization = `bearer ${token}`;
    if (token) {
      checkAuth(req, res, (err) => {
        if (err) {
          res.status(401).json({ message: "Invalid token", err });
        } else {
          next()
        }
      });
    }
  }
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
      let newCard;
      const jsonCards = JSON.parse(data);
      id = req.body.id ? req.body.id : 1
      console.log("id: ", id)
      let doupId = jsonCards.cards.find((card) => card.id === id);
      console.log("doupID: ",doupId)
      while (doupId) {
        id++;
        doupId = jsonCards.cards.find((card) => card.id === id);
        console.log(id)
      }
      newCard = { ...req.body, id: id };
      jsonCards.cards.splice(id -1, 0, newCard);
      fs.writeFile(cardFilePath, JSON.stringify(jsonCards, null, 2), (err) => {
        if (err) console.error("error writing file", err);
      });
      let successMsg = `your card was added to the deck: ${JSON.stringify(newCard)}`
      if (req.body.id !== id) {
        msg = "that id was already taken. " + successMsg;
      }
      res.send(msg);
    } catch (parseError) {
      res.status(404).send("Error parsing JSON data");
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
      fs.writeFile(cardFilePath, JSON.stringify(jsonCards, null, 2), (err) => {
        if (err) res.status(err).send("error writing file");
      });
      res.send(
        `card has been edited. updated card: \n${JSON.stringify(currCard)}`
      );
    });
  } catch (parseErr) {
    res.status(404).send("Error parsing JSON data", parseErr);
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
    res.status(404).send("Error parsing JSON data", parseErr);
  }
});

// listeing to port
app.listen(port, (req, res) => {
  console.log(`on port ${port}`);
});

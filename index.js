require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Person = require("./models/person");
app.use(cors());
app.use(express.json());
app.use(express.static("dist"));
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(req.body),
    ].join(" ");
  })
);

const isDuplicatedName = async (name) => {
  const foundPerson = await Person.find({
    name,
  }).exec();

  if (!foundPerson.length) {
    return false;
  }
  return true;
};

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/", (request, res) => {
  res.send("<h1>Phonebook API</h1>");
});

app.get("/info", (request, res) => {
  res.send(`
    <p>Phonebook has info for ${phonebook.length} people. <p/>
    <p>${new Date().toString()}<p/>
  `);
});

app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id).then((foundPerson) => {
    res.json(foundPerson);
  });
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findByIdAndDelete(req.params.id).then((_deletedPerson) => {
    res.status(204).end();
  });
});

app.post("/api/persons", async (req, res) => {
  const body = req.body;

  if (!body.name) {
    return res.status(400).json({
      error: "Name missing",
    });
  } else if (!body.number) {
    return res.status(400).json({
      error: "Number missing",
    });
  } else {
    const isNameDuplicate = await isDuplicatedName(body.name);
    if (isNameDuplicate) {
      return res.status(400).json({
        error: "Name must be unique",
      });
    }
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    res.json(savedPerson);
  });
});

app.put('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    person.number = req.body.number;
    person.save().then(savedNote => {
      res.json(savedNote)
    })
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

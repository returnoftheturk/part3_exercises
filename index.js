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

app.get("/api/persons", (req, res, next) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  }).catch(next);
});

app.get("/", (request, res) => {
  res.send("<h1>Phonebook API</h1>");
});

app.get("/info", (req, res, next) => {
  Person.find({}).then((persons) => {
    res.send(`
      <p>Phonebook has info for ${persons.length} people. <p/>
      <p>${new Date().toString()}<p/>
    `);
  }).catch(next);
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id).then((foundPerson) => {
    res.json(foundPerson);
  }).catch(next);
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id).then((_deletedPerson) => {
    res.status(204).end();
  }).catch(next);
});

app.post("/api/persons", async (req, res, next) => {
  const body = req.body;

  const isNameDuplicate = await isDuplicatedName(body.name);
  if (isNameDuplicate) {
    return res.status(400).json({
      error: "Name must be unique",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    res.json(savedPerson);
  }).catch(next);
});

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate(
    req.params.id, 
    { name, number },
    { new: true, runValidators: true, context: 'query' }  
  ).then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(next);
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

const errorHandling = (err, req, res, next) => {
  console.error(err.message);

  if(err.name === 'CastError'){
    return res.status(400).send({ error: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  next(err)
}

app.use(unknownEndpoint);
app.use(errorHandling);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

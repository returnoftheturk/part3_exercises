const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

console.log("connecting to", url);
mongoose.set("strictQuery", false);
mongoose
  .connect(url)
  .then((_result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 5,
    required: true
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        // The updated regular expression to validate the phone number
        const phoneRegex =  /^\d{2,3}-\d+$/;

        // Test the phone number against the regex
        return phoneRegex.test(value);
      },
      message: 'Invalid phone number format. Please use the format: 222-1234567 or 22-1234567',
    },
  },
});

personSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);

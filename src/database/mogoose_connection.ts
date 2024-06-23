const connection = require("mongoose").connect(process.env.DB_URI, {
  useFindAndModify: false,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

module.exports = connection;

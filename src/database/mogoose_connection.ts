const connection = require("mongoose").connect(process.env.DB_URI, {
  useFindAndModify: false
});

module.exports = connection;

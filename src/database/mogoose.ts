const mongoose = require("mongoose");

//To handle asynchronous codes
mongoose.Promise = global.Promise;

mongoose
  .connect("mongodb+srv://admin:A1_mongodb@cluster0.go2xt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useFindAndModify: false
  })
  .then(() => console.log("Database is Connected"))
  .catch(error => console.log(error));

module.exports = mongoose;

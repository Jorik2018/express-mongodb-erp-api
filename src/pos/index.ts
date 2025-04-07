import express, { Application, Request, Response } from 'express';
let http = require("http"),
  bodyParser = require("body-parser");
const app: Application = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
console.log("Server started");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all("/*", (req: Request, res: Response, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Access-Token,X-Key");
  if (req.method == "OPTIONS") {
    res.status(200).end();
  } else {
    next();
  }
});

app.use("/api/inventory", require("./api/inventory"));
app.use("/api", require("./api/transactions"));

let liveCart:any = [];
// Websocket logic for Live Cart
io.on("connection", (socket:any) => {
  socket.on("cart-transaction-complete",  () =>{
    socket.broadcast.emit("update-live-cart-display", {});
  });

  // upon page load, give user current cart
  socket.on("live-cart-page-loaded", ()=> {
    socket.emit("update-live-cart-display", liveCart);
  });

  // upon connecting, make client update live cart
  socket.emit("update-live-cart-display", liveCart);

  // when the cart data is updated by the POS
  socket.on("update-live-cart",  (cartData:any) =>{
    // keep track of it
    liveCart = cartData;

    // broadcast updated live cart to all websocket clients
    socket.broadcast.emit("update-live-cart-display", liveCart);
  });
});

const PORT = process.env.PORT || 8001;

server.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));

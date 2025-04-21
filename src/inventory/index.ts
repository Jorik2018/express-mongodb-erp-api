import { Socket } from "socket.io";
import { Router } from 'express';

const configureSocket = (io: Socket) => {
  let liveCart: any = [];
  // Websocket logic for Live Cart
  io.on("connection", (socket: any) => {
    socket.on("cart-transaction-complete", () => {
      socket.broadcast.emit("update-live-cart-display", {});
    });

    // upon page load, give user current cart
    socket.on("live-cart-page-loaded", () => {
      socket.emit("update-live-cart-display", liveCart);
    });

    // upon connecting, make client update live cart
    socket.emit("update-live-cart-display", liveCart);

    // when the cart data is updated by the POS
    socket.on("update-live-cart", (cartData: any) => {
      // keep track of it
      liveCart = cartData;
      // broadcast updated live cart to all websocket clients
      socket.broadcast.emit("update-live-cart-display", liveCart);
    });
  });
}

export default configureSocket;

const router = Router();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  const logger = require("morgan");
  router.use(logger("dev"));
}

const { authMiddleware } = require("./middlewares/authMiddleware");

const { errorMiddleware } = require("./middlewares/errorMiddleware");

const indexRouter = require("./routes/indexRoute");

const usersController = require("./controllers/usersController")();

router.use("/", indexRouter(usersController));

router.use("/users", authMiddleware, require("./routes/usersRoute")(usersController));

const bookstoresController = require("./controllers/bookstoresController")();

router.use("/bookstores", authMiddleware, require("./routes/bookstoresRoute")(bookstoresController));

const booksController = require("./controllers/booksController")();

router.use("/books", authMiddleware, require("./routes/booksRoute")(booksController));

const bookstoresBooksController = require("./controllers/bookstoresBooksController")();

router.use(
  "/bookstores-books",
  authMiddleware,
  require("./routes/bookstoresBooksRoute")(
    booksController,
    bookstoresController,
    bookstoresBooksController
  )
);

router.use("/status", authMiddleware, require("./routes/statusRoute")(require("./controllers/statusController")()));

const Router404 = require("./routes/404Route");

router.use("*", Router404);

router.use(errorMiddleware);
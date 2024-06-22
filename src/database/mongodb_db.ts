import { MongoClient } from "mongodb";

const db = new MongoClient(process.env.DB_URI!).connect().then((client: MongoClient) => {
  return client.db(process.env.DBNAME);
});

export default db;

import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;

function db(): Promise<Db> {
  return new Promise((resolve, reject) => {
    const uri = process.env.DB_URI;
    const dbName = process.env.DBNAME;
    if (!client) {
      client = new MongoClient(uri!);
      client.connect()
        .then(() => {
          if (client) {
            const db = client.db(dbName);
            resolve(db);
          } else {
            reject(new Error("MongoClient is not initialized"));
          }
        })
        .catch((err: Error) => {
          client = null; // Reset client on failure to allow retry
          reject(err);
        });
    } else {
      resolve(client.db(dbName));
    }
  });
}

export default db;
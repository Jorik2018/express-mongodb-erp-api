import { createPool, Pool, PoolConnection } from 'mysql2/promise';

let client: Pool | null = null;

const db = (): Promise<PoolConnection> => {
  return new Promise((resolve, reject) => {
    const uri = process.env.DB_URI;
    if (!client) {
      client = createPool(uri!);
    }
    client.getConnection()
      .then((connection) => {
        resolve(connection);
      })
      .catch((err: Error) => {
        client = null;
        reject(err);
      });
  });
}

export default db; 
import { db } from '../../database/objection_db';

export default () => {

  const getUsers = () => {
    return db().then(db => db
      .select("*")
      .from("users")
      .orderBy("id"));
  };

  const getUserById = (id: string) => {
    return db().then(db => db
      .select("*")
      .from("users")
      .where({ id })
      .orderBy("id"));
  };

  const getUserByEmail = (email: string) => {
    return db().then(db => db
      .select("*")
      .from("users")
      .where({ email }));
  };

  return {
    getUsers,
    getUserById,
    getUserByEmail,
  };

};

import { db } from '../../database/objection_db';

export default () => {

  const getBookstores = () => {
    return db().then(db => db
      .select("*")
      .from("bookstores")
      .orderBy("id"));
  };

  const createBookstore = (name: string) => {
    return db().then(db => db("bookstores")
      .insert({
        name,
      })
      .returning("*"));
  };

  const getBookstoreById = (id: string) => {
    return db().then(db => db
      .select("*")
      .from("bookstores")
      .where("id", id));
  };

  const getBookstoreByContent = (name: string) => {
    return db().then(db => db
      .select("*")
      .from("bookstores")
      .where({ name }));
  };

  const deleteBookstoreById = (id: string) => {
    return db().then(db => db("bookstores")
      .where({ id })
      .del()
      .returning("*"));
  };

  const getBooksForBookstoreById = (id: string) => {
    return db().then(db => db
      .select([
        "books.*",
        "bookstores_books.id as stock_id",
        "bookstores_books.quantity",
      ])
      .from("books")
      .innerJoin("bookstores_books", "books.id", "bookstores_books.book_id")
      .where("bookstore_id", id)
      .orderBy("books.id"));
  };

  return {
    getBookstores,
    createBookstore,
    getBookstoreById,
    getBookstoreByContent,
    deleteBookstoreById,
    getBooksForBookstoreById,
  };
};

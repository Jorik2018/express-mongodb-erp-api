import { db } from '../../database/objection_db';

export default () => {

  const getBookstoresBooks = () => {
    return db().then(db => db.select("*")
      .from("bookstores_books")
      .orderBy("id"));
  };

  const createBookstoresBooks = (book_id: number, bookstore_id: number, quantity: number) => {
    return db().then(db => db("bookstores_books")
      .insert({
        book_id,
        bookstore_id,
        quantity,
      })
      .returning("*"));
  };

  const getBookstoresBooksById = (id: string) => {
    return db().then(db => db.select("*")
      .from("bookstores_books")
      .where({ id })
      .orderBy("id"));
  };

  const getBookstoresBooksByContent = (book_id: number, bookstore_id: number) => {
    return db().then(db => db.select("*")
      .from("bookstores_books")
      .where({ book_id, bookstore_id }));
  };

  const updateBookstoresBooks = (id: string, quantity: number) => {
    return db().then(db => db("bookstores_books")
      .where({ id })
      .update({ quantity, updated_at: new Date().toISOString() })
      .returning("*"));
  };

  const deleteBookstoresBooksById = (id: string) => {
    return db().then(db => db("bookstores_books")
      .where({ id })
      .del()
      .returning("*"));
  };

  return {
    getBookstoresBooks,
    createBookstoresBooks,
    getBookstoresBooksById,
    getBookstoresBooksByContent,
    updateBookstoresBooks,
    deleteBookstoresBooksById,
  };

};

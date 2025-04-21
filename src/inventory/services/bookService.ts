import { db } from '../../database/objection_db';

export default () => {
  
  const getBooks = () => {
    return db().then(db => db.select("*")
      .from("books")
      .orderBy("id")
    );
  };

  const createBook = (title: string, author: string, summary: string) => {
    return db().then(db => db("books")
      .insert({
        title,
        author,
        summary,
      })
      .returning("*"));
  };

  const getBookById = (id: string) => {
    return db().then(db => db.select("*")
      .from("books")
      .where("id", id));
  };

  const getBookByContent = (title: string, author: string) => {
    return db().then(db => db.select("*")
      .from("books")
      .where({ title, author }));
  };

  const deleteBookById = (id: any) => {
    return db().then(db => db("books")
      .where({ id })
      .del()
      .returning("*"));
  };

  const getBookstoresForBookById = (id: any) => {
    return db().then(db => db.select([
      "bookstores.*",
      "bookstores_books.id as stock_id",
      "bookstores_books.quantity",
    ])
      .from("bookstores")
      .innerJoin(
        "bookstores_books",
        "bookstores.id",
        "bookstores_books.bookstore_id"
      )
      .where("book_id", id)
      .orderBy("bookstores.id"));
  };

  return {
    getBooks,
    createBook,
    getBookById,
    getBookByContent,
    deleteBookById,
    getBookstoresForBookById,
  };
};

module.exports = (db:any) => {
  const getBooks = () => {
    return db
      .select("*")
      .from("books")
      .orderBy("id")
      .then((result:any) => result);
  };

  const createBook = (title: string, author: string, summary: string) => {
    return db("books")
      .insert({
        title,
        author,
        summary,
      })
      .returning("*")
      .then((result:any) => result);
  };

  const getBookById = (id: string) => {
    return db
      .select("*")
      .from("books")
      .where("id", id)
      .then((result:any) => result);
  };

  const getBookByContent = (title:string, author:string) => {
    return db
      .select("*")
      .from("books")
      .where({ title, author })
      .then((result:any) => result);
  };

  const deleteBookById = (id:any) => {
    return db("books")
      .where({ id })
      .del()
      .returning("*")
      .then((result:any) => result);
  };

  const getBookstoresForBookById = (id:any) => {
    return db
      .select([
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
      .orderBy("bookstores.id")
      .then((result:any) => result);
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

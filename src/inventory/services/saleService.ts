import db from "../../database/mysql_db";

const find = (id: string) => {
    return db().then((db) => db.query(
        'SELECT * FROM db.sales WHERE db.sales.sale_id = ?',
        [id]
    ));
}

const destroy = (id: string) => {
    return db().then((db) => db.query(
        'DELETE FROM db.sales WHERE db.sales.sale_id = ?',
        [id]
    ));
}

const insert = ({ sale_date }: any) => {
    let values_string = 'sale_date';
    return db().then((db) => db.query(
        `INSERT INTO db.sales (${values_string}) VALUES(?)`,
        [sale_date]
    ));
}

const update = (id: string, { sale_date }: any) => {
    let values = [sale_date, id];
    return db().then((db) => db.query(`
        UPDATE db.sales 
        SET 
          db.sales.sale_date = ? 
          WHERE db.sales.sale_id = ?
        `,
        values
    ));
}

const list = () => {
    return db().then((db) => db.query(
        'SELECT * FROM db.sales'
    ));
}

export default {
    insert,
    update,
    list,
    find,
    destroy
}
  
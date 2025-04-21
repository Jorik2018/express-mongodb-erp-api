import db from "../../database/mysql_db";

const find = (id: string) => {
    return db().then((db) => db.query(
        'SELECT * FROM db.orders WHERE db.orders.order_id = ?',
        [id]
    ));
}

const destroy = (id: string) => {
    return db().then((db) => db.query(
        'DELETE FROM db.orders WHERE db.orders.order_id = ?',
        [id]
    ));
}

const insert = ({ order_date }: any) => {
    let values_string = 'order_date';
    return db().then((db) => db.query(
        `INSERT INTO db.orders (${values_string}) VALUES(?)`,
        [order_date]
    ));
}

const update = (id: string, { order_date }: any) => {
    let values = [order_date, id];
    return db().then((db) => db.query(`
        UPDATE db.orders 
        SET 
          db.orders.order_date = ? 
          WHERE db.orders.order_id = ?
        `,
        values
    ));
}

const list = () => {
    return db().then((db) => db.query(
        'SELECT * FROM db.orders'
    ));
}

export default {
    insert,
    update,
    list,
    find,
    destroy
}
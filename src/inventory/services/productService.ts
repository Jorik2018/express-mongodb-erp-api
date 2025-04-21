import db from "../../database/mysql_db";

const find = (id: string) => {
    return db().then((db) => db.query(
        'SELECT * FROM db.products WHERE db.products.product_id = ?',
        [id]
    ));
}

const destroy = (id: string) => {
    return db().then((db) => db.query(
        'DELETE FROM db.products WHERE db.products.product_id = ?',
        [id]
    ));
}

const insert = ({ product_type_id, order_id, sale_id, exp_date, location }: any) => {
    let values_string = 'product_type_id, order_id, sale_id, exp_date, location';
    return db().then((db) => db.query(
        `INSERT INTO db.products (${values_string}) VALUES(?, ?, ?, ?, ?)`,
        [product_type_id, order_id, sale_id, exp_date, location]
    ));
}

const update = (id: string, { product_type_id, order_id, sale_id, exp_date, location }: any) => {
    return db().then((db) => db.query(`
      UPDATE db.products 
      SET 
        db.products.product_type_id = ?, 
        db.products.order_id = ?, 
        db.products.sale_id = ?, 
        db.products.exp_date = ?, 
        db.products.location = ?
        WHERE db.products.product_id = ?
        `,
        [product_type_id, order_id, sale_id, exp_date, location, id]
    ));
}

const list = () => {
    return db().then((db) => db.query(
        'SELECT * FROM db.products'
    ));
}

const listProductType = (product_type_id: string) => {
    return db().then((db) => db.query(
        'SELECT * FROM db.products WHERE db.products.product_type_id = ?', [product_type_id]
    ));
}

const listSale = (sale_id: string) => {
    return db().then((db) => db.query(
        'SELECT * FROM db.products WHERE db.products.sale_id = ?', [sale_id]
    ));
}

export default {
    insert,
    update,
    list,
    find,
    destroy,
    listProductType,
    listSale
}
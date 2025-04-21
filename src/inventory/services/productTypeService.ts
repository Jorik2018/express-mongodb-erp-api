import db from "../../database/mysql_db";

const find = (id: string) => {
    return db().then((db) => db.query(`
        SELECT db.product_types.*, db.departments.dept_name, COUNT(db.products.product_id) AS in_stock
        FROM db.product_types 
          INNER JOIN db.departments ON db.product_types.dept_id = db.departments.dept_id
          LEFT OUTER JOIN db.products ON db.product_types.product_type_id = db.products.product_type_id
              AND db.products.sale_id IS NULL
        WHERE db.product_types.product_type_id = ?
        GROUP BY db.product_types.product_type_id
        ORDER BY db.product_types.product_type_id
        `,
        [id]
    ));
}

const destroy = (id: string) => {
    return db().then((db) => db.query(
        'DELETE FROM db.product_types WHERE db.product_types.product_type_id = ?',
        [id]
    ));
}

const insert = ({ dept_id, product_type_name, price }: any) => {
    let values_string = 'dept_id, product_type_name, price';
    return db().then((db) => db.query(
        `INSERT INTO db.product_types (${values_string}) VALUES(?, ?, ?)`,
        [dept_id, product_type_name, price]
    ));
}

const update = (id: string, { dept_id, price, product_type_name }: any) => {
    return db().then((db) => db.query(`
        UPDATE db.product_types 
        SET 
          db.product_types.dept_id = ?, 
          db.product_types.price = ?, 
          db.product_types.product_type_name = ? 
          WHERE db.product_types.product_type_id = ?
        `,
        [dept_id, price, product_type_name, location, id]
    ));
}

const list = () => {
    return db().then((db) => db.query(`
        SELECT db.product_types.*, db.departments.dept_name, COUNT(db.products.product_id) AS in_stock
        FROM db.product_types 
          INNER JOIN db.departments ON db.product_types.dept_id = db.departments.dept_id
          LEFT OUTER JOIN db.products ON db.product_types.product_type_id = db.products.product_type_id
            AND db.products.sale_id IS NULL
        GROUP BY db.product_types.product_type_id
        ORDER BY db.product_types.product_type_id
        `));
}

const listByName = (product_type_name: string) => {
    return db().then((db) => db.query(`
        SELECT db.product_types.*, db.departments.dept_name, COUNT(db.products.product_id) AS in_stock
        FROM db.product_types 
          INNER JOIN db.departments ON db.product_types.dept_id = db.departments.dept_id
          LEFT OUTER JOIN db.products ON db.product_types.product_type_id = db.products.product_type_id
              AND db.products.sale_id IS NULL
        WHERE db.product_types.product_type_name LIKE ` + connection.escape('%' + product_type_name + '%') + ` 
        GROUP BY db.product_types.product_type_id
        ORDER BY db.product_types.product_type_id
      `));
}

const listByDepartment = (dept_id: string) => {
    return db().then((db) => db.query(
        `SELECT * FROM db.product_types WHERE db.product_types.dept_id = ?`, [dept_id]
    ));
}

const listQuantityByProductType = (product_type_id: string) => {
    return db().then((db) => db.query(`
        SELECT COUNT(*) as in_stock 
        FROM db.products 
          INNER JOIN db.product_types 
            ON db.products.product_type_id = db.product_types.product_type_id 
        WHERE db.product_types.product_type_id = ?
        AND db.products.sale_id IS NULL
        `, [product_type_id]
    ));
}

export default {
    insert,
    update,
    list,
    find,
    destroy,
    listByName,
    listByDepartment,
    listQuantityByProductType
}
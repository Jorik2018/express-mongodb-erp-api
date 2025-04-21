import db from "../../database/mysql_db";

const find = (id: string) => {
    return db().then((db) => db.query(
        'SELECT db.departments.*,db.users.first as manager_first, db.users.last as manager_last FROM db.departments JOIN db.users ON db.departments.dept_mngr = db.users.user_id WHERE db.departments.dept_id = ?',
        [id]
    ));
}

const destroy = (id: string) => {
    return db().then((db) => db.query(
        'DELETE FROM db.departments WHERE db.departments.dept_id = ?',
        [id]
    ));
}

const insert = ({ dept_name, dept_mngr }: any) => {
    let values_string = 'dept_name, dept_mngr';
    return db().then((db) => db.query(
        `INSERT INTO db.departments (${values_string}) VALUES(?, ?)`,
        [dept_name, dept_mngr]
    ));
}

const update = (id: string, { dept_name, dept_mngr }: any) => {
    return db().then((db) => db.query(`
        UPDATE db.departments 
        SET 
          db.departments.dept_name = ?, 
          db.departments.dept_mngr = ? 
          WHERE db.departments.dept_id = ?
        `,
        [dept_name, dept_mngr, id]
    ));
}

const list = () => {
    return db().then((db) => db.query(
        'SELECT db.departments.*, db.users.first as manager_first, db.users.last as manager_last FROM db.departments JOIN db.users ON db.departments.dept_mngr = db.users.user_id'
    ));
}

export default {
    insert,
    update,
    list,
    find,
    destroy
}
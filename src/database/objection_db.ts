import { Request, Response } from 'express';

const { Model } = require('objection');

type Transaction = { commit: () => Promise<void>, rollback: () => Promise<void> }

type Field = ((value?: string) => Field) & { primary: Field, references: Field };

type TableBuilder = { integer: Field, string: Field, increments: Field };

type Schema = {
    hasTable: (tableName: string) => Promise<boolean>,
    createTable: (tableName: string, buider: (tableBuilder: TableBuilder) => void) => Promise<void>
}
type Knex = {
    transaction: () => Promise<Transaction>,
    schema: Schema,
}

let knex: Knex;

let transaction: Transaction;

export class Person extends Model {
    static get tableName() {
        return 'persons';
    }

    static get relationMappings() {
        return {
            children: {
                relation: Model.HasManyRelation,
                modelClass: Person,
                join: {
                    from: 'persons.id',
                    to: 'persons.parentId'
                }
            }
        };
    }
}

function createKnex(): Promise<Knex> {
    return new Promise((resolve, reject) => {
        if (!knex) {
            knex = require('knex')({
                client: 'mysql2',
                connection: 'mysql://root:123456_m@127.0.0.1:3306/test'
                // {
                //     host: '127.0.0.1',
                //     port: 3306,
                //     user: 'root',
                //     password: '123456_m',
                //     database: 'test',
                // }
            });
            Model.knex(knex);
        }
        resolve(knex);
    })
}

const createTable = (schema: Schema, tableName: string, builder: (tableBuilder: TableBuilder) => void) =>
    schema.hasTable(tableName).then(hasTable => {
        if (!hasTable) {
            return schema.createTable(tableName, builder)
        }
    }).then(() => schema);


const db = () => createKnex()
    .then((knex) => knex.schema.hasTable('persons').then(hasTable => {
        if (!hasTable) {
            return createTable(knex.schema, 'persons', (tableBuilder: TableBuilder) => {
                tableBuilder.increments('id').primary();
                tableBuilder.integer('parentId').references('persons.id');
                tableBuilder.string('firstName');
            }).then(schema => createTable(schema, 'companies', (tableBuilder: TableBuilder) => {
                tableBuilder.increments('id').primary();
                tableBuilder.string('name');
            })).then(() => knex)
        } else {
            return knex;
        }
    }))
    .then((knex: Knex) => {
        if (!transaction) {
            return knex.transaction().then((t: Transaction) => { transaction = t; return knex; })
        }
        return knex;
    }).catch((e: Error) => {
        console.error("Error in database setup:", e);
        throw e;
    })

const knexMiddleware = (req: Request, res: Response, next: () => void) => {
    // knex.transaction()
    //     .then((transaction:Transaction) => {
    res.on('finish', () => {
        transaction.commit().then(() => {
            console.log('transaction.commit()');
        }).catch((error: Error) => {
            console.error(error);
        });
    });
    res.on('close', () => {
        if (!res.writableEnded) {
            transaction.rollback()
                .then(() => console.log('Transaction rolled back due to connection closed'))
                .catch((error: Error) => console.error('Transaction rollback failed due to connection closed:', error));
        }
    });
    next();
    // })
    // .catch(next);
}

export { db, Knex as knex, knexMiddleware };
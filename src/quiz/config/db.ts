import { Sequelize } from 'sequelize';

let seq: Sequelize;

export const sequelize: () => Sequelize = () => {
    if (!seq) {
        const { DB_CONNECTION, DB_CLIENT } = require('../../config').default;
        seq = new Sequelize(DB_CONNECTION, { dialect: DB_CLIENT });
    }
    return seq;
};

export async function initdb() {
    const seq = sequelize();
    require('../models/room').initRoom(seq);
    require('../models/user').initUser(seq);
    require('../models/quizmaster').initQM(seq);
    require('../models/result').initResult(seq);
    require('../models/question').initQuestion(seq);
    seq.sync().then(async () => {
        const initQueries = require('./tables');
        for (let i = 0; i < initQueries.length; i++) {
            await seq.query(initQueries[i]);
        }
    });


};

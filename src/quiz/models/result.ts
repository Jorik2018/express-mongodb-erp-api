import { Sequelize, DataTypes, ModelStatic, Model } from 'sequelize';
import { SequelizeAttributes } from '../types/attributes';
import { ResultAttributes, ResultModel } from '../types/result';
import { initRoom } from '../models/room'
import { initUser } from '../models/user';

export function initResult(sequelize: Sequelize): ModelStatic<ResultModel> {

    const attributes: SequelizeAttributes<ResultAttributes> = {
        roomid: {
            type: DataTypes.STRING,
            references: {
                model: initRoom(sequelize),
                key: 'id',
            },
            allowNull: false,
        },
        attempts: {
            type: DataTypes.JSON,
        },
        username: {
            type: DataTypes.STRING,
            references: {
                model: initUser(sequelize),
                key: 'username',
            },
            allowNull: false,
        },
        total: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    };
    return sequelize.define<ResultModel, ResultAttributes>('result', attributes, { createdAt: false, updatedAt: false });
}
import { Sequelize, DataTypes, ModelStatic } from 'sequelize';
import { SequelizeAttributes } from '../types/attributes';
import { QMAttributes, QMInstance, QMModel } from '../types/quizmaster';

export function initQM(sequelize: Sequelize): ModelStatic<QMModel> {

    const attributes: SequelizeAttributes<QMAttributes> = {
        username: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true,
            },
        },
        phone: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isNumeric: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        socket: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    };

    return sequelize.define<QMInstance, QMAttributes>('qm', attributes, { createdAt: false, updatedAt: false });

}
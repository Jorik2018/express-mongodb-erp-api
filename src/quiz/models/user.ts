import { Sequelize, DataTypes, ModelStatic } from 'sequelize';
import { SequelizeAttributes } from '../types/attributes';
import { UserAttributes, UserModel } from '../types/user';
import { Room } from '../controllers/room.controller';

export function initUser(sequelize: Sequelize): ModelStatic<UserModel> {

    const attributes: SequelizeAttributes<UserAttributes> = {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true,
            },
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isNumeric: true,
            },
        },
        roomid: {
            type: DataTypes.STRING,
            references: {
                model: Room,
                key: 'id',
            }
        },
        socket: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    };

    return sequelize.define<UserModel, UserAttributes>('user', attributes,
        { createdAt: false, updatedAt: false });

}
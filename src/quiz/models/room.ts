import { Sequelize, DataTypes, ModelStatic } from 'sequelize';
import { RoomAttributes, RoomModel } from '../types/room';
import { initQM } from '../models/quizmaster';


export const initRoom = (sequelize: Sequelize): ModelStatic<RoomModel> =>
    sequelize.define<RoomModel, RoomAttributes>('room', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING
        },
        state: {
            type: DataTypes.STRING,
            defaultValue: 'inactive',
        },
        qm: {
            type: DataTypes.STRING,
            references: {
                model: initQM(sequelize),
                key: 'username',
            },
            allowNull: false,
        },
    }, { createdAt: false, updatedAt: false });

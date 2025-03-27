import { Sequelize, DataTypes, ModelStatic } from 'sequelize';
import { SequelizeAttributes } from '../types/attributes';
import { QuestionAttributes, QuestionInstance, QuestionModel } from '../types/question';
import { initRoom } from '../models/room';

export function initQuestion(sequelize: Sequelize): ModelStatic<QuestionModel> {

    const attributes: SequelizeAttributes<QuestionAttributes> = {
        roomid: {
            type: DataTypes.STRING,
            references: {
                model: initRoom(sequelize),
                key: 'id',
            },
            allowNull: false,
        },
        question: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        options: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        answer: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    };

    return sequelize.define<QuestionInstance, QuestionAttributes>('question', attributes, { createdAt: false, updatedAt: false });

}
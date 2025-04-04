import { Sequelize } from 'sequelize';

export interface QMAttributes {
    username: string;
    email: string;
    phone: string;
    password: string;
    socket: string;
}

export type QMInstance = Sequelize.Instance<QMAttributes> & QMAttributes;

export type QMModel = Sequelize.Model<QMInstance, QMAttributes>;

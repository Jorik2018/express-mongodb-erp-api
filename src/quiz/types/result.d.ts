import { Sequelize, Model } from 'sequelize';
import { AttemptJSON } from './attempt';

export interface ResultAttributes {
    roomid: string;
    attempts?: AttemptJSON;
    username: string;
    total: number;
}

//export type ResultInstance = Sequelize.Instance<ResultAttributes> & ResultAttributes;

export type ResultModel = Model<ResultAttributes, ResultAttributes>;

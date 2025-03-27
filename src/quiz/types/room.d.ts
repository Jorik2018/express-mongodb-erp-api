import { Sequelize, Model } from 'sequelize';

export interface RoomAttributes {
    id: string;
    name: string;
    state?: string;
    qm: string;
}

//export type RoomInstance = Sequelize.Instance<RoomAttributes> & RoomAttributes;

//export interface RoomInstance extends Sequelize.Instance<RoomAttributes>, RoomAttributes {}
//export interface RoomInstance extends Sequelize.Instance<RoomAttributes>, RoomAttributes {}

export type RoomModel = Model<RoomAttributes>;

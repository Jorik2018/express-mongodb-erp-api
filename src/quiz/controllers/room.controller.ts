import { sequelize } from '../config/db';
import { initRoom } from '../models/room';
import { RoomModel } from '../types/room';
import { QM } from './qm.controller';
import { QMInstance } from '../types/quizmaster';
import * as userController from './user.controller';
import * as resultController from './result.controller';

export const Room = initRoom(sequelize());

export const createRoom = (roomid: string, qm: string) => Room.create({
    id: roomid,
    name: roomid,
    qm: qm,
});

export function getState(roomid: string): Promise<string> {
    console.log('Fetching state of room', roomid);
    return new Promise((resolve, reject) => {
        Room.findByPk(roomid)
            .then((room) => {
                if (room !== null) {
                    const { state } = room.get();
                    console.log('Fetched state:', state);
                    resolve(state!);
                } else {
                    throw 'No room with id ' + roomid;
                };
            })
            .catch((err) => {
                reject(err);
            });
    });
};

export function changeState(roomid: string, state: string): Promise<void> {
    console.log('Changing state of room ' + roomid + ' to ' + state);
    return new Promise((resolve, reject) => {
        Room.findByPk(roomid)
            .then((room) => {
                if (room !== null) {
                    return room.update({
                        state: state,
                    });
                }
                else {
                    throw 'No room with id ' + roomid;
                };
            })
            .then(() => {
                console.log('Changed state of room', roomid);
                resolve();
            })
            .catch((err) => {
                reject(err);
            });
    });
};

export function getQm(roomid: string): Promise<QMInstance> {
    console.log('Getting QM for room', roomid);
    return Room.findByPk(roomid)
        .then((room) => {
            if (room === null) {
                throw 'No room with id ' + roomid;
            } else {
                return QM.findByPk(room.get().qm);
            };
        });
};

export function getRooms(qm: string): Promise<RoomModel[]> {
    return Room.findAll({
        attributes: ['id', 'name'],
        where: { qm },
    }).then((rooms) => rooms.map((room) => room));
};

export function purge(roomid: string): Promise<void> {
    console.log('Purging data of room', roomid);
    return resultController.getByRoom(roomid)
        .then((results) => {
            console.log('Purging results...');
            results.map((result) => {
                result.destroy();
            });
            return userController.findByRoom(roomid);
        })
        .then((users) => {
            console.log('Purging users...');
            users.map((users) => {
                users.destroy();
            });
            console.log('Purging complete.')
        });
}

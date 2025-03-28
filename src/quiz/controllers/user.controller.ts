import db = require('../config/db');
import { initUser } from '../models/user';
import { UserModel } from '../types/user';

const { sequelize } = db;

export const User = initUser(sequelize());

export function createUser(username: string, email: string, phone: string, socket: string): Promise<UserModel> {
    console.log('Creating user...');
    console.log('Checking for duplication.');
    return User.findByPk(username)
        .then((user) => {
            if (user === null) {
                console.log('Creating new user...');
                return User.create({
                    username: username,
                    email: email,
                    phone: phone,
                    socket: socket,
                });
            } else if (user.get().email !== email || user.get().phone !== phone) {
                throw 'Username taken. If this is a reconnect request make sure all your credentials match';
            } else {
                console.log('Reconnecting user...');
                return user.update({
                    socket: socket,
                },
                    {
                        where: {
                            username: username,
                        },
                    });
            };
        })
        .then((user) => {
            console.log('User logged in.', user);
            return user;
        });
};

export function addToRoom(username: string, roomid: string): Promise<string[]> {
    console.log('Adding user to room...');
    return new Promise((resolve, reject) => {
        User.findByPk(username)
            .then((user) => {
                if (user !== null) {
                    return user.update({ roomid: roomid });
                } else {
                    throw 'User not found.';
                }
            })
            .then((user) => {
                return findByRoom(roomid);
            })
            .then((users) => {
                resolve(users.map((user, index) => user.get().username));
            })
            .catch((err:any) => reject(err));
    });
}

export function findByRoom(roomid: string): Promise<UserModel[]> {
    console.log('Finding users list for room');
    return new Promise((resolve, reject) => {
        User.findAll({
            attributes: ['username', 'socket'],
            where: {
                roomid: roomid,
            },
        })
            .then((users) => resolve(users))
            .catch((err:any) => reject(err));
    });
}
import db = require('../config/db');
import { initResult } from '../models/result';
import { ResultModel } from '../types/result';
import { getState } from './room.controller';
import { checkAnswer } from './ques.controller';
import { Leaderboard } from '../types/leaderboard';

const { sequelize } = db;

export const Result = initResult(sequelize());

export function createResult(roomid: string, username: string): Promise<ResultModel> {
    console.log('Creating result...');
    return new Promise((resolve, reject) => {
        Result.create({
            roomid: roomid,
            username: username,
            total: 0,
        })
            .then((result) => {
                console.log('Created result');
                resolve(result);
            })
            .catch((err:any) => reject(err));
    });
};

export function addAttempt(roomid: string, username: string, serial: number, attempt: number): Promise<ResultModel> {
    console.log('Adding attempt...')
    return new Promise((resolve, reject) => {
        getState(roomid)
            .then((state) => {
                if (state === 'collecting') {
                    return Result.findOne({
                        where: {
                            roomid: roomid,
                            username: username,
                        },
                    });
                }
                else {
                    throw 'Not collecting answers';
                };
            })
            .then((result) => {
                if (result === null) {
                    return createResult(roomid, username);
                }
                else {
                    return result;
                }
            })
            .then((result) => {
                return Promise.all([result, checkAnswer(roomid, serial, attempt)]);
            })
            .then(([result, correct]) => {
                let { total } = result.get();
                if (correct) total++;
                const { attempts } = result.get();
                console.log('Updating result...');
                if (attempts === null || attempts === undefined) {
                    return result.update({
                        attempts: {
                            "1": attempt,
                        },
                        total: total,
                    });
                } else {
                    const sserial: string = serial.toString();
                    attempts[sserial] = attempt;
                    return result.update({
                        attempts: attempts,
                        total: total,
                    });
                };
            })
            .then((result) => {
                console.log('Added attempt');
                resolve(result);
            })
            .catch((err:any) => {
                reject(err)
            });
    });
};

export function getByRoom(roomid: string): Promise<ResultModel[]> {
    console.log('Getting results for room', roomid);
    return new Promise((resolve, reject) => {
        Result.findAll({
            where: {
                roomid: roomid,
            },
        })
            .then((results) => {
                console.log('Done.');
                resolve(results);
            })
            .catch((err:any) => {
                reject(err);
            });
    });
}

export function getLeaderboard(roomid: string): Promise<Leaderboard> {
    console.log('Generating leaderboard');
    return getByRoom(roomid)
        .then((results) => results.map((result) => {
            const { username, total } = result.get();
            return {
                username,
                total,
            };
        }).sort((a, b) => {
            if (a.total > b.total) {
                return -1;
            }
            else if (a.total < b.total) {
                return 1;
            }
            else {
                return 0;
            }
        }) as Leaderboard);
}
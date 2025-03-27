import db = require('./config/db');
import * as qmController from './controllers/qm.controller';
import * as userController from './controllers/user.controller';
import * as roomController from './controllers/room.controller';
import * as quesController from './controllers/ques.controller';
import * as resultController from './controllers/result.controller';
import { Socket } from 'socket.io';
import { UserModel } from './types/user';

const TIMER: number = 30;

function sleeper(ms: number) {
    return function (x: any) {
        return new Promise<any>(resolve => setTimeout(() => resolve(x), ms));
    };
}

function formatError(err: Error & { errors?: { message: string }[] }) {
    if (err.errors) {
        return { message: err.errors[0].message };
    }
    return { message: err };
};

export const configureSocket = (socket: Socket) => {
    console.log('db.initdb()');
    db.initdb();

    socket.on('login', (payload) => {
        console.log('Login request...');
        console.log(payload);
        if (payload.isQM) {
            qmController.loginQM(payload.username, payload.email, payload.phone, payload.password, socket.id)
                .then((qm) => roomController.getRooms(qm.username))
                .then((rooms) => {
                    console.log('Sending rooms list.');
                    socket.emit('login', {
                        message: 'Success',
                        rooms: rooms,
                    });
                })
                .catch((err: Error) => {
                    console.log(err);
                    socket.emit('login', {
                        message: err
                    });
                });
        } else {
            userController.createUser(payload.username, payload.email, payload.phone, socket.id)
                .then(() => socket.emit('login', { message: 'Success' }))
                .catch((err: Error) => socket.emit('login', formatError(err)));
        };
    });

    socket.on('createroom', (payload) => {
        console.log('Create room request...')
        console.log(payload);
        qmController.QM.findAndCountAll({
            where: {
                socket: socket.id,
            },
        }).then((qms) => {
            if (qms.count === 1) {
                return qms.rows[0];
            } else {
                throw 'Not authorised.';
            };
        }).then((qm) => {
            const { username } = qm.get();
            const roomid = payload.name;
            return roomController.createRoom(roomid, username)
                .then(() => roomController.getRooms(username))
                .then((rooms) => {
                    console.log('Sending list of rooms...');
                    socket.emit('createroom', {
                        message: 'Success',
                        rooms: rooms,
                    });
                    console.log('Sent.')
                });
        }).catch((err: Error) => { socket.emit('createroom', formatError(err)) });
    });

    socket.on('createquestion', (payload) => {
        console.log('Create question request...');
        console.log(payload);
        qmController.authenticate(socket.id, payload.roomid)
            .then(() => {
                return quesController.createQuestion(payload.question, payload.options, payload.roomid, payload.answer);
            })
            .then((ques) => {
                return quesController.getByRoom(payload.roomid);
            })
            .then((questions) => {
                console.log('Sending list of questions...')
                socket.emit('createquestion', {
                    message: 'Success',
                    questions: questions,
                });
                console.log('Sent.');
            })
            .catch((err: Error) => socket.emit('createquestion', { message: err }));
    });

    socket.on('deletequestion', (payload) => {
        console.log('Delete question request.');
        console.log(payload);
        qmController.authenticate(socket.id, payload.roomid)
            .then(() => {
                return quesController.deleteQuestion(payload.roomid, payload.id);
            })
            .then((questions) => {
                console.log('Sending list of questions...');
                socket.emit('deletequestion', {
                    questions: questions,
                    message: 'Success',
                });
                console.log('Sent.');
            })
            .catch((err: Error) => {
                console.log(err);
                socket.emit('deletequestion', {
                    message: 'Failed',
                });
            });
    })

    socket.on('fetchroom', (payload) => {
        console.log('Fetching room for qm');
        console.log(payload);
        qmController.authenticate(socket.id, payload.roomid)
            .then(() => {
                return quesController.getByRoom(payload.roomid);
            })
            .then((questions) => {
                console.log('Sending list of questions...');
                socket.emit('fetchroom', {
                    message: 'Success',
                    questions: questions,
                });
                console.log('Done.');
            })
            .catch((err: Error) => {
                socket.emit('fetchroom', {
                    message: err,
                });
            });
    });

    socket.on('joinroom', (payload) => {
        console.log('Room joining request...');
        console.log(payload);
        roomController.getState(payload.roomid)
            .then((state) => {
                if (state === 'finish') {
                    resultController.getLeaderboard(payload.roomid)
                        .then((leaderboard) => {
                            console.log('Sending leaderboard...');
                            socket.emit('joinroom', {
                                message: 'Success',
                                state: state,
                                leaderboard: leaderboard,
                            });
                            console.log('Sent.');
                        })
                        .catch((err: Error) => {
                            console.log(err);
                            socket.emit('joinroom', {
                                message: 'Failed',
                                err: err,
                            });
                        });
                }
                else {
                    userController.addToRoom(payload.username, payload.roomid)
                        .then((users) => {
                            socket.emit('joinroom', {
                                message: 'Success',
                                state: state,
                                users: users,
                            });
                            return Promise.all([users, userController.findByRoom(payload.roomid)]);
                        })
                        .then(([users, usersinst]) => {
                            console.log('Sending user list to all users...');
                            for (const x of usersinst) {
                                socket.broadcast.to(x.get().socket).emit('update', {
                                    users: users,
                                });
                            };
                            console.log('Sent.');
                            return Promise.all([users, roomController.getQm(payload.roomid)]);
                        })
                        .then(([users, qm]) => {
                            console.log('Sending user list to qm...');
                            socket.broadcast.to(qm.socket).emit('update', {
                                users: users,
                            });
                            console.log('Sent');
                        })
                        .catch((err: Error) => {
                            console.log(err);
                            socket.emit('joinroom', {
                                message: 'Failed',
                                err: err,
                            });
                        });
                };
            })
            .catch((err: Error) => {
                console.log(err);
                socket.emit('joinroom', {
                    message: 'Failed',
                    err: err,
                });
            });
    });

    socket.on('start', (payload) => {
        console.log('Start quiz request...');
        console.log(payload);
        qmController.authenticate(socket.id, payload.roomid)
            .then(() => {
                return userController.findByRoom(payload.roomid);
            })
            .then((users) => {
                const startTime: number = new Date().setTime(Date.now() + 10000);
                console.log('Sending start time to all users and qm...');
                socket.emit('start', { time: startTime });
                for (const x of users) {
                    socket.broadcast.to(x.get().socket).emit('start', { time: startTime });
                };
                console.log('Sent.');
                return Promise.all([users, roomController.changeState(payload.roomid, 'countdown')]);
            })
            .then(([users]) => {
                return Promise.all([users, quesController.findNext(payload.roomid, 0)]);
            })
            .then(sleeper(10000))

            .then(([users, question]) => {
                if (question !== null) {
                    const endTime: number = new Date().setTime(Date.now() + TIMER * 1000);
                    console.log('Sending question to all users and qm...');
                    socket.emit('question', {
                        question: question[0].question,
                        options: question[0].options,
                        endtime: endTime,
                        totaltime: TIMER,
                        islast: question[1],
                    });
                    for (const x of users) {
                        socket.broadcast.to(x.socket).emit('question', {
                            question: question[0].question,
                            options: question[0].options,
                            endtime: endTime,
                            totaltime: TIMER,
                            islast: question[1],
                        });
                    };
                    console.log('Done.');
                    return (roomController.changeState(payload.roomid, 'collecting'));
                } else {
                    throw ('Question ID NULL! No questions in the room!');
                }
            }
            )
            .then(sleeper(TIMER * 1000))
            .then(() => {
                console.log("inside timeout, setting state to waiting, room id: ", payload.roomid);
                return roomController.changeState(payload.roomid, 'waiting').catch((err: Error) => {
                    console.log("Error: ", err);
                });
            })
            .then(() => {
                return resultController.getLeaderboard(payload.roomid);
            })
            .then((leaderboard) => {
                socket.emit('leaderboard', {
                    leaderboard: leaderboard,
                });
            })
            .catch((err: Error) => {
                console.log(err);
            });
    });

    socket.on('next', (payload) => {
        console.log('Next question request...');
        console.log(payload);
        qmController.authenticate(socket.id, payload.roomid)
            .then(() => {
                return userController.findByRoom(payload.roomid);
            })
            .then((users) => {
                return Promise.all([users, quesController.findNext(payload.roomid, payload.serial)]);
            })
            .then(([users, question]) => {
                if ((question === null) || question[0] === undefined) {
                    console.log('No next question.');
                    resultController.getLeaderboard(payload.roomid)
                        .then((leaderboard) => {
                            console.log('Sending leaderboard to all users and qm...');
                            socket.emit('leaderboard', {
                                message: 'Success',
                                isnotlive: true,
                                leaderboard: leaderboard
                            });
                            users.forEach((user) => {
                                socket.broadcast.to(user.get().socket).emit('leaderboard', {
                                    message: 'Success',
                                    isnotlive: true,
                                    leaderboard: leaderboard,
                                });
                            });
                            console.log('Done.');
                        })
                        .catch((err: Error) => console.log(err));
                    return Promise.all([users, roomController.changeState(payload.roomid, 'finish')]);
                }
                else {
                    const endTime: number = new Date().setTime(Date.now() + TIMER * 1000);
                    console.log('Sending next question to all users and qm...');
                    socket.emit('question', {
                        question: question[0].question,
                        options: question[0].options,
                        endtime: endTime,
                        totaltime: TIMER,
                        islast: question[1],
                    });
                    for (const u of users) {
                        const x = u.get();
                        console.log(x.socket, question[0].question, question[0].options);
                        socket.broadcast.to(x.socket).emit('question', {
                            question: question[0].question,
                            options: question[0].options,
                            endtime: endTime,
                            totaltime: TIMER,
                            islast: question[1],
                        });
                    };
                    console.log('Done.');
                    return Promise.all([users, roomController.changeState(payload.roomid, 'collecting')]);
                };
            })
            .then(([users, x]) => {
                return Promise.all([users, roomController.getState(payload.roomid)]);
            })
            .then(sleeper(TIMER * 1000))
            .then(([users, state]: [UserModel[], string]) => {
                if (state === 'collecting') {
                    roomController.changeState(payload.roomid, 'waiting')
                        .then(() => {
                            return resultController.getLeaderboard(payload.roomid);
                        })
                        .then((leaderboard) => {
                            console.log('Sending leaderboard to all users and qm...');
                            socket.emit('leaderboard', {
                                leaderboard: leaderboard,
                            });
                            users.forEach((user) => {
                                socket.broadcast.to(user.get().socket).emit('leaderboard', {
                                    leaderboard: leaderboard,
                                });
                            });
                            console.log('Done.');
                        })
                };
            })
            .catch((err: Error) => {
                console.log(err);
            });
    });

    socket.on('attempt', (payload) => {
        console.log('Attempt request...');
        console.log(payload);
        resultController.addAttempt(payload.roomid, payload.username, payload.serial, payload.attempt)
            .then((result) => { })
            .catch((err: Error) => console.log(err));
    });

    socket.on('leaderboard', (payload) => {
        console.log('Leaderboard request...');
        resultController.getLeaderboard(payload.roomid)
            .then((leaderboard) => {
                console.log('Sending leaderboard...');
                socket.emit('leaderboard', {
                    message: 'Success',
                    leaderboard: leaderboard,
                });
                console.log('Done.');
            })
            .catch((err: Error) => console.log(err));
    });

    socket.on('activate', (payload) => {
        console.log('Activate room request...');
        console.log(payload);
        qmController.authenticate(socket.id, payload.roomid)
            .then(() => {
                return roomController.getState(payload.roomid);
            })
            .then((state): (Promise<{} | undefined | void> | undefined) => {
                if (state === 'finish') {
                    return roomController.changeState(payload.roomid, 'inactive');
                }
                return;
            })
            .then(() => {
                return roomController.purge(payload.roomid);
            })
            .then(() => {
                return userController.findByRoom(payload.roomid);
            })
            .then((users) => {
                return users.map((user) => user.get().username);
            })
            .then((users) => {
                console.log('Sending list of users.')
                socket.emit('activate', {
                    message: 'Success',
                    users: users,
                });
            })
            .catch((err: Error) => {
                socket.emit('activate', {
                    message: err,
                });
            });
    });
};


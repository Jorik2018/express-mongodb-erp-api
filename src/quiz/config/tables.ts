const { QM_USER, QM_EMAIL, QM_PHONE, QM_PASSWORD } = require('../../config').default;

/* pg 
const initQueries: string[] = [
    'CREATE TABLE IF NOT EXISTS qms(username VARCHAR PRIMARY KEY, email VARCHAR, phone VARCHAR, password VARCHAR, socket VARCHAR);',
    'CREATE TABLE IF NOT EXISTS rooms(roomid VARCHAR PRIMARY KEY, qm VARCHAR, state VARCHAR, FOREIGN KEY(qm) REFERENCES qms(username));',
    'CREATE TABLE IF NOT EXISTS users(username VARCHAR PRIMARY KEY, email VARCHAR, phone VARCHAR, roomid VARCHAR, socket VARCHAR, FOREIGN KEY(roomid) REFERENCES rooms(roomid));',
    'CREATE TABLE IF NOT EXISTS questions(id SERIAL PRIMARY KEY, roomid VARCHAR, question TEXT, options JSON, answer INTEGER, FOREIGN KEY(roomid) REFERENCES rooms(roomid));',
    'CREATE TABLE IF NOT EXISTS results(id SERIAL PRIMARY KEY, username VARCHAR, roomid VARCHAR, attempts JSON, total INTEGER, FOREIGN KEY(username) REFERENCES users(username), FOREIGN KEY(roomid) REFERENCES rooms(roomid));',
    'INSERT INTO QMS(username, email, phone, password) values(\'' + QM_USER + '\',\'' + QM_EMAIL + '\',\'' + QM_PHONE + '\',\'' + QM_PASSWORD + '\') ON CONFLICT DO NOTHING;',
]
*/

const initQueries: string[] = [
    // 'CREATE TABLE IF NOT EXISTS qms (username VARCHAR(255) PRIMARY KEY, email VARCHAR(255), phone VARCHAR(255), password VARCHAR(255), socket VARCHAR(255));',
    // 'CREATE TABLE IF NOT EXISTS rooms (roomid VARCHAR(255) PRIMARY KEY, qm VARCHAR(255), state VARCHAR(255), CONSTRAINT fk_qm FOREIGN KEY (qm) REFERENCES qms(username));',
    // 'CREATE TABLE IF NOT EXISTS users (username VARCHAR(255) PRIMARY KEY, email VARCHAR(255), phone VARCHAR(255), roomid VARCHAR(255), socket VARCHAR(255), CONSTRAINT fk_users_roomid FOREIGN KEY (roomid) REFERENCES rooms(roomid));',
    // 'CREATE TABLE IF NOT EXISTS questions (id INT AUTO_INCREMENT PRIMARY KEY, roomid VARCHAR(255), question TEXT, options JSON, answer INT, CONSTRAINT fk_questions_roomid FOREIGN KEY (roomid) REFERENCES rooms(roomid));',
    // 'CREATE TABLE IF NOT EXISTS results (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), roomid VARCHAR(255), attempts JSON, total INT, CONSTRAINT fk_username FOREIGN KEY (username) REFERENCES users(username), CONSTRAINT fk_results_roomid FOREIGN KEY (roomid) REFERENCES rooms(roomid));',
    'INSERT INTO qms (username, email, phone, password) VALUES (\'' + QM_USER + '\',\'' + QM_EMAIL + '\',\'' + QM_PHONE + '\',\'' + QM_PASSWORD + '\') ON DUPLICATE KEY UPDATE username=username;',
];
export = initQueries;
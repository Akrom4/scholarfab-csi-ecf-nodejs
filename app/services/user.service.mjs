import { hash } from 'bcrypt'

export function fetchUserByEmail(db, email) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('SELECT * FROM users WHERE email=?')
        stmt.get([ email ], (err, data) => {
            const p = err ? err : data;
            (err ? reject : resolve)(p)
        })
    })
}

export function createUser(db, { email, firstname, lastname, password }) {
    return new Promise(async (resolve, reject) => {
        const pass = await hash(password, 10)
        const stmt = db.prepare('INSERT INTO users(email, firstname, lastname, password) VALUES (?,?,?,?)')
        stmt.run([ email, firstname, lastname, pass ], (err, data) => {
            const p = err ? err : data;
            (err ? reject : resolve)(p)
        })
    })
}

export function fetchAllUsers(db) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('SELECT id, firstname, lastname FROM users');
        stmt.all((err, data) => {
            if (err) {
                console.error('Error fetching users:', err);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}


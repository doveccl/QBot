import db from 'sqlite'

const sql_table = "gid INTEGER, key TEXT, value TEXT"
const sql_creat = `CREATE TABLE IF NOT EXISTS rule(${sql_table});`
const sql_has = "SELECT COUNT(*) FROM rule WHERE gid = ? AND key = ? AND value = ?"
const sql_add = "INSERT INTO rule (gid, key, value) VALUES (?, ?, ?)"
const sql_del = "DELETE FROM rule WHERE gid = ? AND key = ? AND value = ?"
const sql_all = "SELECT value FROM rule WHERE gid = ? AND ? LIKE '%'||key||'%'"
const sql_list = "SELECT value FROM rule WHERE gid = ? AND key = ?"
const sql_rand = `${sql_all} ORDER BY RANDOM() LIMIT 1`
const sql_get = `${sql_list} LIMIT 1 OFFSET ?`

export class DB {
    constructor(file) {
        Promise.resolve()
            .then(() => db.open('file', { Promise }))
            .then(() => db.run(sql_creat))
            .catch(err => console.error(err.stack))
            .finally(() => console.log('DB: OK'));
    }

    async has(gid, key, value) {
        let r = await db.get(sql_has, [gid, key, value])
        return r['COUNT(*)'] > 0
    }

    async add(gid, key, value) {
        let r = await db.run(sql_add, [gid, key, value])
        return r.changes > 0
    }

    async del(gid, key, value) {
        let r = await db.run(sql_del, [gid, key, value])
        return r.changes > 0
    }

    async list(gid, key) {
        return await db.all(sql_list, [gid, key])
    }

    async get(gid, key, ith) {
        let r = await db.get(sql_get, [gid, key, ith])
        if (r !== undefined) {
            return r.value
        }
        return undefined
    }

    async rand(gid, msg) {
        let r = await db.get(sql_rand, [gid, msg])
        if (r !== undefined) {
            return r.value
        }
        return undefined
    }
}

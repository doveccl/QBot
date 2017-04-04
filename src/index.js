import {Api, Client} from 'node-coolq'
import {DB} from './db.js'

let db = new DB(__dirname + '/bot.db')

let app = new Client()
let api = new Api(app)
let code = api.getCode()
let at = q => code.getAt(q)

let server_port = 11235
let local_port = 11666

let CQCode_reg = /\[[^\[]*\]/g
let add_reg = /^\/add ([^=]+)=([\S\s]+)$/
let del_reg = /^\/del ([^=]+)=([\S\s]+)$/
let get_reg = /^\/get#(\d+) ([^=]+)$/
let list_reg = /^\/list ([\S\s]+)$/

let encrypt = str =>
    str.replace(CQCode_reg, str =>
        str.replace('=', '~')
    )
let decrypt = str =>
    str.replace(CQCode_reg, str =>
        str.replace('~', '=')
    )

const SHOW_MAX_RULES = 10
const MSG_HELP = `QBot 使用帮助：
/add key=value，为关键词 key 添加一条自动回复规则 value
/del key=value，为关键词 key 闪出一条自动回复规则 value
/list key，列出关键词 key 对应的规则（至多列出 ${SHOW_MAX_RULES} 条）
/get#i key，列出关键词 key 对应的第 i 条规则（i 是从 0 开始的数字）
/help 获取使用帮助`

let add_s = (q, k, v) =>
    `${at(q)} 添加成功，你说“${k}”，我说“${v}”`
let add_w = (q, k, v) =>
    `${at(q)} 规则 “${k}” => “${v}” 已经存在`
let add_e = (q, k, v) =>
    `${at(q)} 规则 “${k}” => “${v}” 添加失败，请重试`

let del_s = (q, k, v) =>
    `${at(q)} 规则 “${k}” => “${v}” 删除成功`
let del_w = (q, k, v) =>
    `${at(q)} 规则 “${k}” => “${v}” 并不存在`
let del_e = (q, k, v) =>
    `${at(q)} 规则 “${k}” => “${v}” 删除失败，请重试`

let get_s = (q, k, i, v) =>
    `${at(q)} 关键词 “${k}” 的第 ${i} 条规则是 “${v}”`
let get_e = (q, k, i) =>
    `${at(q)} 关键词 “${k}” 可能并不存在第 ${i} 条规则`

let list_e = (q, k) =>
    `${at(q)} 关键词 “${k}” 可能没有绑定任何规则`
let list_s = (q, k, r) => {
    let s = `${at(q)} 关键词 “${k}” 共有 ${r.length} 条规则：`
    let len = Math.min(SHOW_MAX_RULES, r.length)
    if (len !== r.length) {
        s = `${s}\n（只显示前 ${len} 条规则）`
    }
    for (let i = 0; i < len; i++) {
        s = `${s}\n#${i} ${r[i].value}`
    }
    return s
}

app.on('GroupMessage', async data => {
    let gid = data.group
    let qq = data.fromQQ
    let msg = encrypt(data.content)

    if (qq == 1000000) {
        return null //system message
    }

    if (data.content === '/help') {
        await api.GroupMessage(gid, MSG_HELP)
    } else if (add_reg.test(msg)) {
        let $ = msg.match(add_reg)
        let $1 = decrypt($[1])
        let $2 = decrypt($[2])

        if (await db.has(gid, $1, $2)) {
            await api.GroupMessage(gid, add_w(qq, $1, $2))
        } else if (await db.add(gid, $1, $2)) {
            await api.GroupMessage(gid, add_s(qq, $1, $2))
        } else {
            await api.GroupMessage(gid, add_e(qq, $1, $2))
        }
    } else if (del_reg.test(msg)) {
        let $ = msg.match(del_reg)
        let $1 = decrypt($[1])
        let $2 = decrypt($[2])

        if (! await db.has(gid, $1, $2)) {
            await api.GroupMessage(gid, del_w(qq, $1, $2))
        } else if (await db.del(gid, $1, $2)) {
            await api.GroupMessage(gid, del_s(qq, $1, $2))
        } else {
            await api.GroupMessage(gid, del_e(qq, $1, $2))
        }
    } else if (get_reg.test(msg)) {
        let $ = msg.match(get_reg)
        let $2 = decrypt($[1])
        let $1 = decrypt($[2])
        let r = await db.get(gid, $1, $2)

        if (r === undefined) {
            await api.GroupMessage(gid, get_e(qq, $1, $2))
        } else {
            await api.GroupMessage(gid, get_s(qq, $1, $2, r))
        }
    } else if (list_reg.test(msg)) {
        let $ = msg.match(list_reg)
        let $1 = decrypt($[1])
        let r = await db.list(gid, $1)

        if (r.length == 0) {
            await api.GroupMessage(gid, list_e(qq, $1))
        } else {
            await api.GroupMessage(gid, list_s(qq, $1, r))
        }
    } else {
        let r = await db.rand(gid, data.content)
        if (r !== undefined) {
            await api.GroupMessage(gid, r)
        }
    }
})

app.listen(server_port, local_port)
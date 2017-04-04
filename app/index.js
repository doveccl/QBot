'use strict';

var _fs = require('fs');

var _nodeCoolq = require('node-coolq');

var _db = require('./db.js');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var db = new _db.DB('bot.db');

var app = new _nodeCoolq.Client();
var api = new _nodeCoolq.Api(app);
var code = api.getCode();
var at = function at(q) {
    return code.getAt(q);
};

var CQCode_reg = /\[[^\[]*\]/g;
var add_reg = /^[/!]add ([^=]+)=([\S\s]+)$/;
var del_reg = /^[/!]del ([^=]+)=([\S\s]+)$/;
var get_reg = /^[/!]get#(\d+) ([^=]+)$/;
var list_reg = /^[/!]list ([\S\s]+)$/;

var encrypt = function encrypt(str) {
    return str.replace(CQCode_reg, function (str) {
        return str.replace('=', '~');
    });
};
var decrypt = function decrypt(str) {
    return str.replace(CQCode_reg, function (str) {
        return str.replace('~', '=');
    });
};

var SHOW_MAX_RULES = 20;
var MSG_HELP = 'QBot \u4F7F\u7528\u5E2E\u52A9\uFF1A\n/add key=value\uFF0C\u4E3A\u5173\u952E\u8BCD key \u6DFB\u52A0\u4E00\u6761\u81EA\u52A8\u56DE\u590D\u89C4\u5219 value\n/del key=value\uFF0C\u4E3A\u5173\u952E\u8BCD key \u95EA\u51FA\u4E00\u6761\u81EA\u52A8\u56DE\u590D\u89C4\u5219 value\n/list key\uFF0C\u5217\u51FA\u5173\u952E\u8BCD key \u5BF9\u5E94\u7684\u89C4\u5219\uFF08\u81F3\u591A\u5217\u51FA ' + SHOW_MAX_RULES + ' \u6761\uFF09\n/get#i key\uFF0C\u5217\u51FA\u5173\u952E\u8BCD key \u5BF9\u5E94\u7684\u7B2C i \u6761\u89C4\u5219\uFF08i \u662F\u4ECE 0 \u5F00\u59CB\u7684\u6570\u5B57\uFF09\n/help \u83B7\u53D6\u4F7F\u7528\u5E2E\u52A9';

var add_s = function add_s(q, k, v) {
    return at(q) + ' \u6DFB\u52A0\u6210\u529F\uFF0C\u4F60\u8BF4\u201C' + k + '\u201D\uFF0C\u6211\u8BF4\u201C' + v + '\u201D';
};
var add_w = function add_w(q, k, v) {
    return at(q) + ' \u89C4\u5219 \u201C' + k + '\u201D => \u201C' + v + '\u201D \u5DF2\u7ECF\u5B58\u5728';
};
var add_e = function add_e(q, k, v) {
    return at(q) + ' \u89C4\u5219 \u201C' + k + '\u201D => \u201C' + v + '\u201D \u6DFB\u52A0\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5';
};
var add_b = function add_b(q, k) {
    return at(q) + ' \u5173\u952E\u8BCD \u201C' + k + '\u201D \u5728\u9ED1\u540D\u5355\u4E2D\uFF0C\u4E0D\u53EF\u6DFB\u52A0';
};

var del_s = function del_s(q, k, v) {
    return at(q) + ' \u89C4\u5219 \u201C' + k + '\u201D => \u201C' + v + '\u201D \u5220\u9664\u6210\u529F';
};
var del_w = function del_w(q, k, v) {
    return at(q) + ' \u89C4\u5219 \u201C' + k + '\u201D => \u201C' + v + '\u201D \u5E76\u4E0D\u5B58\u5728';
};
var del_e = function del_e(q, k, v) {
    return at(q) + ' \u89C4\u5219 \u201C' + k + '\u201D => \u201C' + v + '\u201D \u5220\u9664\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5';
};

var get_s = function get_s(q, k, i, v) {
    return at(q) + ' \u5173\u952E\u8BCD \u201C' + k + '\u201D \u7684\u7B2C ' + i + ' \u6761\u89C4\u5219\u662F \u201C' + v + '\u201D';
};
var get_e = function get_e(q, k, i) {
    return at(q) + ' \u5173\u952E\u8BCD \u201C' + k + '\u201D \u53EF\u80FD\u5E76\u4E0D\u5B58\u5728\u7B2C ' + i + ' \u6761\u89C4\u5219';
};

var list_e = function list_e(q, k) {
    return at(q) + ' \u5173\u952E\u8BCD \u201C' + k + '\u201D \u53EF\u80FD\u6CA1\u6709\u7ED1\u5B9A\u4EFB\u4F55\u89C4\u5219';
};
var list_s = function list_s(q, k, r) {
    var s = at(q) + ' \u5173\u952E\u8BCD \u201C' + k + '\u201D \u5171\u6709 ' + r.length + ' \u6761\u89C4\u5219\uFF1A';
    var len = Math.min(SHOW_MAX_RULES, r.length);
    if (len !== r.length) {
        s = s + '\n\uFF08\u53EA\u663E\u793A\u524D ' + len + ' \u6761\u89C4\u5219\uFF09';
    }
    for (var i = 0; i < len; i++) {
        s = s + '\n#' + i + ' ' + r[i].value;
    }
    return s;
};

var config = void 0;
try {
    config = require('config.json');
} catch (err) {
    config = {
        server_port: 11235,
        local_port: 11666,
        black_list: []
    };
    var conf_str = JSON.stringify(config);
    (0, _fs.writeFileSync)('config.json', conf_str);
}

app.on('GroupMessage', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(data) {
        var gid, qq, msg, $, $1, $2, _$, _$2, _$3, _$4, _$5, _$6, r, _$7, _$8, _r, _r2;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        gid = data.group;
                        qq = data.fromQQ;
                        msg = encrypt(data.content);

                        if (!(qq == 1000000)) {
                            _context.next = 5;
                            break;
                        }

                        return _context.abrupt('return', null);

                    case 5:
                        if (!(data.content === '/help')) {
                            _context.next = 10;
                            break;
                        }

                        _context.next = 8;
                        return api.GroupMessage(gid, MSG_HELP);

                    case 8:
                        _context.next = 96;
                        break;

                    case 10:
                        if (!add_reg.test(msg)) {
                            _context.next = 37;
                            break;
                        }

                        $ = msg.match(add_reg);
                        $1 = decrypt($[1]);
                        $2 = decrypt($[2]);

                        if (!(config.black_list.indexOf($1) != -1)) {
                            _context.next = 19;
                            break;
                        }

                        _context.next = 17;
                        return api.GroupMessage(gid, add_b(qq, $1));

                    case 17:
                        _context.next = 35;
                        break;

                    case 19:
                        _context.next = 21;
                        return db.has(gid, $1, $2);

                    case 21:
                        if (!_context.sent) {
                            _context.next = 26;
                            break;
                        }

                        _context.next = 24;
                        return api.GroupMessage(gid, add_w(qq, $1, $2));

                    case 24:
                        _context.next = 35;
                        break;

                    case 26:
                        _context.next = 28;
                        return db.add(gid, $1, $2);

                    case 28:
                        if (!_context.sent) {
                            _context.next = 33;
                            break;
                        }

                        _context.next = 31;
                        return api.GroupMessage(gid, add_s(qq, $1, $2));

                    case 31:
                        _context.next = 35;
                        break;

                    case 33:
                        _context.next = 35;
                        return api.GroupMessage(gid, add_e(qq, $1, $2));

                    case 35:
                        _context.next = 96;
                        break;

                    case 37:
                        if (!del_reg.test(msg)) {
                            _context.next = 59;
                            break;
                        }

                        _$ = msg.match(del_reg);
                        _$2 = decrypt(_$[1]);
                        _$3 = decrypt(_$[2]);
                        _context.next = 43;
                        return db.has(gid, _$2, _$3);

                    case 43:
                        if (_context.sent) {
                            _context.next = 48;
                            break;
                        }

                        _context.next = 46;
                        return api.GroupMessage(gid, del_w(qq, _$2, _$3));

                    case 46:
                        _context.next = 57;
                        break;

                    case 48:
                        _context.next = 50;
                        return db.del(gid, _$2, _$3);

                    case 50:
                        if (!_context.sent) {
                            _context.next = 55;
                            break;
                        }

                        _context.next = 53;
                        return api.GroupMessage(gid, del_s(qq, _$2, _$3));

                    case 53:
                        _context.next = 57;
                        break;

                    case 55:
                        _context.next = 57;
                        return api.GroupMessage(gid, del_e(qq, _$2, _$3));

                    case 57:
                        _context.next = 96;
                        break;

                    case 59:
                        if (!get_reg.test(msg)) {
                            _context.next = 75;
                            break;
                        }

                        _$4 = msg.match(get_reg);
                        _$5 = decrypt(_$4[1]);
                        _$6 = decrypt(_$4[2]);
                        _context.next = 65;
                        return db.get(gid, _$6, _$5);

                    case 65:
                        r = _context.sent;

                        if (!(r === undefined)) {
                            _context.next = 71;
                            break;
                        }

                        _context.next = 69;
                        return api.GroupMessage(gid, get_e(qq, _$6, _$5));

                    case 69:
                        _context.next = 73;
                        break;

                    case 71:
                        _context.next = 73;
                        return api.GroupMessage(gid, get_s(qq, _$6, _$5, r));

                    case 73:
                        _context.next = 96;
                        break;

                    case 75:
                        if (!list_reg.test(msg)) {
                            _context.next = 90;
                            break;
                        }

                        _$7 = msg.match(list_reg);
                        _$8 = decrypt(_$7[1]);
                        _context.next = 80;
                        return db.list(gid, _$8);

                    case 80:
                        _r = _context.sent;

                        if (!(_r.length == 0)) {
                            _context.next = 86;
                            break;
                        }

                        _context.next = 84;
                        return api.GroupMessage(gid, list_e(qq, _$8));

                    case 84:
                        _context.next = 88;
                        break;

                    case 86:
                        _context.next = 88;
                        return api.GroupMessage(gid, list_s(qq, _$8, _r));

                    case 88:
                        _context.next = 96;
                        break;

                    case 90:
                        _context.next = 92;
                        return db.rand(gid, data.content);

                    case 92:
                        _r2 = _context.sent;

                        if (!(_r2 !== undefined)) {
                            _context.next = 96;
                            break;
                        }

                        _context.next = 96;
                        return api.GroupMessage(gid, _r2);

                    case 96:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x) {
        return _ref.apply(this, arguments);
    };
}());

app.listen(config.server_port, config.local_port);
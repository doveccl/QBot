"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DB = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sqlite = require("sqlite");

var _sqlite2 = _interopRequireDefault(_sqlite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sql_table = "gid INTEGER, key TEXT, value TEXT";
var sql_creat = "CREATE TABLE IF NOT EXISTS rule(" + sql_table + ");";
var sql_has = "SELECT COUNT(*) FROM rule WHERE gid = ? AND key = ? AND value = ?";
var sql_add = "INSERT INTO rule (gid, key, value) VALUES (?, ?, ?)";
var sql_del = "DELETE FROM rule WHERE gid = ? AND key = ? AND value = ?";
var sql_all = "SELECT value FROM rule WHERE gid = ? AND ? LIKE '%'||key||'%'";
var sql_list = "SELECT value FROM rule WHERE gid = ? AND key = ?";
var sql_rand = sql_all + " ORDER BY RANDOM() LIMIT 1";
var sql_get = sql_list + " LIMIT 1 OFFSET ?";

var DB = exports.DB = function () {
    function DB(file) {
        _classCallCheck(this, DB);

        Promise.resolve().then(function () {
            return _sqlite2.default.open(file, { Promise: Promise });
        }).then(function () {
            return _sqlite2.default.run(sql_creat);
        });
    }

    _createClass(DB, [{
        key: "has",
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(gid, key, value) {
                var r;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return _sqlite2.default.get(sql_has, [gid, key, value]);

                            case 2:
                                r = _context.sent;
                                return _context.abrupt("return", r['COUNT(*)'] > 0);

                            case 4:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function has(_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return has;
        }()
    }, {
        key: "add",
        value: function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(gid, key, value) {
                var r;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return _sqlite2.default.run(sql_add, [gid, key, value]);

                            case 2:
                                r = _context2.sent;
                                return _context2.abrupt("return", r.changes > 0);

                            case 4:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function add(_x4, _x5, _x6) {
                return _ref2.apply(this, arguments);
            }

            return add;
        }()
    }, {
        key: "del",
        value: function () {
            var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(gid, key, value) {
                var r;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return _sqlite2.default.run(sql_del, [gid, key, value]);

                            case 2:
                                r = _context3.sent;
                                return _context3.abrupt("return", r.changes > 0);

                            case 4:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function del(_x7, _x8, _x9) {
                return _ref3.apply(this, arguments);
            }

            return del;
        }()
    }, {
        key: "list",
        value: function () {
            var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(gid, key) {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return _sqlite2.default.all(sql_list, [gid, key]);

                            case 2:
                                return _context4.abrupt("return", _context4.sent);

                            case 3:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function list(_x10, _x11) {
                return _ref4.apply(this, arguments);
            }

            return list;
        }()
    }, {
        key: "get",
        value: function () {
            var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(gid, key, ith) {
                var r;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return _sqlite2.default.get(sql_get, [gid, key, ith]);

                            case 2:
                                r = _context5.sent;

                                if (!(r !== undefined)) {
                                    _context5.next = 5;
                                    break;
                                }

                                return _context5.abrupt("return", r.value);

                            case 5:
                                return _context5.abrupt("return", undefined);

                            case 6:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function get(_x12, _x13, _x14) {
                return _ref5.apply(this, arguments);
            }

            return get;
        }()
    }, {
        key: "rand",
        value: function () {
            var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(gid, msg) {
                var r;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return _sqlite2.default.get(sql_rand, [gid, msg]);

                            case 2:
                                r = _context6.sent;

                                if (!(r !== undefined)) {
                                    _context6.next = 5;
                                    break;
                                }

                                return _context6.abrupt("return", r.value);

                            case 5:
                                return _context6.abrupt("return", undefined);

                            case 6:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function rand(_x15, _x16) {
                return _ref6.apply(this, arguments);
            }

            return rand;
        }()
    }]);

    return DB;
}();
/*
 * WHResBot Database Wrapper
 * Written by Doveccl
 */

#ifndef _QBOT_
#define _QBOT_

#define CQAPPID "com.doveccl.qbot"
#define CQAPPINFO CQAPIVERTEXT "," CQAPPID

#define APP_NAME "QBot"
#define APP_VER "v1"
#define APP_BY "Doveccl"
#define APP_INFO APP_NAME " " APP_VER " BY " APP_BY

#define MAX_RECORDE 5000
#define MAX_MSG_LEN 4500

#include "sqlite3.h"

namespace BOT {
	#define SQL_ERROR 0
	#define RULE_EXIST -1
	#define RULE_NOT_EXIST -1

	sqlite3 *db;
	sqlite3_stmt *stmt_has, *stmt_get, *stmt_add, *stmt_del;

	char sql_init_table[] = "CREATE TABLE IF NOT EXISTS rule(" \
							"gid INTEGER, key TEXT, value TEXT);";

	char sql_has_rule[] = "SELECT COUNT(*) FROM rule WHERE gid = ? AND key = ? AND value = ?";
	char sql_get_rule[] = "SELECT value FROM rule WHERE gid = ? AND ? LIKE '%'||key||'%'";
	char sql_add_rule[] = "INSERT INTO rule (gid, key, value) VALUES (?, ?, ?)";
	char sql_del_rule[] = "DELETE FROM rule WHERE gid = ? AND key = ? AND value = ?";

	char result[MAX_RECORDE][MAX_MSG_LEN];

	bool init(const char *file) {
		static int ret; ret = 0;
		srand(time((time_t *)'\0'));

		if (sqlite3_open(file, &db) == SQLITE_OK) {
			sqlite3_exec(db, sql_init_table, NULL, NULL, NULL);

			ret += sqlite3_prepare_v2(db, sql_has_rule, -1, &stmt_has, NULL) != SQLITE_OK;
			ret += sqlite3_prepare_v2(db, sql_get_rule, -1, &stmt_get, NULL) != SQLITE_OK;
			ret += sqlite3_prepare_v2(db, sql_add_rule, -1, &stmt_add, NULL) != SQLITE_OK;
			ret += sqlite3_prepare_v2(db, sql_del_rule, -1, &stmt_del, NULL) != SQLITE_OK;

			return ret == 0;
		}

		return false;
	}

	void close() {
		sqlite3_finalize(stmt_has);
		sqlite3_finalize(stmt_add);
		sqlite3_finalize(stmt_del);
		sqlite3_finalize(stmt_get);

		sqlite3_close_v2(db);
	}

	int has(long long group, const char *key, const char *value) {
		sqlite3_reset(stmt_has);

		sqlite3_bind_int64(stmt_has, 1, group);
		sqlite3_bind_text(stmt_has, 2, key, -1, SQLITE_STATIC);
		sqlite3_bind_text(stmt_has, 3, value, -1, SQLITE_STATIC);

		sqlite3_step(stmt_has);

		return sqlite3_column_int(stmt_has, 0);
	}

	int add(long long group, const char *key, const char *value) {
		if (has(group, key, value))
			return RULE_EXIST;
		else
			sqlite3_reset(stmt_add);

		sqlite3_bind_int64(stmt_add, 1, group);
		sqlite3_bind_text(stmt_add, 2, key, -1, SQLITE_STATIC);
		sqlite3_bind_text(stmt_add, 3, value, -1, SQLITE_STATIC);

		sqlite3_step(stmt_add);
		return sqlite3_changes(db);
	}

	int del(long long group, const char *key, const char *value) {
		if (!has(group, key, value))
			return RULE_NOT_EXIST;
		else
			sqlite3_reset(stmt_del);

		sqlite3_bind_int64(stmt_del, 1, group);
		sqlite3_bind_text(stmt_del, 2, key, -1, SQLITE_STATIC);
		sqlite3_bind_text(stmt_del, 3, value, -1, SQLITE_STATIC);

		sqlite3_step(stmt_del);
		return sqlite3_changes(db);
	}

	int get(long long group, const char *msg) {
		static int row_cnt;

		sqlite3_reset(stmt_get);

		sqlite3_bind_int64(stmt_get, 1, group);
		sqlite3_bind_text(stmt_get, 2, msg, -1, SQLITE_STATIC);

		for (row_cnt = 0; sqlite3_step(stmt_get) == SQLITE_ROW; row_cnt++)
			std::strcpy(
				result[row_cnt],
				(const char *)sqlite3_column_text(stmt_get, 0)
			);

		return row_cnt;
	}

	const char *ran(int cnt) {
		return result[rand() % cnt];
	}
}

#endif

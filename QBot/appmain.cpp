
/*
 * WHResBot Main Function
 * Written by Doveccl
 */

#include "stdafx.h"

#include "appmain.h"
#include "cqp.h"

#define REG_ADD "^/add ([^#]+)#(.+)$"
#define REG_DEL "^/del ([^#]+)#(.+)$"
#define REG_GET "^/get ([^#]+)#(.+)$"

using namespace std;

int ac = -1, ret;
bool enabled = false;
char cm1[4500], cm2[4500];
char buf[4500];
string tmp;
cmatch cm;

CQEVENT(const char *, AppInfo, 0)() {
	return CQAPPINFO;
}


/* 
 * 接收应用AuthCode，酷Q读取应用信息后，如果接受该应用，将会调用这个函数并传递AuthCode。
 * 不要在本函数处理其他任何代码，以免发生异常情况。如需执行初始化代码请在Startup事件中执行（Type=1001）。
 */

CQEVENT(int32_t, Initialize, 4)(int32_t AuthCode) {
	ac = AuthCode;
	return 0;
}


/*
 * Type=1001 酷Q启动
 * 无论本应用是否被启用，本函数都会在酷Q启动后执行一次，请在这里执行应用初始化代码。
 *  如非必要，不建议在这里加载窗口。（可以添加菜单，让用户手动打开窗口）
 */

CQEVENT(int32_t, __eventStartup, 0)() {
	sprintf(buf, "%sqbot.db", CQ_getAppDirectory(ac));
	BOT::init(buf);
	return 0;
}


/*
 * Type=1002 酷Q退出
 * 无论本应用是否被启用，本函数都会在酷Q退出前执行一次，请在这里执行插件关闭代码。
 * 本函数调用完毕后，酷Q将很快关闭，请不要再通过线程等方式执行其他代码。
 */

CQEVENT(int32_t, __eventExit, 0)() {
	BOT::close();
	return 0;
}


/*
* Type=1003 应用已被启用
* 当应用被启用后，将收到此事件。
* 如果酷Q载入时应用已被启用，则在_eventStartup(Type=1001,酷Q启动)被调用后，本函数也将被调用一次。
* 如非必要，不建议在这里加载窗口。（可以添加菜单，让用户手动打开窗口）
*/

CQEVENT(int32_t, __eventEnable, 0)() {
	enabled = true;
	return 0;
}


/*
* Type=1004 应用将被停用
* 当应用被停用前，将收到此事件。
* 如果酷Q载入时应用已被停用，则本函数*不会*被调用。
* 无论本应用是否被启用，酷Q关闭前本函数都*不会*被调用。
*/

CQEVENT(int32_t, __eventDisable, 0)() {
	enabled = false;
	return 0;
}


/*
 * Type=21 私聊消息
 * subType 子类型，11/来自好友 1/来自在线状态 2/来自群 3/来自讨论组
 */

CQEVENT(int32_t, __eventPrivateMsg, 24)(int32_t subType, int32_t sendTime, int64_t fromQQ, const char *msg, int32_t font) {
	return EVENT_IGNORE;
}


/*
 * Type=2 群消息
 */

CQEVENT(int32_t, __eventGroupMsg, 36)(int32_t subType, int32_t sendTime, int64_t fromGroup, int64_t fromQQ, const char *fromAnonymous, const char *msg, int32_t font) {
	if (strcmp(msg, "/help") == 0) {
		CQ_sendGroupMsg(ac, fromGroup,
			"How to use QBot:\n\n" \
			"/rand: get a random number\n\n" \
			"/time: get now time\n\n" \
			"/add key#value: add an auto-reply value for key word\n\n" \
			"/del key#value: del an auto-reply value for key word\n\n" \
			"/get key#ith:\n" \
			"    get the No.ith reply value with the key word\n" \
			"    use /get key#all to list all the rules with key word (max 10 rules)\n\n" \
			"/about: get bot infomation"
		);
	} else if (strcmp(msg, "/rand") == 0) {
		sprintf(buf, "%d", rand());
		CQ_sendGroupMsg(ac, fromGroup, buf);
	} else if (strcmp(msg, "/time") == 0) {
		time_t now = time(NULL);
		tm tstruct = *localtime(&now);
		strftime(buf, 20, "%Y-%m-%d %X", &tstruct);
		CQ_sendGroupMsg(ac, fromGroup, buf);
	} else if (strcmp(msg, "/about") == 0) {
		CQ_sendGroupMsg(ac, fromGroup, APP_INFO);
	} else if (regex_match(msg, cm, regex(REG_ADD))) {
		strcpy(cm1, cm.str(1).c_str());
		strcpy(cm2, cm.str(2).c_str());
		ret = BOT::add(fromGroup, cm1, cm2);
		if (ret > 0)
			sprintf(buf, "You say '%s', I say '%s'", cm1, cm2);
		else if (ret == RULE_EXIST)
			sprintf(buf, "The rule is already exist");
		else sprintf(buf, "Error, please try again");
		CQ_sendGroupMsg(ac, fromGroup, buf);
	} else if (regex_match(msg, cm, regex(REG_DEL))) {
		strcpy(cm1, cm.str(1).c_str());
		strcpy(cm2, cm.str(2).c_str());
		ret = BOT::del(fromGroup, cm1, cm2);
		if (ret > 0)
			sprintf(buf, "Deleted the rule '%s' => '%s'", cm1, cm2);
		else if (ret == RULE_NOT_EXIST)
			sprintf(buf, "The rule is not exist");
		else sprintf(buf, "Error, please try again");
		CQ_sendGroupMsg(ac, fromGroup, buf);
	} else if (regex_match(msg, cm, regex(REG_GET))) {
		strcpy(cm1, cm.str(1).c_str());
		strcpy(cm2, cm.str(2).c_str());
		ret = BOT::get(fromGroup, cm1);
		if (strcmp(cm2, "all") == 0) {
			if (ret > 0) {
				if (ret > 10)
					sprintf(buf, "There are %d rules:\n" \
						"(only show the first 10 rules)\n\n", ret);
				else sprintf(buf, "There are %d rules:\n\n", ret);
				for (tmp = buf; ret > 10; )
					ret = 10;
				for (int i = 0; i < ret; i++)
					tmp += BOT::result[i],
					tmp += '\n';
				strcpy(buf, tmp.c_str());
			 } else sprintf(buf, "No rule found");
		} else {
			if (atoi(cm2) >= ret)
				sprintf(buf, "No.%s rule is not exist", cm2);
			else
				sprintf(buf, "%s => %s", cm1, BOT::result[atoi(cm2)]);
		}
		CQ_sendGroupMsg(ac, fromGroup, buf);
	} else {
		ret = BOT::get(fromGroup, msg);
		if (ret > 0)
			CQ_sendGroupMsg(ac, fromGroup, BOT::ran(ret));
	}
	return EVENT_BLOCK;
}


/*
 * Type=4 讨论组消息
 */

CQEVENT(int32_t, __eventDiscussMsg, 32)(int32_t subType, int32_t sendTime, int64_t fromDiscuss, int64_t fromQQ, const char *msg, int32_t font) {
	return EVENT_IGNORE;
}



/*
 * Type=101 群事件-管理员变动
 * subType 子类型，1/被取消管理员 2/被设置管理员
 */

CQEVENT(int32_t, __eventSystem_GroupAdmin, 24)(int32_t subType, int32_t sendTime, int64_t fromGroup, int64_t beingOperateQQ) {
	return EVENT_IGNORE;
}


/*
 * Type=102 群事件-群成员减少
 * subType 子类型，1/群员离开 2/群员被踢 3/自己(即登录号)被踢
 * fromQQ 操作者QQ(仅subType为2、3时存在)
 * beingOperateQQ 被操作QQ
 */

CQEVENT(int32_t, __eventSystem_GroupMemberDecrease, 32)(int32_t subType, int32_t sendTime, int64_t fromGroup, int64_t fromQQ, int64_t beingOperateQQ) {
	sprintf(buf, "Mumber [%lld] left this group", beingOperateQQ);
	CQ_sendGroupMsg(ac, fromGroup, buf);
	return EVENT_BLOCK;
}


/*
 * Type=103 群事件-群成员增加
 * subType 子类型，1/管理员已同意 2/管理员邀请
 * fromQQ 操作者QQ(即管理员QQ)
 * beingOperateQQ 被操作QQ(即加群的QQ)
 */

CQEVENT(int32_t, __eventSystem_GroupMemberIncrease, 32)(int32_t subType, int32_t sendTime, int64_t fromGroup, int64_t fromQQ, int64_t beingOperateQQ) {
	CQ_sendGroupMsg(ac, fromGroup, "Welcome to this group");
	return EVENT_BLOCK;
}


/*
 * Type=201 好友事件-好友已添加
 */

CQEVENT(int32_t, __eventFriend_Add, 16)(int32_t subType, int32_t sendTime, int64_t fromQQ) {
	return EVENT_IGNORE;
}


/*
 * Type=301 请求-好友添加
 * msg 附言
 * responseFlag 反馈标识(处理请求用)
 */

CQEVENT(int32_t, __eventRequest_AddFriend, 24)(int32_t subType, int32_t sendTime, int64_t fromQQ, const char *msg, const char *responseFlag) {
	return EVENT_IGNORE;
}


/*
 * Type=302 请求-群添加
 * subType 子类型，1/他人申请入群 2/自己(即登录号)受邀入群
 * msg 附言
 * responseFlag 反馈标识(处理请求用)
 */

CQEVENT(int32_t, __eventRequest_AddGroup, 32)(int32_t subType, int32_t sendTime, int64_t fromGroup, int64_t fromQQ, const char *msg, const char *responseFlag) {
	if (subType == 2) {
		CQ_setGroupAddRequestV2(ac, responseFlag, REQUEST_GROUPINVITE, REQUEST_ALLOW, "");
	}
	return EVENT_BLOCK;
}


/*
 * 菜单，可在 .json 文件中设置菜单数目、函数名
 * 如果不使用菜单，请在 .json 及此处删除无用菜单
 */

CQEVENT(int32_t, __menuAbout, 0)() {
	MessageBoxA(NULL, APP_INFO, "About" ,0);
	return 0;
}

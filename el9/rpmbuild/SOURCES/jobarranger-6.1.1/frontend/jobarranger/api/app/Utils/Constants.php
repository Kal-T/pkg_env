<?php
/*
** Job Arranger Manager
** Copyright (C) 2023 Daiwa Institute of Research Ltd. All Rights Reserved.
**
** Licensed to the Apache Software Foundation (ASF) under one or more
** contributor license agreements. See the NOTICE file distributed with
** this work for additional information regarding copyright ownership.
** The ASF licenses this file to you under the Apache License, Version 2.0
** (the "License"); you may not use this file except in compliance with
** the License. You may obtain a copy of the License at
**
** http://www.apache.org/licenses/LICENSE-2.0
**
** Unless required by applicable law or agreed to in writing, software
** distributed under the License is distributed on an "AS IS" BASIS,
** WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
** See the License for the specific language governing permissions and
** limitations under the License.
**
**/

namespace App\Utils;

/**
 * This class is used to declare constant data.
 *
 * @version    6.1.0
 * @since      Class available since version 6.1.0
 */
class Constants
{
    const PRODUCTION_ENV = "production";

    const DEVELOPMENT_ENV = "development";

    const PROJECT_ENV = self::PRODUCTION_ENV; // PRODUCTION_ENV | DEVELOPMENT_ENV

    const APP_VERSION = '6.1.1';

    const REVISION = 2984;

    const ZBX_MAIN_END_POINT = '/api_jsonrpc.php';

    const DB_MYSQL = 'mysql';

    const DB_PGSQL = 'pgsql';

    const MYSQL_UT8_ENCODING = ';charset=utf8mb4;';

    const PGSQL_UT8_ENCODING = ';options=\'--client_encoding=UTF8\';';

    const USER_TYPE_GENERAL = 1;

    const USER_TYPE_ADMIN = 2;

    const USER_TYPE_SUPER = 3;

    const USER_TYPE_NAMES_ARRAY = [1 => "GENERAL", 2 => "ADMIN", 3 => "SUPER"];

    const APP_TEMP_FOLDER_NAME = "JOB_ARRANGER_MANAGER_WEB_VER_5_0";

    const OBJECT_TYPE_CALENDAR = 1;

    const OBJECT_TYPE_FILTER = 2;

    const OBJECT_TYPE_SCHEDULE = 3;

    const OBJECT_TYPE_JOBNET = 4;

    const OBJECT_TYPE_CALENDAR_STRING = 'calendar';

    const OBJECT_TYPE_FILTER_STRING = 'filter';

    const OBJECT_TYPE_SCHEDULE_STRING = 'schedule';

    const OBJECT_TYPE_JOBNET_STRING = 'jobnet';

    const OBJECT_FORM_CREATE = "create";

    const OBJECT_FORM_EDIT = "edit";

    const OBJECT_FORM_NEW_VERSION = "new-version";

    const OBJECT_FORM_NEW_OBJECT = "new-object";

    const OBJECT_FORM_SCHEDULE = "schedule";

    const OBJECT_FORM_JOBNET_ICON_EDIT = "Jobnet Icon Update";

    const JOBNET_DUMMY_START_X = 'JOBNET_DUMMY_START_X';

    const JOBNET_DUMMY_START_Y = 'JOBNET_DUMMY_START_Y';

    const JOBNET_DUMMY_JOB_X = 'JOBNET_DUMMY_JOB_X';

    const JOBNET_DUMMY_JOB_Y = 'JOBNET_DUMMY_JOB_Y';

    const JOBNET_DUMMY_END_X = 'JOBNET_DUMMY_END_X';

    const JOBNET_DUMMY_END_Y = 'JOBNET_DUMMY_END_Y';

    const JOBNET_VIEW_SPAN = 'JOBNET_VIEW_SPAN';

    const JOBNET_LOAD_SPAN = 'JOBNET_LOAD_SPAN';

    const COUNT_INNER_JOBNET_ID = 2;

    const COUNT_INNER_JOB_ID = 20;

    const COUNT_INNER_FLOW_ID = 30;

    const COUNT_ID_JOBNET = 100;

    const COUNT_ID_CALENDAR = 101;

    const COUNT_ID_SCHEDULE = 102;

    const COUNT_ID_FILTER = 103;

    const RUN_JOB_STATUS_DURING = 2;

    const LOAD_STATUS_DELAY = 2;

    const JA_JP = "ja-JP";

    const ICON_TYPE_START = 0;

    const ICON_TYPE_END = 1;

    const ICON_TYPE_JOB = 4;

    const ICON_TYPE_JOBNET = 5;

    const ICON_TYPE_CONDITIONAL_START = 2;

    const ICON_TYPE_CONDITIONAL_END = 13;

    const ICON_TYPE_PARALLEL_START = 6;

    const ICON_TYPE_PARALLEL_END = 7;

    const ICON_TYPE_JOB_CONTROL_VARIABLE = 3;

    const ICON_TYPE_EXTENDED_JOB = 9;

    const ICON_TYPE_CALCULATION = 10;

    const ICON_TYPE_LOOP = 8;

    const ICON_TYPE_TASK = 11;

    const ICON_TYPE_INFO = 12;

    const ICON_TYPE_FILE_COPY = 14;

    const ICON_TYPE_FILE_WAIT = 15;

    const ICON_TYPE_REBOOT = 16;

    const ICON_TYPE_RELEASE = 17;

    const ICON_TYPE_AGENT_LESS = 18;

    const ICON_TYPE_ZABBIX = 19;

    const DEFAULT_JOBNET_VIEW_SPAN_VALUE = '60';

    const DEFAULT_JOBNET_LOAD_SPAN_VALUE = '60';

    const DEFAULT_JOBNET_KEEP_SPAN_VALUE = '60';

    const DEFAULT_JOBLOG_KEEP_SPAN_VALUE = '129600';

    const DEFAULT_JOBNET_DUMMY_START_X_VALUE = '117';

    const DEFAULT_JOBNET_DUMMY_START_Y_VALUE = '39';

    const DEFAULT_JOBNET_DUMMY_JOB_X_VALUE = '117';

    const DEFAULT_JOBNET_DUMMY_JOB_Y_VALUE = '93';

    const DEFAULT_JOBNET_DUMMY_END_X_VALUE = '117';

    const DEFAULT_JOBNET_DUMMY_END_Y_VALUE = '146';

    const DEFAULT_MANAGER_TIME_SYNC_VALUE = '0';

    const DEFAULT_ZBXSND_ZABBIX_IP_VALUE = '127.0.0.1';

    const DEFAULT_ZBXSND_ZABBIX_PORT_VALUE = '10051';

    const DEFAULT_ZBXSND_ZABBIX_HOST_VALUE = 'Zabbix server';

    const DEFAULT_ZBXSND_ITEM_KEY_VALUE = 'jasender';

    const DEFAULT_ZBXSND_SENDER_VALUE = 'zabbix_sender';

    const DEFAULT_ZBXSND_RETRY_VALUE = '0';

    const DEFAULT_ZBXSND_RETRY_COUNT_VALUE = '0';

    const DEFAULT_ZBXSND_RETRY_INTERVAL_VALUE = '5';

    const DEFAULT_ZBXSND_ON_VALUE = '0';

    const SCREEN_GENERAL_SETTING = "SCREEN_GENERAL_SETTING";

    const AJAX_MESSAGE_TYPE = "AJAX_MESSAGE_TYPE";

    const AJAX_MESSAGE_DB_LOCK = "AJAX_MESSAGE_DB_LOCK";

    const AJAX_MESSAGE_FAIL = "fail";

    const AJAX_MESSAGE_SUCCESS = "success";

    const AJAX_MESSAGE_SERVER_ALREADY_START = "AJAX_MESSAGE_SERVER_ALREADY_START";

    const AJAX_MESSAGE_INVALID = "AJAX_MESSAGE_INVALID";

    const AJAX_MESSAGE_DETAIL = "message-detail";

    const AJAX_RETURN_ITEM_DATA = "return-item";

    const AJAX_MESSAGE_DETAIL_TXT = "message-detail-txt";

    const AJAX_MESSAGE_OBJECT = "message-object";

    const AJAX_MESSAGE_DATA = "message-data";

    const AJAX_MESSAGE_NO_JOBNET = "AJAX_MESSAGE_NO_JOBNET";

    const AJAX_MESSAGE_NO_BOOTTIME = "AJAX_MESSAGE_NO_BOOTTIME";

    const AJAX_MESSAGE_NO_JOBNET_BOOTTIME = "AJAX_MESSAGE_NO_JOBNET_BOOTTIME";

    const AJAX_MESSAGE_RELATED_DATA = "AJAX_MESSAGE_RELATED_DATA";

    const AJAX_MESSAGE_DISABLE_JOBNET_BOOTTIME = "AJAX_MESSAGE_DISABLE_JOBNET_BOOTTIME";

    const AJAX_MESSAGE_DISABLE_COMPLETE = "AJAX_MESSAGE_DISABLE_COMPLETE";

    const AJAX_MESSAGE_INCOMPLETE = "AJAX_MESSAGE_INCOMPLETE";

    const AJAX_MESSAGE_RELOAD = "AJAX_MESSAGE_RELOAD";

    const AJAX_MESSAGE_OBJECTID = "message-objectid";

    const AJAX_MESSAGE_TO_OBJECTLIST = "AJAX_MESSAGE_TO_OBJECTLIST";

    const AJAX_MESSAGE_USING_OBJECT = "AJAX_MESSAGE_USING_OBJECT";

    const AJAX_MESSAGE_DISABLE_BASE_CALENDAR = "AJAX_MESSAGE_DISABLE_BASE_CALENDAR";

    const OBJECT_USER_TYPE_OWN = 'OWNER';

    const OBJECT_USER_TYPE_OTHER = 'OTHER';

    const AJAX_MESSAGE_IMPORT_ERROR = "AJAX_MESSAGE_IMPORT_ERROR";

    const AJAX_MESSAGE_DB_EXEC_ERROR = "AJAX_MESSAGE_DB_EXEC_ERROR";

    const OBJ_VALID_PROC = "VALID";

    const OBJ_DELETE_PROC = "DEL";

    const PROTECT_ROUTE = 1;

    const UNPROTECT_ROUTE = 0;

    const MAIN_SERVICE = 1;

    const SUB_SERVICE = 2;

    const EXPORT_TYPE_ALL = 'All';

    const EXPORT_TYPE_OBJECT = 'Object';

    const EXPORT_TYPE_VERSION = 'Version';

    //MESSAGE
    const SERVICE_MESSAGE_OBJ_NOT_LOCK = "Object is not locked.";

    const SERVICE_MESSAGE_OBJ_LOCK_USER_SAME = "Locked user is same.";

    const SERVICE_MESSAGE_OBJ_LOCK_BY_OTHERS = "Object is locked by other users.";

    const SERVICE_MESSAGE_SUCCESS = "Success";

    const SERVICE_MESSAGE_VALIDATION_FAIL = "Validation is Failed. ";

    const SERVICE_MESSAGE_JSON_INVALID = "Invalid Json Format. ";

    const SERVICE_MESSAGE_DATE_INVALID = "Invalid Date Format. ";

    const SERVICE_MESSAGE_FAIL = "Fail";

    const SERVICE_TYPE_LOCK = "Lock";

    const SERVICE_TYPE_CHECK = "Check Lock";

    const SERVICE_INTERNAL_SERVER_ERROR = "Internal Server Error";

    const SERVICE_VALID = "VALID";

    const SERVICE_INVALID = "INVALID";

    const SERVICE_MESSAGE_EDITABLE = "Editable";

    const SERVICE_MESSAGE_UNEDITABLE = "Uneditable";

    const SERVICE_MESSAGE_ITEM_NOT_FOUND = "Item Not Found";

    const SERVICE_MESSAGE_RECORD_EXIST = "Record Exist";

    const SERVICE_MESSAGE_RECORD_NOT_EXIST = "Record Not Exist";

    const DATABASE_CONNECTION_FAIL = "Database Connection Fail";

    const OPERATION_SITUATION_JOBNET_LIST = 1;

    const OPERATION_ERROR_JOBNET_LIST = 2;

    const OPERATION_DURING_JOBNET_LIST = 3;

    const JOBNET_ALL = "job_net_all";

    const PUBLIC_FLAG = 1;

    const PRIVATE_FLAG = 0;

    const JOBNET_MODEL = "jobnetModel";

    const CALENDAR_MODEL = "calendarModel";

    const FILTER_MODEL = "filterModel";

    const SCHEDULE_MODEL = "scheduleModel";

    const OBJECT_NOT_UPDATE = "Object_Not_Update";

    const ERROR_INPUT_REQUIRED = "Input is required";

    const ERROR_NO_JOB = "There is no registered job.";

    const ERROR_JOBEDIT_016 = "Parallel end icon is required for the processing!";

    const ERROR_JOBEDIT_017 = "Parallel start icon is required for the processing!";

    const ERROR_JOBEDIT_012 = "One Start icon,one or more End icons need to set up.";

    const ERROR_FLOW_001 = "The flow of the icon ";

    const ERROR_FLOW_002 = "is inaccurate. Please correct IN flow or an OUT flow.";

    const ZABBIX_SESSION_EXPIRED_ERROR = "Session terminated, re-login, please.";

    const RUN_TYPE_IMMEDIATE_RUN = 1;

    const RUN_TYPE_IMMEDIATE_RUN_AND_HOLD = 2;

    const RUN_TYPE_TEST_RUN = 3;

    const RUN_TYPE_SINGLE_RUN = 5;

    const DEFAULT_HEARTBEAT_INTERVAL_TIME_VALUE = 30;

    const DEFAULT_OBJECT_LOCK_EXPIRED_TIME_VALUE = 15;


    //METHOD FLAG
    const RUN_JOB_METHOD_TYPE_NORMAL = 0;

    const RUN_JOB_METHOD_TYPE_HOLD = 1;

    const RUN_JOB_METHOD_TYPE_SKIP = 2;

    const RUN_JOB_METHOD_TYPE_STOP = 3;

    const RUN_JOB_METHOD_TYPE_RERUN = 4;

    //Status
    const RUN_JOB_STATUS_TYPE_NONE = 0;

    const RUN_JOB_STATUS_TYPE_PREPARE = 1;

    const RUN_JOB_STATUS_TYPE_DURING = 2;

    const RUN_JOB_STATUS_TYPE_NORMAL = 3;

    const RUN_JOB_STATUS_TYPE_RUN_ERR = 4;

    const RUN_JOB_STATUS_TYPE_ABNORMAL = 5;

    const RUN_JOB_STATUS_TYPE_FORCE_STOP = 6;

    //Job Status
    const RUN_JOB_OPERATION_STATUS_NORMAL = 0;

    const RUN_JOB_OPERATION_STATUS_TIMEOUT = 1;

    const RUN_JOB_OPERATION_STATUS_ERROR = 2;

    //Timeout Flag
    const RUN_JOB_TIMEOUT_TYPE_NORMAL = 0;

    const RUN_JOB_TIMEOUT_TYPE_TIMEOUT = 1;

    //Abort Flag
    const ABORT_FLAG_NO_STOP = 0;

    const ABORT_FLAG_FORCE_STOP = 1;

    //Load Status
    const LOAD_STATUS_TYPE_NONE = 0;

    const LOAD_STATUS_TYPE_LOAD_ERR = 1;

    const LOAD_STATUS_TYPE_DELAY = 2;

    const LOAD_STATUS_TYPE_SKIP = 3;

    //Multiple Start
    const MULTIPLE_START_UP_YES = 0;

    const MULTIPLE_START_UP_SKIP = 1;

    const MULTIPLE_START_UP_WAIT = 2;

    //Invo Flag
    const INVO_FLAG_DEPLOY_INITIAL = 0;

    const INVO_FLAG_DEPLOY_COMPLETE = 1;

    //START PENDING FLAG
    const START_PENDING_FLAG_NORMAL = 0;

    const START_PENDING_FLAG_PENDING = 1;

    const START_PENDING_RELEASE = 2;

    //COMMAND CLS
    const COMMAND_CLS_SCRIPT = 0;

    const COMMAND_CLS_COMMAND = 1;

    const COMMAND_CLS_STOP_COMMAND = 2;

    //ZABBIX LINK TARGET
    const LINK_TARGET_HOST_GROUP = 0;

    const LINK_TARGET_HOST = 1;

    const LINK_TARGET_ITEM = 2;

    const LINK_TARGET_TRIGGER = 3;

    //ZABBIX LINK OPERATION
    const LINK_OPERATION_ENABLE = 0;

    const LINK_OPERATION_DISABLE = 1;

    const LINK_OPERATION_STATUS = 2;

    const LINK_OPERATION_DATA = 3;

    //LINE FEED CODE
    const LINE_FEED_LF = 0;

    const LINE_FEED_CR = 1;

    const LINE_FEED_CRLF = 2;

    //ZABBIX SESSION_FLAG
    const SESSION_ONE_TIME = 0;

    const SESSION_CONNECTION = 1;

    const SESSION_CONTINUATION = 2;

    const SESSION_DISCONNECT = 3;

    //EXTENED JOB COMMAND_ID
    const EXTJOB_COMMAND_SLEEP = "jacmdsleep";

    const EXTJOB_COMMAND_TIME = "jacmdtime";

    const EXTJOB_COMMAND_WEEK = "jacmdweek";

    const EXTJOB_COMMAND_ZBX_SENDER = "zabbix_sender";

    //AGENTLESS AUTH METHOD
    const AUTH_MEHTOD_PASSWORD = 0;

    const AUTH_METHOD_PUBLIC_KEY = 1;

    //AGENTLESS RUN MODE
    const RUN_MODE_INTERACT = 0;

    const RUN_MODE_NOT_INTERACT = 1;

    //HOST FLAG
    const HOST_FLAG_NAME = 0;

    const HOST_FLAG_VARIABLE = 1;

    //index count id

    const JOB_EXEC_MANAGEMENT_COUNT_ID = 2;

    const MESSAGE = [
        'lab-server-error' => 'Internal Server Error',
        'err-msg-db-exec-err' => 'A database execution error occurred.\nPlease contact a system administrator.',
        'err-rec-exist' => 'Record submitted already exists.',
        'lab-bad-request' => 'Bad request',
        'err-not-last-update' => 'Object is updated by other user. Please try again later.',
        'db-lock' => 'Since data is in use, it cannot be operated.At a later time, please try again.',
        'alt-msg-permit' => 'Permission Denied! ',
        'alt-msg-lock' => 'Object is locked by other users. ',
        'err-msg-del' => 'Valid object cannot be deleted.',
        'err-msg-fail' => 'Process failed!',
        'alt-msg-suc' => 'Process successful',
        'rel-error' => 'Because related other objects, you cannot change status of this, Please change the status of others shown below concerned, and operate it again.',
        'err-msg-no-boottime-jobnet' => "There is no Boottime or Jobnet. Please add these first.",
        'alt-msg-missing' => "Object is not available.",
        'err-jobedit-012' => "One Start icon,one or more End icons need to set up.",
        "err-jobedit-016" => "Parallel end icon is required for the processing!",
        "err-jobedit-017" => "Parallel start icon is required for the processing!",
        'err-flow' => "The flow of the icon is inaccurate. Please correct IN flow or an OUT flow.",
    ];
    const DETAIL_SERVER_ERROR = 'lab-server-error';
    const DETAIL_DB_ERROR = 'err-msg-db-exec-err';
    const DETAIL_BAD_REQUEST = 'lab-bad-request';
    const DETAIL_NOT_LAST_UPDATED = 'err-not-last-update';
    const DETAIL_DB_LOCK = 'db-lock';
    const DETAIL_PERMIT = 'alt-msg-permit';
    const DETAIL_LOCK = 'alt-msg-lock';
    const DETAIL_DEL = 'err-msg-del';
    const DETAIL_FAIL = 'err-msg-fail';
    const DETAIL_SUCCESS = 'alt-msg-suc';
    const DETAIL_REL_ERROR = 'rel-error';
    const DETAIL_NO_BOOTTIME_JOBNET = 'err-msg-no-boottime-jobnet';
    const DETAIL_OBJECT_NOT_FOUND = 'alt-msg-missing';
    const DETAIL_REC_EXISTS = 'err-rec-exist';
    const DETAIL_ERR_JOBEDIT_12 = 'err-jobedit-012';
    const DETAIL_ERR_JOBEDIT_16 = 'err-jobedit-016';
    const DETAIL_ERR_JOBEDIT_17 = 'err-jobedit-017';
    const DETAIL_ERR_FLOW = 'err-flow';
    //API RESPONSE MESSAGE

    const API_RESPONSE_TYPE = "type";

    const API_RESPONSE_DETAIL = "detail";

    const API_RESPONSE_MESSAGE = "message";

    const API_RESPONSE_MESSAGE_CODE = "message-code";

    const API_RESPONSE_DATA = "data";

    const API_RESPONSE_NOT_FOUND = "Not Found";

    const API_RESPONSE_CONFIG_NOT_FOUND = "Config not Found";

    const API_RESPONSE_TYPE_404 = 404;

    const API_RESPONSE_TYPE_403 = 403;

    const API_RESPONSE_TYPE_500 = 500;

    const API_RESPONSE_TYPE_OK = "Ok";

    const API_RESPONSE_TYPE_CONFIG = "config";

    const API_RESPONSE_TYPE_BAD_REQUEST = "Bad Request";

    const API_RESPONSE_TYPE_INCOMPLETE = "Incomplete";

    const API_RESPONSE_NOT_AUTHORISED = "Not authorized.";

    const API_RESPONSE_MESSAGE_OPERATION_FAIL =  "Operation is failed.";

    const API_RESPONSE_MESSAGE_OPERATION_SUCCESS =  "Operation is success.";

    const API_RESPONSE_TYPE_CONFIG_NOT_FOUND = "config not found";

    const API_RESPONSE_MESSAGE_NO_LOCK_SESSION =  "No lock session exists.";
}

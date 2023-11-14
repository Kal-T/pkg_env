#!/bin/bash

set -e

escape_spec_char() {
    local var_value=$1

    var_value="${var_value//\\/\\\\}"
    var_value="${var_value//[$'\n']/}"
    var_value="${var_value//\//\\/}"
    var_value="${var_value//./\\.}"
    var_value="${var_value//\*/\\*}"
    var_value="${var_value//^/\\^}"
    var_value="${var_value//\$/\\\$}"
    var_value="${var_value//\&/\\\&}"
    var_value="${var_value//\[/\\[}"
    var_value="${var_value//\]/\\]}"

    echo $var_value
}

update_config_var() {
    local config_path=$1
    local var_name=$2
    local var_value=$3
    local is_multiple=$4

    if [ ! -f "$config_path" ]; then
        echo "**** Configuration file '$config_path' does not exist"
        return
    fi

    echo -n "** Updating '$config_path' parameter \"$var_name\": '$var_value'... "

    # Remove configuration parameter definition in case of unset parameter value
    if [ -z "$var_value" ]; then
        sed -i -e "/^$var_name=/d" "$config_path"
        echo "removed"
        return
    fi

    # Remove value from configuration parameter in case of double quoted parameter value
    if [ "$var_value" == '""' ]; then
        sed -i -e "/^$var_name=/s/=.*/=/" "$config_path"
        echo "NULL"
        return
    fi

    # Escaping characters in parameter value
    var_value=$(escape_spec_char "$var_value")

    if [ "$(grep -E "^$var_name=" $config_path)" ] && [ "$is_multiple" != "true" ]; then
        sed -i -e "/^$var_name=/s/=.*/=$var_value/" "$config_path"
        echo "updated"
    elif [ "$(grep -Ec "^# $var_name=" $config_path)" -gt 1 ]; then
        sed -i -e  "/^[#;] $var_name=$/i\\$var_name=$var_value" "$config_path"
        echo "added first occurrence"
    else
        sed -i -e "/^[#;] $var_name=/s/.*/&\n$var_name=$var_value/" "$config_path"
        echo "added"
    fi

}
check_db_connect_mysql() {
    echo "********************"

    WAIT_TIMEOUT=5
    LOOP_MAX_CNT=20
    LOOP_CNT=0

    while [ ! "$(mysqladmin ping -h ${DB_SERVER_HOST} -P ${DB_SERVER_PORT} -u${MYSQL_USER} \
                -p${MYSQL_PASSWORD} --silent --connect_timeout=10)" ];
    do
        echo "mysqladmin ping -h ${DB_SERVER_HOST} -P ${DB_SERVER_PORT} -u${MYSQL_USER} -p${MYSQL_PASSWORD} --silent --connect_timeout=10"

        echo "**** MySQL server is not available. Waiting $WAIT_TIMEOUT seconds..."
        sleep $WAIT_TIMEOUT
        if [ $LOOP_MAX_CNT -lt $LOOP_CNT ];then
            echo "***************It connot connct to DB******************"
            exec "$@"
        else
            LOOP_CNT=$(($LOOP_CNT + 1))
        fi
   done
}

mysql_query() {
    query=$1
    local result=""

    result=$(mysql --silent --skip-column-names -h ${DB_SERVER_HOST} -P ${DB_SERVER_PORT} \
             -u ${MYSQL_USER} --password="${MYSQL_PASSWORD}" -e "$query")

    echo $result
}


echo "***********LOG START*********"

JOBARG=/usr/sbin/jobarg_monitor
JOBARRANGER_ETC_DIR=/etc/jobarranger
JAZ_CONFIG=${JOBARRANGER_ETC_DIR}/jobarg_monitor.conf

LOGTYPE=${LOGTYPE:-"console"}
DB_SERVER_PORT=${DB_SERVER_PORT:-3306}
DEBUGLEVEL=${DEBUGLEVEL:-"3"}
JALOGfILE=${JALOGFILE:-"/tmp/jobarg_monitor.log"}
JAPIDFILE=${JAPIDFILE:-"/tmp/jobarg_monitor.pid"}


update_config_var $JAZ_CONFIG "LogType" "${LOGTYPE}"
update_config_var $JAZ_CONFIG "DBHost" "${DB_SERVER_HOST}"
update_config_var $JAZ_CONFIG "DBName" "${MYSQL_DATABASE}"
update_config_var $JAZ_CONFIG "DBSchema" "${DB_SERVER_SCHEMA}"
update_config_var $JAZ_CONFIG "DBUser" "${MYSQL_USER}"
update_config_var $JAZ_CONFIG "DBPort" "${DB_SERVER_PORT}"
update_config_var $JAZ_CONFIG "DBPassword" "${MYSQL_PASSWORD}"
update_config_var $JAZ_CONFIG "DebugLevel" "${DEBUGLEVEL}"
update_config_var $JAZ_CONFIG "JaLogFile" "${JALOGfILE}"
update_config_var $JAZ_CONFIG "JaPidFile" "${JAPIDFILE}"

check_db_connect_mysql

result=$(mysql_query "SELECT count(*) FROM information_schema.tables where TABLE_NAME like 'ja%'")
if [ "$result" = "0" ];then
    export LANG=C.UTF-8
    cat /usr/share/doc/jobarranger-server-mysql/database/mysql/MySQL_JA_CREATE_TABLE.sql | mysql --silent --skip-column-names -h ${DB_SERVER_HOST} -P ${DB_SERVER_PORT} -u${MYSQL_USER} -p"${MYSQL_PASSWORD}" ${MYSQL_DATABASE} 1>/dev/null
    cat /usr/share/doc/jobarranger-server-mysql/database/data/JA_INSERT_TABLE.sql | mysql --silent --skip-column-names -h ${DB_SERVER_HOST} -P ${DB_SERVER_PORT} -u${MYSQL_USER} -p"${MYSQL_PASSWORD}" ${MYSQL_DATABASE} 1>/dev/null
    echo "***********CREATE DATABASE***********"
else
    echo "*********There are [${result}] tables *******"
fi

${JOBARG} -fc ${JAZ_CONFIG}

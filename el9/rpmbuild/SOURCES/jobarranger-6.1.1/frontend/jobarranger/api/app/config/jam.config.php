<?php
//Database parmams
define('DATA_SOURCE_NAME', 'mysql');
define('DB_HOST', 'localhost');
define('DB_USER', 'zabbix');
define('DB_PASS', 'zabbix');
define('DB_NAME', 'zabbix');

//ZABBIX API URL
define('ZBX_API_ROOT', 'http://localhost/zabbix');

//Application Log Path (Dynamic links)
define('APPLICATION_LOG_PATH', '/logs/app.log');

//Application Log Level (Dynamic)
define('APPLICATION_LOG_LEVEL', 'INFO');

//Permission To access SETUP screen 0=No 1=Yes
define('CONFIG_CREATION_PERMISSION', 0);

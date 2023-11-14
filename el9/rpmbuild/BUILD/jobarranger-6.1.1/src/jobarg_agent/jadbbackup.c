/*
** Job Arranger for ZABBIX
** Copyright (C) 2012 FitechForce, Inc. All Rights Reserved.
** Copyright (C) 2013 Daiwa Institute of Research Business Innovation Ltd. All Rights Reserved.
** Copyright (C) 2021 Daiwa Institute of Research Ltd. All Rights Reserved.
**
** This program is free software; you can redistribute it and/or modify
** it under the terms of the GNU General Public License as published by
** the Free Software Foundation; either version 2 of the License, or
** (at your option) any later version.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program; if not, write to the Free Software
** Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
**/


#include "common.h"
#include "log.h"

#if defined(ZABBIX_SERVICE)
#include "service.h"
#elif defined(ZABBIX_DAEMON)
#include "daemon.h"
#endif
#include "jacommon.h"
#include "jaagent.h"
#include "jadbbackup.h"
#include "jafile.h"
#include "jajobfile.h"
#include "jajournal.h"
#include <time.h>
#ifdef _WINDOWS
#include <dirent.h>
#else
#include <time.h>
#endif

extern int CONFIG_JA_BKUP_LOOP_TIMEOUT;
int thread_number = 0;
#ifndef _WINDOWS
int bkup_mthread_pid;
#endif
/******************************************************************************
 *                                                                            *
 * Function:                                                                  *
 *                                                                            *
 * Purpose:                                                                   *
 *                                                                            *
 * Parameters:                                                                *
 *                                                                            *
 * Return value:                                                              *
 *                                                                            *
 * Comments:                                                                  *
 *                                                                            *
 ******************************************************************************/
#ifndef _WINDOWS
void catch_bkup_sig_term(){
	int status;
	if(bkup_mthread_pid>0){
		kill(bkup_mthread_pid,SIGTERM);
        waitpid(bkup_mthread_pid,&status,WUNTRACED);
	}
  	exit(0);
}
#endif
void main_backup_thread()
{
    int local_request_failed = 0;
    struct tm	*tm;
    time_t		now;
    int backup_flag=0;
	int end_sleep = 10;
	int remainder = 0;
#ifndef _WINDOWS
	while (1) {
		// Check if any child process has terminated
		pid_t child_pid = waitpid(-1, NULL, WNOHANG);

		if (child_pid <= 0) {
			// No child process has terminated, break the loop
			break;
		} else {
			// A child process has terminated
			zabbix_log(LOG_LEVEL_DEBUG, "child process terminated.PID :%d ",child_pid);
		}
	}
	signal(SIGUSR1, alarm_handler);
	while (1) {
		jaalarm(CONFIG_JA_BKUP_LOOP_TIMEOUT);
#endif
		zabbix_log(LOG_LEVEL_DEBUG, "main_backup_thread started.");
		if (CONFIG_BACKUP_RUN_TIME == 24) {
			remainder = time(NULL) % ((size_t)CONFIG_BACKUP_TIME * 3600);
			if (remainder <= end_sleep) {
				zabbix_log(LOG_LEVEL_DEBUG, "jabackup CONFIG_BACKUP_TIME[%d] time[%d]", CONFIG_BACKUP_TIME, remainder);
				zabbix_log(LOG_LEVEL_INFORMATION, "jabackup  CONFIG_BACKUP_TIME START BACKUP");
				ja_datafile_remove_oldjob(CONFIG_JOB_HISTORY);
				zabbix_log(LOG_LEVEL_INFORMATION, "jabackup  CONFIG_BACKUP_TIME END BACKUP");
			}
		}
		else {
			time(&now);
			tm = localtime(&now);
			if (tm->tm_min == 0 && CONFIG_BACKUP_RUN_TIME == tm->tm_hour && backup_flag == 0) {
				zabbix_log(LOG_LEVEL_DEBUG, "jabackup CONFIG_BACKUP_RUN_TIME [%d] current H[%d]  backup_flag[%d]", CONFIG_BACKUP_RUN_TIME, tm->tm_hour, backup_flag);
				backup_flag = 1;
				zabbix_log(LOG_LEVEL_INFORMATION, "jabackup CONFIG_BACKUP_RUN_TIME START BACKUP");
				ja_datafile_remove_oldjob(CONFIG_JOB_HISTORY);
				zabbix_log(LOG_LEVEL_INFORMATION, "jabackup CONFIG_BACKUP_RUN_TIME END BACKUP");
			}
			else if (backup_flag == 1 && CONFIG_BACKUP_RUN_TIME != tm->tm_hour) {
				backup_flag = 0;
			}
		}
		zabbix_log(LOG_LEVEL_DEBUG, "main_backup_thread Finished. Sleeping :%d",end_sleep);
#ifdef _WINDOWS
		zbx_sleep(end_sleep);
		return 0;
#else
		zbx_sleep(end_sleep);
	}
	jaalarm(0);
#endif
}
ZBX_THREAD_ENTRY(jadbbackup_thread, args)
{
	//thread check process
	int status;
	time_t		log_now;
	struct tm* log_tm;
	int write_log = 1;
    assert(args);
	thread_number = ((zbx_thread_args_t*) args)->thread_num;
    zbx_free(args);
	zabbix_log(LOG_LEVEL_INFORMATION, "jobarg_agentd #%d started [jabackup]", thread_number);
	zbx_setproctitle("process jabackup_thread");
	time(&log_now);
	log_tm = localtime(&log_now);
	if (0 == log_tm->tm_hour || 4 == log_tm->tm_hour || 8 == log_tm->tm_hour || 12 == log_tm->tm_hour || 16 == log_tm->tm_hour || 20 == log_tm->tm_hour) {
		if (write_log == 0) {
			zabbix_log(LOG_LEVEL_INFORMATION, "jobarg_agentd[%s (revision %s)] #%d running [jabackup]", JOBARG_VERSION, JOBARG_REVISION, thread_number);
			write_log = 1;
		}
	}
	else {
		write_log = 0;
	}

#ifdef _WINDOWS
	HANDLE hThread;
    DWORD threadId;
	while(1){
		// Create a thread
		zabbix_log(LOG_LEVEL_DEBUG, "main_backup_thread creation");
		hThread = CreateThread(NULL, 0, main_backup_thread, NULL, 0, &threadId);
		zabbix_log(LOG_LEVEL_DEBUG, "main_backup_thread created.");

		if (hThread == NULL) {
			zabbix_log(LOG_LEVEL_ERR, "Failed to create thread. Error code: %lu\n", GetLastError());
			return 1;
		}

		// Wait for the thread to finish (in this case, it never finishes)
		DWORD waitResult = WaitForSingleObject(hThread, CONFIG_JA_BKUP_LOOP_TIMEOUT*1000);
		if (waitResult == WAIT_OBJECT_0) {
			DWORD threadExitCode;
			GetExitCodeThread(hThread, &threadExitCode); // Get the exit code of the thread

			// Check the exit code against your error codes
			switch (threadExitCode) {
			case 0:
				zabbix_log(LOG_LEVEL_DEBUG, "Backup Thread finished successfully.\n");
				break;
			case 6:
				zabbix_log(LOG_LEVEL_ERR, "File creation thread timed out.\n");
				break;
			default:
				zabbix_log(LOG_LEVEL_ERR, "Exiting jobarg_agentd.Backup process error occurred. exit code : %d\n", threadExitCode);
				break;
			}
		}
		else if (waitResult == WAIT_FAILED) {
			zabbix_log(LOG_LEVEL_ERR, "Backup execution  thread failed with error code :[%s]", GetLastError());
		}
		else if (waitResult == WAIT_TIMEOUT) {
			zabbix_log(LOG_LEVEL_ERR, "Backup execution timed out. Restart Backup Thread.");
			TerminateThread(hThread, 0);
		}
		// Close the thread handle
		CloseHandle(hThread);
	}
#else
    while(bkup_mthread_pid = fork()){
		signal(SIGTERM,catch_bkup_sig_term);
        if ( bkup_mthread_pid < 0 ) { exit(-1); }
        if(bkup_mthread_pid >0 ){
            zabbix_log(LOG_LEVEL_DEBUG,"Listen process execution thread : %d",bkup_mthread_pid);
        }
        wait(&status);
        if (WIFEXITED(status)) {
            if ( WEXITSTATUS(status) != 10 ) { 
				exit(WEXITSTATUS(status)); 
			}else{
				zabbix_log(LOG_LEVEL_INFORMATION,"[jabackup] Timeout error occurred. Restart.");
			}
        }
        if (WIFSIGNALED(status)) {
            kill(getpid(),WTERMSIG(status));
        }
        sleep(1);
    }
	main_backup_thread();
#endif
}
int ja_datafile_remove_oldjob(int day)
{	
	const int total_data_file_count = 7;
    int i, j, ii, jj, deleteFolder, fail_count, success_count,to_error_count;
	struct stat      stat_buf;
	time_t history,start,diff;
	char close_file[JA_FILE_PATH_LEN];
	char job_file[JA_FILE_PATH_LEN];
	char archive_folder[JA_FILE_PATH_LEN];
	char archive_folder_name[JA_FILE_PATH_LEN];
	char archive_file[JA_FILE_PATH_LEN];
	char del_file[JA_FILE_PATH_LEN];
	char data_file[JA_FILE_PATH_LEN];
	DIR *close_dir;
	DIR *jobs_dir;
	struct dirent *entry;
	int wait_count,loop_cnt = 0;
	int wait_max = 3;

    const char *__function_name = "ja_jobmain_remove_oldjob";

	start = time(NULL);
	fail_count = 0;
	success_count = 0;
	to_error_count = 0;

    zabbix_log(LOG_LEVEL_DEBUG, "In %s() day: %d", __function_name, day);
    history = time(NULL) - ((time_t)day * 24 * 60 * 60);
	zabbix_log(LOG_LEVEL_DEBUG, "In %s  history = %ld ", __function_name, history);
	close_dir = opendir(JA_CLOSE_FOLDER);
	if (NULL == close_dir)
	{
		zabbix_log(LOG_LEVEL_ERR, "In %s(), Folder cannot be read.", __function_name);
		//return FAIL;
		exit(0);
	}
	wait_count = 1;
	while ((entry = readdir(close_dir)) != NULL)
	{
		
		if (NULL != strstr(entry->d_name, ".job")) {
			zbx_snprintf(close_file, sizeof(close_file), "%s%c%s", JA_CLOSE_FOLDER, JA_DLM, entry->d_name);
			if (stat(close_file, & stat_buf) == 0) {
				zabbix_log(LOG_LEVEL_DEBUG, "In %s file[%s] modify time[%ld]", __function_name, close_file, stat_buf.st_mtime);
				//check history time.
				if ((history - stat_buf.st_mtime) > 0 ) {

					zbx_snprintf(archive_file, sizeof(archive_file), "%s%c%s", JA_CLOSE_FOLDER, JA_DLM, entry->d_name);
					zbx_snprintf(archive_folder_name, strlen(entry->d_name) - 3, "%s", entry->d_name);
					zbx_snprintf(archive_folder, sizeof(archive_folder), "%s%c%s", JA_CLOSE_FOLDER, JA_DLM, archive_folder_name);

					//check if sub folder exists in close folder;
					if (get_file_count(archive_folder) < total_data_file_count) {
						zabbix_log(LOG_LEVEL_DEBUG, "In %s()  some files are missing or sub folder is not under close folder.Moving to error folder.", __function_name);
						//move files from data and close/sub-folder to error folder.
						if (job_to_error(JA_CLOSE_FOLDER, entry->d_name) == FAIL) {
							zabbix_log(LOG_LEVEL_ERR, "In %s() [%s] data folder file delete failed. (%s)", __function_name, entry->d_name, strerror(errno));
						}
						to_error_count++;
						continue;
					}

					//execute each files using extensions.
					i = 0;
					while (FILE_EXT[i] != NULL) {
						jj = 0;
						if ( 0 == i) {
							for (ii = 0; ii < strlen(archive_folder_name); ii++) {
								data_file[ii] = archive_folder_name[ii];
								if (archive_folder_name[ii] == '-') {
									jj++;
									if (jj > 1) {
										break;
									}
								}
							}
							data_file[ii] = '\0';
						}
						else {
							zbx_snprintf(data_file, sizeof(data_file), "%s", archive_folder_name);
						}
						//delete files under /data folder,/close/sub-folder folder with same .job name in the close folder.	
						zbx_snprintf(del_file, sizeof(del_file), "%s%c%s.%s", archive_folder, JA_DLM, data_file, FILE_EXT[i]);
						zabbix_log(LOG_LEVEL_DEBUG, "In %s()  deletefile is : [%s]", __function_name, del_file);
						if (0 == remove(del_file)) {
							zabbix_log(LOG_LEVEL_DEBUG, "In %s() [%s] close file deleted.", __function_name, del_file);
						}
						else {
							zabbix_log(LOG_LEVEL_ERR, "In %s() [%s] file close delete failed. (%s)", __function_name, del_file, strerror(errno));
							//delete data file under /data folder if close/sub-folder data files cannot be removed.
							zbx_snprintf(del_file, sizeof(del_file), "%s%c%s.%s",JA_DATA_FOLDER, JA_DLM, data_file, FILE_EXT[i]);
							if (0 == remove(del_file)) {
								zabbix_log(LOG_LEVEL_WARNING, "In %s() [%s] data folder file deleted.", __function_name, del_file);
							}
							else {
								//file does not exist or other error under /data folder.
								zabbix_log(LOG_LEVEL_ERR, "In %s() [%s] data folder file delete failed. (%s)", __function_name, del_file, strerror(errno));
								continue;
							}
						}
						i++;
					}
					if (wait_count >= wait_max) {					
						zbx_sleep(1);
						wait_count = 0;
					}
					else {
						wait_count++;
					}
					j = 0;
					deleteFolder = rmdir(archive_folder);
					if (0 == deleteFolder) {
						zabbix_log(LOG_LEVEL_DEBUG, "In %s() [%s] deleted folder.", __function_name, archive_folder_name);
						j = 1;
					}
					else {
						if (stat(archive_folder, &stat_buf) == 0) {
							zabbix_log(LOG_LEVEL_ERR, "In %s() [%s] folder, delete failed. (%s)", __function_name, archive_folder, strerror(errno));
							continue;
						}
						else {
							zabbix_log(LOG_LEVEL_WARNING, "In %s() [%s] This folder does not exist. (%s)", __function_name, archive_folder, strerror(errno));
							j = 1;
						}
					}
					if (1 == j && 0 == remove(close_file)) {
						zabbix_log(LOG_LEVEL_INFORMATION, "In %s() deleted [%s] job file.", __function_name, entry->d_name);
						success_count++;
					}
					else {
						zabbix_log(LOG_LEVEL_ERR, "In %s() [%s] job file, delete failed. (%s)", __function_name, close_file, strerror(errno));
						fail_count++;
					}
				}
			}
			else {
				zabbix_log(LOG_LEVEL_ERR, "In %s() file cannot be read.[%s]", __function_name, close_file);
			}
		}
	}
	closedir(close_dir);
	zabbix_log(LOG_LEVEL_INFORMATION, "Delete: %d success, %d fail",success_count,fail_count);
	zabbix_log(LOG_LEVEL_INFORMATION, "Moved under error dir : % d", to_error_count);
	diff = time(NULL) - start;
	zabbix_log(LOG_LEVEL_INFORMATION, "Execution time : %ld sec.", diff);

	// delete the index job files under /jobs
	fail_count = 0;
	success_count = 0;

	jobs_dir = opendir(JA_JOBS_FOLDER);
	if (NULL == jobs_dir)
	{
		zabbix_log(LOG_LEVEL_ERR, "In %s(), Folder cannot be read.", __function_name);
		//return FAIL;
		exit(0);
	}
	while ((entry = readdir(jobs_dir)) != NULL)
	{
		if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) {
			continue;
		}else {
			zbx_snprintf(job_file, sizeof(job_file), "%s%c%s", JA_JOBS_FOLDER, JA_DLM, entry->d_name);
            if (0 == remove(job_file)) {
				zabbix_log(LOG_LEVEL_INFORMATION, "In %s() deleted [%s] job file.", __function_name, entry->d_name);
				success_count++;
			}
			else {
				zabbix_log(LOG_LEVEL_ERR, "In %s() [%s] job file, delete failed. (%s)", __function_name, close_file, strerror(errno));
				fail_count++;
			}
        }
	}
	closedir(jobs_dir);

	zabbix_log(LOG_LEVEL_INFORMATION, "In Jobs folder, Delete: %d success, %d fail",success_count,fail_count);

    return SUCCEED;
}

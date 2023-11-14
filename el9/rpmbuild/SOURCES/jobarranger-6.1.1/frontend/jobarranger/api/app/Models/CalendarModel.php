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

namespace App\Models;

use App\Utils\Constants;
use App\Utils\Model;

/**
 * This model is used to manage the calendar.
 *
 * @version    6.1.0
 * @since      Class available since version 6.1.0
 */
class CalendarModel extends Model
{
    /**
     * It retrieves all calendar lists depends on search data.
     *
     * @param   int $publicFlag  public:1,private:0
     * @param   string $sort     ASC | DESC
     * @param   string $limit
     * @param   string $search 
     * @throws  Exception
     * @return  array  calendar lists
     * @since   Method available since version 6.1.0
     */
    public function getData($publicFlag, $search)
    {
        $sortBy = "";
        $where = "";
        $objBaseQuery = "";
        $objSelectQuery = "";
        $validFlag = 1;

        if ($_SESSION['userInfo']['userType'] == Constants::USER_TYPE_SUPER || $publicFlag == 1) {
            $sortBy = " ORDER BY calendar_id ";
        } else {
            $sortBy = " ORDER BY CALENDAR.calendar_id ";
        }

        if ($search !== "") {
            $where = " AND " . substr($search, 0, -4);
        }

        $objBaesQueryFormat = "SELECT * FROM ja_calendar_control_table 
                        WHERE valid_flag = %s AND public_flag = %s 
                        %s
                        UNION ALL  
                        SELECT * FROM ja_calendar_control_table A 
                        WHERE A.update_date= ( SELECT MAX(update_date) FROM ja_calendar_control_table B 
                        WHERE B.calendar_id NOT IN (SELECT calendar_id FROM ja_calendar_control_table  
                        WHERE valid_flag = %s )  
                        AND B.public_flag = %s AND A.calendar_id = B.calendar_id 
                        GROUP BY calendar_id  )
                        %s ";

        $objBaseQuery = sprintf($objBaesQueryFormat, $validFlag, $publicFlag, $where, $validFlag, $publicFlag, $where);

        if ($_SESSION['userInfo']['userType'] == Constants::USER_TYPE_SUPER || $publicFlag == 1) {
            $objSelectQuery = $objBaseQuery . $sortBy;
        } else {
            $userid = $_SESSION['userInfo']['userId'];
            $objBaseQuery = "SELECT CALENDAR.* FROM ( $objBaseQuery ) AS CALENDAR, 
                users AS U, users_groups AS UG1, users_groups AS UG2  
                WHERE CALENDAR.user_name = U.username  
                AND U.userid = UG1.userid 
                AND UG2.userid=$userid 
                AND UG1.usrgrpid = UG2.usrgrpid  ";

            $objSelectQuery = $objBaseQuery . $sortBy;
        }

        $this->db->query($objSelectQuery);
        $resultArray = $this->db->resultSet();
        return $resultArray;
    }

    /**
     * It retrieves valid or latest clendar data depends on id.
     *
     * @param   string $id  calendar id
     * @return  array  calendar info 
     * @since   Method available since version 6.1.0
     */
    public function GetValidORMaxUpdateDateCalendarById($id)
    {
        $this->db->query("SELECT * FROM ja_calendar_control_table WHERE calendar_id = '$id' AND valid_flag = '1'");
        $data = $this->db->single();
        if (empty($data)) {
            $this->db->query("select * from ja_calendar_control_table where calendar_id = '$id' and update_date = (select max(update_date) from ja_calendar_control_table where calendar_id='$id')");
            $data = $this->db->single();
        }

        return $data;
    }

    // //retrieve the first row data 
    // public function first()
    // {
    //     $this->db->query("SELECT * FROM ja_calendar_control_table LIMIT 1");

    //     return $this->db->single();
    // }

    /**
     * It retrieves detail information of calendar depends on id.
     *
     * @param   string $id  calendar id
     * @return  array  calendar info 
     * @since   Method available since version 6.1.0
     */
    public function detail($id)
    {
        $this->db->query("SELECT * FROM ja_calendar_control_table WHERE calendar_id = '$id' ORDER BY update_date DESC");

        return $this->db->resultSet();
    }

    /**
     * It retrieves detail information of calendar depends on id and update date.
     *
     * @param   string $id  calendar id
     * @param   object $updateDate
     * @return  array  calendar info 
     * @since   Method available since version 6.1.0
     */
    public function each($id, $updateDate = null)
    {
        $query = " calendar_id = '$id'";
        if ($updateDate != null) {
            $query .= " and update_date=' $updateDate' ";
        }
        $this->db->query("SELECT * FROM ja_calendar_control_table WHERE $query");

        return $this->db->single();
    }

    /**
     * It retrieves user name.
     *
     * @return  string user name
     * @since   Method available since version 6.1.0
     */
    public function getName()
    {
        $this->db->query("SELECT user_name FROM ja_calendar_control_table");

        return $this->db->single();
    }

    // //retrieve the calendar id by Myat Noe
    // public function getlastID()
    // {
    //     $this->db->query("SELECT calendar_id FROM zabbix.ja_calendar_control_table WHERE calendar_id regexp '_[0-9]_' ORDER BY update_date DESC");

    //     return $this->db->single(__METHOD__);
    // }

    /**
     * It retrieves the next calendar id.
     *
     * @param   int $id  calendar id count
     * @return  string last calendar id
     * @since   Method available since version 6.1.0
     */
    public function getNextID($id)
    {
        $this->db->query("SELECT nextid FROM ja_index_table WHERE count_id = '$id' for update");

        return $this->db->single(__METHOD__);
    }

    /**
     * It increase the calendar id after retrieve next id
     *
     * @param   int $id  calendar id count
     * @return  bool could be true if increase process success, could be false if fail
     * @since   Method available since version 6.1.0
     */
    public function increateNextID($id)
    {
        $this->db->query('UPDATE ja_index_table SET nextid = nextid + 1 WHERE count_id = :id');

        $this->db->bind(':id', $id);

        if ($this->db->execute(__METHOD__)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * It retrieves operation date lists of calendar.
     *
     * @param   string $id  calendar id 
     * @param   string $updateDate
     * @return  array operation date lists
     * @since   Method available since version 6.1.0
     */
    public function getDates($id, $updateDate)
    {
        $query = " calendar_id = '$id'";
        if ($updateDate != null) {
            $query .= " and update_date=' $updateDate' ";
        }
        $this->db->query("SELECT operating_date FROM ja_calendar_detail_table WHERE $query");

        return $this->db->resultSet(__METHOD__);
    }

    /**
     * It retrieves the last day of the calendar.
     *
     * @param   string $id  calendar id
     * @param   string $date update date of calendar
     * @return  array last day of calendar
     * @since   Method available since version 6.1.0
     */
    public function getLastDay($id, $date)
    {
        $this->db->query("SELECT max(operating_date) AS max FROM ja_calendar_detail_table WHERE calendar_id = '$id' AND update_date = '$date'");

        return $this->db->single(__METHOD__);
    }

    /**
     * It delete calendar row.
     *
     * @param   string $id  calendar id 
     * @param   string $updateDate
     * @return  bool could be true if delete process success, could be false if fail
     * @since   Method available since version 6.1.0
     */
    public function delete($id, $updateDate)
    {
        $query = " calendar_id = '$id'";
        if ($updateDate != null) {
            $query .= " and update_date='$updateDate' ";
        }
        $this->db->query("DELETE FROM ja_calendar_control_table WHERE $query");
        if ($this->db->execute(__METHOD__)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * It delete selected calendar rows of calendar version lists.
     *
     * @param   string $objectId   calendar id 
     * @param   array  $deleteRows  array for delete
     * @return  bool  could be true if delete process success, could be false if fail
     * @since   Method available since version 6.1.0
     */
    public function deleteArr($objectId, $deleteRows)
    {
        foreach ($deleteRows as $updateDate) {
            if ($this->delete($objectId, $updateDate['updateDate']) == false) {
                return false;
            }
        }
        return true;
    }

    /**
     * It delete all verion in calendar version list.
     *
     * @param   string $id   calendar id 
     * @return  bool could be true if delete process success, could be false if fail
     * @since   Method available since version 6.1.0
     */
    public function deleteAllVer($id)
    {
        $query = " calendar_id = '$id'";
        $this->db->query("DELETE FROM ja_calendar_control_table WHERE $query");
        if ($this->db->execute(__METHOD__)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * It checks the calendar id is available or not.
     *
     * @param   string $id     id of the calendar.
     * @return  bool could be false if available, could be true if not
     * @since   Method available since version 6.1.0
     */
    public function checkID($id)
    {
        $this->db->query("SELECT calendar_id FROM ja_calendar_control_table WHERE calendar_id = '$id'");
        $result = $this->db->execute(__METHOD__);
        if ($this->db->rowcount() > 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * It proceeds update the calendar object.
     *
     * @param   array $data     calendar object including calendar info.
     * @return  bool could be true if update process success, could be false if not
     * @since   Method available since version 6.1.0
     */
    public function update($data)
    {
        $this->db->query('UPDATE ja_calendar_control_table SET calendar_id = :id, calendar_name= :name, memo= :desc, update_date = :update_date, public_flag= :public_flag WHERE calendar_id = :urlid AND update_date = :urldate');

        $this->db->bind(':urlid', $data['urlid']);
        $this->db->bind(':urldate', $data['urldate']);
        $this->db->bind(':id', $data['id']);
        $this->db->bind(':name', $data['name']);
        $this->db->bind(':public_flag', $data['public_flag']);
        $this->db->bind(':update_date', $data['update_date']);
        $this->db->bind(':desc', $data['desc']);

        if ($this->db->execute(__METHOD__)) {
            if ($this->updateFlag($data)) {
                return true;
            }
        }
        return false;
    }

    /**
     * It proceeds update the calendar operation date.
     *
     * @param   array $data     calendar object including calendar info and operation dates.
     * @return  bool could be true if update process success, could be false if not
     * @since   Method available since version 6.1.0
     */
    public function updateDates($data)
    {
        $this->db->query('UPDATE ja_calendar_detail_table SET calendar_id = :id, update_date= :update_date, operating_date = :operating_date  WHERE calendar_id = :id');

        $this->db->bind(':id', $data['id']);
        $this->db->bind(':update_date', $data['update_date']);
        $this->db->bind(':operating_date', $data['operating_date']);

        if ($this->db->execute(__METHOD__)) {
            return true;
        } else {
            return false;
        }
    }


    /**
     * It create the new calendar object.
     *
     * @param   array $data     calendar object including calendar info and operation dates.
     * @return  bool could be true if create process success, could be false if not
     * @since   Method available since version 6.1.0
     */
    public function save($data)
    {
        $this->db->query('INSERT INTO ja_calendar_control_table (calendar_id, calendar_name, user_name, public_flag, update_date, memo) VALUES (:id, :name, :username, :public_flag, :update_date, :desc)');

        $this->db->bind(':id', $data['id']);
        $this->db->bind(':name', $data['name']);
        $this->db->bind(':username', $data['username']);
        $this->db->bind(':public_flag', $data['public_flag']);
        $this->db->bind(':update_date', $data['update_date']);
        $this->db->bind(':desc', $data['desc']);

        if ($this->db->execute(__METHOD__)) {
            $this->updateFlag($data);
            return true;
        } else {
            return false;
        }
    }

    /**
     * It update the public_flag of entire calendar version.
     *
     * @param   array $data     calendar object including calendar info and operation dates.
     * @return  bool could be true if update process success, could be false if not
     * @since   Method available since version 6.1.0
     */
    public function updateFlag($data)
    {
        $this->db->query('UPDATE ja_calendar_control_table SET public_flag=:public_flag WHERE calendar_id=:id');
        $this->db->bind(':id', $data['id']);
        $this->db->bind(':public_flag', $data['public_flag']);
        if ($this->db->execute(__METHOD__)) {
            return true;
        } else {
            return false;
        }
    }


    /**
     * It save the operation date of the calendar.
     *
     * @param   array $data     calendar object including calendar info and operation dates.
     * @return  bool could be true if save process success, could be false if not
     * @since   Method available since version 6.1.0
     */
    public function saveDate($data)
    {
        $this->db->query('INSERT INTO ja_calendar_detail_table (calendar_id, update_date, operating_date) VALUES (:id, :update_date, :operating_date)');

        $this->db->bind(':id', $data['id']);
        $this->db->bind(':update_date', $data['update_date']);
        $this->db->bind(':operating_date', $data['operating_date']);

        if ($this->db->execute(__METHOD__)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * It delete the calendar detail row.
     *
     * @param   string $id     calendar id
     * @param   string $updateDate 
     * @return  bool could be true if delete process success, could be false if not
     * @since   Method available since version 6.1.0
     */
    public function deleteDates($id, $updateDate)
    {
        $query = " calendar_id = '$id'";
        if ($updateDate != null) {
            $query .= " and update_date=' $updateDate' ";
        }
        $this->db->query("DELETE FROM ja_calendar_detail_table WHERE $query");


        if ($this->db->execute(__METHOD__)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * It change valid status calendar object to enabled on calendar id.
     *
     * @param   string $id     calendar id
     * @param   string $updateDate 
     * @return  bool could be true if status change process success, could be false if not
     * @since   Method available since version 6.1.0
     */
    public function changeStatusToEnabled($id, $updateDate)
    {
        $this->db->query('UPDATE ja_calendar_control_table SET valid_flag = 1 WHERE calendar_id = :id AND update_date = :updateDate');

        $this->db->bind(':id', $id);
        $this->db->bind(':updateDate', $updateDate);

        if ($this->db->execute(__METHOD__)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * It checks clendar is used in enabled filter.
     *
     * @param   string $id     calendar id
     * @return  array related filter data
     * @since   Method available since version 6.1.0
     */
    public function checkFilterDisable($id)
    {
        $this->db->query('SELECT filter_id, update_date FROM ja_filter_control_table WHERE base_calendar_id = :id AND valid_flag = 1');
        $this->db->bind(':id', $id);
        $this->db->execute();
        return $this->db->resultSet();
    }

    /**
     * It checks clendar is used in enabled schedule.
     *
     * @param   string $id     calendar id
     * @return  array related schedule data
     * @since   Method available since version 6.1.0
     */
    public function checkScheduleDisable($id)
    {
        $this->db->query('SELECT c.schedule_id , c.update_date FROM ja_schedule_detail_table d INNER JOIN ja_schedule_control_table c ON  c.schedule_id = d.schedule_id WHERE d.calendar_id = :id AND c.valid_flag = 1 AND d.update_date = c.update_date GROUP BY c.schedule_id , c.update_date');
        $this->db->bind(':id', $id);
        $this->db->execute();
        return $this->db->resultSet();
    }

    /**
     * It changes calendar valid status to disable.
     *
     * @param   string $id     calendar id
     * @param   string $updateDate
     * @return  bool could be true if status change process is success, could be false if not
     * @since   Method available since version 6.1.0
     */
    public function changeStatusToDisabled($id, $updateDate)
    {
        $this->db->query('UPDATE ja_calendar_control_table SET valid_flag = 0 WHERE calendar_id = :id AND update_date = :updateDate');

        $this->db->bind(':id', $id);
        $this->db->bind(':updateDate', $updateDate);

        if ($this->db->execute(__METHOD__)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * It changes all calendar version status to disable.
     *
     * @param   string $id     calendar id
     * @return  bool could be true if status change process is success, could be false if not
     * @since   Method available since version 6.1.0
     */
    public function changeAllStatusToDisabled($id)
    {
        $this->db->query('UPDATE ja_calendar_control_table SET valid_flag = 0 WHERE calendar_id = :id');
        $this->db->bind(':id', $id);
        if ($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * It checks filter and schedule related data for delete.
     *
     * @param   string $id     calendar id
     * @return  bool could be true if related data is exists, could be false if not
     * @since   Method available since version 6.1.0
     */
    public function checkCalendarAndFilterForDelete($id)
    {
        $this->db->query("SELECT filter_id, update_date FROM ja_filter_control_table 
        WHERE base_calendar_id = '$id'");
        $this->db->execute();
        $calendarChk = $this->db->rowcount() > 0;

        $this->db->query("SELECT schedule_id, update_date FROM ja_schedule_detail_table 
        WHERE calendar_id = '$id'");
        $this->db->execute();
        $filterChk = $this->db->rowcount() > 0;

        if (($calendarChk) || ($filterChk)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * It checks schedule for detete.
     *
     * @param   string $id     calendar id
     * @return  array related schedule info
     * @since   Method available since version 6.1.0
     */
    public function checkScheduleForDelete($id)
    {
        $this->db->query("SELECT schedule_id, update_date FROM ja_schedule_detail_table 
                        WHERE calendar_id = '$id' GROUP BY schedule_id,update_date");
        $this->db->execute();
        return $this->db->resultSet();
    }

    /**
     * It checks filter for detete.
     *
     * @param   string $id     calendar id
     * @return  array related filter info
     * @since   Method available since version 6.1.0
     */
    public function checkFilterForDelete($id)
    {
        $this->db->query("SELECT filter_id, update_date FROM ja_filter_control_table 
                        WHERE base_calendar_id = '$id' GROUP BY filter_id, update_date" );
        $this->db->execute();
        return $this->db->resultSet();
    }

    /**
     * It deletes all selected calendar from object_list.
     *
     * @param   string  $id    calendar id to delete
     * @return  bool    could be true if delete process success,could be false if not
     * @since   Method available since version 6.1.0
     */
    public function deleteAll($id)
    {
        $this->db->query("DELETE FROM ja_calendar_control_table WHERE calendar_id = '$id'");
        if ($this->db->execute(__METHOD__)) {
            return true;
        } else {
            return false;
        }
    }

    // //delete all for version multiple control
    // public function deleteMultiple($id, $updateDate, $objType)
    // {
    //     $dbField = $objType . "_id";
    //     $this->db->query("DELETE FROM ja_" . $objType . "_control_table WHERE $dbField = '$id' AND update_date = '$updateDate'");
    //     if ($this->db->execute(__METHOD__)) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    /**
     * It retrieves total version count of a calendar.
     *
     * @param   string  $id    calendar id
     * @return  int    number of calendar version
     * @since   Method available since version 6.1.0
     */
    public function totalRows($id)
    {
        $this->db->query('SELECT COUNT(*) as count FROM ja_calendar_control_table WHERE calendar_id = :id');

        $this->db->bind(':id', $id);
        return (int) $this->db->resultSet()[0]->count;
    }

    /**
     * It retrieves calendar info for super admin
     *
     * @return  array    number of calendar version
     * @since   Method available since version 6.1.0
     */
    public function getInfoByUserIdSuper()
    {
        $this->db->query("SELECT A.calendar_id,A.calendar_name,A.update_date " .
        "FROM ja_calendar_control_table AS A " .
        "WHERE A.update_date=" .
        "( SELECT MAX(B.update_date) " .
        "FROM ja_calendar_control_table AS B " .
        "WHERE A.calendar_id = B.calendar_id) " .
        "order by A.calendar_id");
        return $this->db->resultSet();
    }

    /**
     * It retrieves calendar info by user id
     *
     * @param   string  $userId
     * @return  array    number of calendar version
     * @since   Method available since version 6.1.0
     */
    public function getInfoByUserId($userId)
    {
        $this->db->query("SELECT calendar.calendar_id, calendar.calendar_name, calendar.update_date " .
        "FROM ( " .
        "(" .
        "SELECT C.calendar_id, C.calendar_name, C.update_date " .
        "FROM ja_calendar_control_table as C " .
        "WHERE C.public_flag =1 " .
        "and C.update_date=" .
        "( SELECT MAX(D.update_date) " .
        "FROM ja_calendar_control_table AS D " .
        "WHERE D.calendar_id = C.calendar_id) " .
        ") " .
        "UNION (" .
        "SELECT A.calendar_id, A.calendar_name, A.update_date " .
        "FROM ja_calendar_control_table AS A, users AS U, users_groups AS UG1, users_groups AS UG2 " .
        "WHERE A.user_name = U.username " .
        "AND U.userid = UG1.userid " .
        "AND UG2.userid=$userId " .
        "AND UG1.usrgrpid = UG2.usrgrpid " .
        "AND A.update_date = ( " .
        "SELECT MAX( B.update_date ) " .
        "FROM ja_calendar_control_table AS B " .
        "WHERE B.calendar_id = A.calendar_id " .
        "GROUP BY B.calendar_id ) " .
        "AND A.public_flag =0" .
        ")" .
        ") AS calendar " .
        "ORDER BY calendar.calendar_id");
        return $this->db->resultSet();
    }

    /**
     * It retrieves valid or latest calendar info
     *
     * @param   string  $calendarId
     * @return  array    number of calendar version
     * @since   Method available since version 6.1.0
     */
    public function getValidORMaxUpdateDateEntityById($calendarId)
    {
        $result = $this->getValidEntityById($calendarId);
        if($result){
            return $result;
        }
        return $this->getMaxUpdateDateEntityById($calendarId);
    }

    /**
     * It retrieves valid calendar info
     *
     * @param   string  $calendarId
     * @return  array    number of calendar version
     * @since   Method available since version 6.1.0
     */
    public function getValidEntityById($calendarId)
    {
        $this->db->query("select * from ja_calendar_control_table " .
        "where calendar_id = '$calendarId' and valid_flag = '1'");
        return $this->db->single();
    }

    /**
     * It retrieves latest calendar info
     *
     * @param   string  $calendarId
     * @return  array    number of calendar version
     * @since   Method available since version 6.1.0
     */
    public function getMaxUpdateDateEntityById($calendarId)
    {
        $this->db->query("select * from ja_calendar_control_table " .
        "where calendar_id = '$calendarId' and update_date = (select max(update_date) from ja_calendar_control_table where calendar_id= '$calendarId')");
        return $this->db->single();
    }
}

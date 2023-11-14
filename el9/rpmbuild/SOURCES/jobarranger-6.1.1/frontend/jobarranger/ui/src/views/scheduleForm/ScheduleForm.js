import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import store from "../../store";
import Layout from "antd/lib/layout/layout";
import { SaveFilled, CloseCircleFilled } from "@ant-design/icons/";
import "./ScheduleForm.scss";
import FormObject from "../../components/form/formObject/FormObject";
import FloatingButtons from "../../components/button/floatingButtons/FloatingButtons";
import { useDispatch, useSelector } from "react-redux";
import { OBJECT_CATEGORY, FORM_TYPE, SERVICE_RESPONSE, USER_TYPE } from "../../constants";
import { Form, Button, Table, TreeSelect, Spin, Row, Col, Input } from "antd";
import { useTranslation } from "react-i18next";
import {
  initSchedule,
  getCalendarIdList,
  getJobnetIdList,
  getJobnetObj,
  getCalFilObj,
  setBoottimeFlag,
  setCalendarObjectLists,
  setJobnetObjectLists,
  initScheduleEdit,
  setScheduleFormData,
  saveScheduleObj,
} from "../../store/ScheduleFormSlice";

import { useNavigate, useParams } from "react-router-dom";
import ScheduleFormService from "../../services/ScheduleFormService";
import {
  alertError,
  alertSuccess,
  confirmDialog,
  alertInfo,
} from "../../components/dialogs/CommonDialog";
import CalendarForm from "../../components/calendarForm/CalendarForm";
import FilterFormComponent from "../../components/filterForm/FilterForm";
import JobnetForm from "../../components/jobnet/jobnetForm/JobnetForm";
import objectLockService from "../../services/objectLockService";
import {
  lockObject,
  setObjectFormEditable,
  setunLock,
} from "../../store/ObjectListSlice";
import { unlock } from "../../store/LockManagementSlice";
import { cleanupFilterForm } from "../../store/FilterSlice";
import { cleanupCalendarForm } from "../../store/CalendarSlice";
import usePrompt from "../../components/dialogs/usePrompt";
const EditableContext = React.createContext(null);

const ScheduleForm = ({ formType, publicType }) => {
  const disabledAlert = useRef(0);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const calendarObjLists =
    useSelector((state) => state["schedule"].calendarObjLists) ?? [];
  const formObject = useSelector((state) => state["schedule"].formData);
  const heartbeatIntervalTime =
    useSelector((state) => state.user.userInfo.heartbeatIntervalTime) || 30;
  const [backKeyEvent, setBackKeyEvent] = useState(false);
  const [editable, setEditable] = useState(1);
  const [isLocked, setIsLocked] = useState(0);
  const responseData = useSelector((state) => state["schedule"].responseData);
  const isDialog = useRef(false);
  const modifyForm = useRef(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const userType = useSelector((state) => state["user"].userInfo.userType);
  const objectLockObject = useRef({
    objectId: "",
    objectType: 0,
  });

  const cancelPopState = useCallback((event) => {
    var r = window.confirm(t("warn-mess-redisplay"));
    if (r == false) {
      window.history.pushState(
        "fake-route",
        document.title,
        window.location.href
      );
      event.preventDefault();
    } else {
      navigate(-1);
    }
  }, []);

  useEffect(() => {
    if (!isBlocked) {
      setIsBlocked(modifyForm.current);
    }
  }, [modifyForm.current]);

  useEffect(() => {
    if (
      (modifyForm.current ||
        formType === FORM_TYPE.NEW_OBJECT ||
        formType === FORM_TYPE.CREATE) &&
      backKeyEvent === false
    ) {
      // Add a fake history event so that the back button does nothing if pressed once
      window.history.pushState(
        "fake-route",
        document.title,
        window.location.href
      );
      window.addEventListener("popstate", cancelPopState);
      setBackKeyEvent(true);
    }
  }, [modifyForm.current, backKeyEvent, cancelPopState]);

  useEffect(() => {
    return () => {
      if (window.history.state === "fake-route") {
        window.history.back();
      } else {
        window.removeEventListener("popstate", cancelPopState);
      }
    };
  }, []);

  useEffect(() => {
    if (formObject) {
      if (Object.keys(formObject).length !== 0) {
        if (userType == USER_TYPE.USER_TYPE_GENERAL && (formType === FORM_TYPE.NEW_OBJECT || formType === FORM_TYPE.CREATE)) {
          alertInfo("", t("txt-permission-denied"));
          navigate(
            `/object-list/schedule/${publicType ? "public" : "private"}/`
          );
          return;
        }
      }
      if (
        (formObject.formType === FORM_TYPE.EDIT ||
          formObject.formType === FORM_TYPE.NEW_VERSION) &&
        formObject.editable === 1 &&
        (!formObject.hasOwnProperty("isLocked") || formObject.isLocked === 0)
      ) {
        const intervalId = setInterval(() => {
          if (!document.hidden) {
            objectLockService.heartbeat({
              objectId,
              objectType: OBJECT_CATEGORY.SCHEDULE,
            });
          }
        }, heartbeatIntervalTime * 1000);
        return () => {
          clearInterval(intervalId);
        };
      }
    }
  }, [formObject]);

  useEffect(() => {
    if (formObject) {
      if (formObject.isLocked === 1 || formObject.editable === 0) {
        setEditable(0);
        setIsLocked(1);
        dispatch(setObjectFormEditable(false));
      } else {
        setEditable(1);
        dispatch(setObjectFormEditable(true));
        let object = {
          objectId: formObject.id,
          date: formObject.updateDate,
          category: "schedule",
        };
        dispatch(lockObject(object));
      }
    }
  }, [formObject]);

  useEffect(() => {
    if (disabledAlert.current < 1) {
      disabledAlert.current++;
      return;
    }
    if (responseData) {
      switch (responseData.type) {
        case SERVICE_RESPONSE.OK:
          alertSuccess(
            t("title-success"),
            `${t("label-success")} : ${scheduleForm.getFieldValue("id")}`
          );
          navigateToVersionHandler();
          break;
        case SERVICE_RESPONSE.INCOMEPLETE:
          if (
            responseData.detail.message === SERVICE_RESPONSE.NO_LOCK_SESSION
          ) {
            alertError(t("title-error"), t("err-no-lock-exist"));
            navigateToVersionHandler(objectId);
          } else {
            alertError(
              t("title-error"),
              `${responseData.detail["message-objectid"]
                ? t(responseData.detail["message-objectid"]) + " :"
                : ""
              }  ${t(
                responseData.detail["message-detail"]
                  ? t(responseData.detail["message-detail"])
                  : t("err-msg-fail")
              )}`
            );
            navigate(
              `/object-list/schedule/${publicType ? "public" : "private"}/`
            );
          }
          break;
        case SERVICE_RESPONSE.RECORD_EXIST:
          alertError(t("title-error"), t("txt-sch-val-id"));
          break;
        default:
          alertError(
            t("title-error"),
            `${responseData.detail["message-objectid"]
              ? t(responseData.detail["message-objectid"]) + " :"
              : ""
            }  ${t(
              responseData.detail["message-detail"]
                ? t(responseData.detail["message-detail"])
                : t("err-msg-fail")
            )}`
          );
          navigate(
            `/object-list/schedule/${publicType ? "public" : "private"}/`
          );
      }
    }
  }, [responseData]);

  const navigateToVersionHandler = () => {
    navigate(
      `/object-version/schedule/${scheduleForm.getFieldValue("isPublic") ? "public" : "private"
      }/${scheduleForm.getFieldValue("id")}`
    );
  };

  const handleDelete = () => {
    var data = calendarObjLists;
    selectedRowKeys.map((key) => {
      data = data.filter((item) => item.key !== key);
    });
    modifyForm.current = true;
    dispatch(setCalendarObjectLists(data));
    setSelectedRowKeys([]);
  };

  const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };

  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
      if (editing) {
        inputRef.current.focus();
      }
    }, [editing]);

    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    };

    const save = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({ ...record, ...values });
      } catch (errInfo) {
        console.log("Save failed:", errInfo);
      }
    };

    let childNode = children;

    if (editable) {
      childNode = editing ? (
        <Form.Item
          name={dataIndex}
          rules={[
            {
              required: true,
              message: t("err-field-required", { field: t("lab-boot-time") }),
            },
            // ({ getFieldValue }) => ({
            //   validator(_, value) {
            //     var regex = new RegExp(/^(\d{1,2}):([0-5][0-9])$/);
            //     if (regex.test(value)) {
            //       //accept value
            //       return Promise.resolve();
            //     }

            //     return Promise.reject(new Error("hellowolrd"));
            //   },
            // }),
            {
              pattern: /^(\d{2}):[0-5][0-9]$/,
              message: t("err-msg-schedule-invalid-time")
            }
          ]}
        >
          <Input
            disabled={editable === 0 || isLocked === 1}
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
            maxLength={5}
          />
        </Form.Item>
      ) : (
        <div
          className="editable-cell-value-wrap"
          style={{
            paddingRight: 24,
          }}
          onClick={toggleEdit}
        >
          {children}
        </div>
      );
    }

    return <td {...restProps}>{childNode}</td>;
  };
  const handleAllDelete = () => {
    if (selectedRowKeys.length > 0) {
      confirmDialog(
        t("title-confirm-delete"),
        t("warn-msg-del"),
        handleDelete,
        handleCancel
      );
    }
  };

  const defaultColumns = [
    {
      title: t("col-obj-id"),
      dataIndex: "id",
      width: "40%",
    },
    {
      title: t("col-obj-name"),
      dataIndex: "name",
      width: "40%",
    },
    {
      title: t("lab-boot-time"),
      dataIndex: "boottime",
      width: "20%",
      editable: true,
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleSave = (row) => {
    const newData = [...calendarObjLists];
    const index = newData.findIndex((item) => row.key === item.key);

    const item = newData[index];

    let [handleHrs, handleMins] = row.boottime.split(":");
    if (parseInt(handleHrs).toString().length < 2) {
      handleHrs = "0" + parseInt(handleHrs);
    }
    if (parseInt(handleMins).toString().length < 2) {
      handleMins = "0" + parseInt(handleMins);
    }
    row.boottime = handleHrs + ":" + handleMins;

    //if duplication id and boottime modify record will not save
    if (!isBoottimeExists(row, newData)) {
      //add modified record in calendar list
      newData.splice(index, 1, { ...item, ...row });
      dispatch(setCalendarObjectLists(newData));
    }
  };

  function isBoottimeExists(row, objLists) {
    var duplicate = false;
    if (objLists) {
      objLists.forEach((obj) => {
        if (obj["boottime"] === row.boottime && obj["id"] === row.id) {
          duplicate = true;
        }
      });
    }
    return duplicate;
  }

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        width: col.width,
        handleSave,
      }),
    };
  });

  const navigate = useNavigate();
  let { objectId, date } = useParams();
  const [scheduleForm] = Form.useForm();
  const [calForm] = Form.useForm();

  const isLoading = useSelector((state) => state["schedule"].loading);
  //id list for tree
  const objectIdList = useSelector((state) => state["schedule"].objectIdList);

  const jobnetObjLists =
    useSelector((state) => state["schedule"].jobnetObjLists) ?? [];

  const [objType, setObjType] = useState({});
  const [isCalendar, setIsCalendar] = useState(true);

  const bindCalFilComponent = () => {
    if (objType["type"] === "calendar") {
      return (
        <CalendarForm
          objectId={objType["title"] ?? ""}
          date={objType["update_date"] ?? ""}
          objectType={FORM_TYPE.SCHEDULE}
          formType={FORM_TYPE.SCHEDULE}
        />
      );
    } else if (objType["type"] === "filter") {
      return (
        <FilterFormComponent
          objectId={objType["title"] ?? ""}
          date={objType["update_date"] ?? ""}
          objectType={FORM_TYPE.SCHEDULE}
          formType={FORM_TYPE.SCHEDULE}
        />
      );
    }
    return null;
  };

  const [jobnetSelectedRowKeys, setJobnetSelectedRowKeys] = useState([]);

  const onJobnetSelectChange = (newJobnetSelectedRowKeys) => {
    setJobnetSelectedRowKeys(newJobnetSelectedRowKeys);
  };
  const jobnetRowSelection = {
    jobnetSelectedRowKeys,
    onChange: onJobnetSelectChange,
  };

  const handleJobnetDelete = () => {
    var data = [...jobnetObjLists];
    jobnetSelectedRowKeys.map((key) => {
      data = data.filter((item) => item.key !== key);
    });
    setJobnetSelectedRowKeys([]);
    modifyForm.current = true;
    dispatch(setJobnetObjectLists(data));
  };
  const handleCancel = () => {
    return false;
  };

  const handleJobnetAllDelete = () => {
    if (jobnetSelectedRowKeys.length > 0) {
      confirmDialog(
        t("title-confirm-delete"),
        t("warn-msg-del"),
        handleJobnetDelete,
        handleCancel
      );
    }
  };

  function getIdLists(idLists, id, pub, type) {
    var dataList = [];
    var obj = {};
    if (idLists) {
      for (var i = 0; i < idLists.length; i++) {
        obj = {
          title: idLists[i][id],
          value: idLists[i][id] + idLists[i]["updateDate"],
          key: idLists[i][id],
          update_date: idLists[i]["updateDate"],
          isPublic: pub,
          type: type,
        };
        dataList.push(obj);
      }
    }
    return dataList;
  }

  useEffect(() => {
    const unloadCallback = async (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    if (
      modifyForm.current ||
      formType === FORM_TYPE.NEW_OBJECT ||
      formType === FORM_TYPE.CREATE
    ) {
      window.addEventListener("beforeunload", unloadCallback);
      return () => window.removeEventListener("beforeunload", unloadCallback);
    }
  }, [modifyForm.current, formObject]);

  usePrompt(
    t("warn-mess-redisplay"),
    isSave === false &&
    ((formType === FORM_TYPE.NEW_OBJECT || formType === FORM_TYPE.CREATE) && userType != USER_TYPE.USER_TYPE_GENERAL),
    isBlocked
  );

  function getJobIdLists(idLists, pub, type) {
    var dataList = [];
    var obj = {};
    if (idLists) {
      for (var i = 0; i < idLists.length; i++) {
        obj = {
          title: idLists[i]["jobnetId"],
          value: idLists[i]["jobnetId"],
          key: idLists[i]["jobnetId"],
          update_date: idLists[i]["updateDate"],
          isPublic: pub,
          type: type,
        };
        dataList.push(obj);
      }
    }
    return dataList;
  }

  if (objectIdList && objectIdList.length > 2) {
    try {
      var pubCalIdLst = getIdLists(
        objectIdList[0],
        "calendarId",
        "public",
        "calendar"
      );
      var priCalIdLst = getIdLists(
        objectIdList[1],
        "calendarId",
        "private",
        "calendar"
      );
      var pubFilIdLst = getIdLists(
        objectIdList[2],
        "filterId",
        "public",
        "filter"
      );
      var priFilIdLst = getIdLists(
        objectIdList[3],
        "filterId",
        "private",
        "filter"
      );
    } catch (error) {
      console.log(error);
    }
  } else if (objectIdList) {
    try {
      var pubJobnetIdLst = getJobIdLists(
        objectIdList[0],

        "public",
        "jobnet"
      );
      var priJobnetIdLst = getJobIdLists(
        objectIdList[1],

        "private",
        "jobnet"
      );
    } catch (error) {
      console.log(error);
    }
  }
  const treeData =
    objectIdList.length > 2
      ? [
        {
          title: t("sel-pub-cal"),
          value: "0-0",
          key: "0-0",
          selectable: false,
          children: pubCalIdLst,
        },
        {
          title: t("sel-prv-cal"),
          value: "0-1",
          key: "0-1",
          selectable: false,
          children: priCalIdLst,
        },
        {
          title: t("sel-pub-flt"),
          value: "0-1-1",
          key: "0-1-1",
          selectable: false,
          children: pubFilIdLst,
        },
        {
          title: t("sel-prv-flt"),
          value: "0-1-2",
          key: "0-1-2",
          selectable: false,
          children: priFilIdLst,
        },
      ]
      : [
        {
          title: t("sel-pub-job"),
          value: "0-0",
          key: "0-0",
          selectable: false,
          children: pubJobnetIdLst,
        },
        {
          title: t("sel-prv-job"),
          value: "0-1",
          key: "0-1",
          selectable: false,
          children: priJobnetIdLst,
        },
      ];

  const valid = false;

  const onSelect = (value, obj) => {
    setObjType(obj);
  };

  const columns1 = [
    {
      title: t("label-jobnet-id"),
      dataIndex: "jobnetId",
    },

    {
      title: t("label-jobnet-name"),
      dataIndex: "jobnetName",
    },
  ];
  const handleFormKeydown = (e) => {
    if (!isDialog.current) {
      if (e.keyCode === 13) {
        finishAction();
      }
    }
  };
  // cleanup data.
  useEffect(() => {
    window.addEventListener("keydown", handleFormKeydown);
    return () => {
      let formObject = store.getState().schedule.formData;
      let isEditable = store.getState().objectList.isObjectFormEditable;
      objectLockObject.current.objectId = formObject.id;
      objectLockObject.current.objectType = "SCHEDULE";
      //delete object lock only if updateable.
      if (isEditable) {
        objectLockService.deleteLock([objectLockObject.current]);
        dispatch(setunLock());
      }
      // dispatch(cleanupCalendarForm());
      // window.removeEventListener("keydown", handleFormKeydown);
      // //unlock object for new version and edit

      // if (formType === FORM_TYPE.EDIT || formType === FORM_TYPE.NEW_VERSION) {
      //   if (editable) {
      //     var data = [{ objectId: objectId, objectType: "SCHEDULE" }];
      //     dispatch(unlock(data));
      //     dispatch(setunLock());
      //   }
      // }
      dispatch(cleanupCalendarForm());
      dispatch(cleanupFilterForm());
      dispatch(setScheduleFormData([]));
      window.removeEventListener("keydown", handleFormKeydown);
    };
  }, []);

  const [isReloaded, reloaded] = useState(false);

  useEffect(() => {
    //unlock on reload
    var localStoredValues = JSON.parse(
      sessionStorage.getItem("formIsRefreshed") || "[]"
    );
    if ("isLocked" in localStoredValues && localStoredValues.isLocked == 0) {
      let lockedObject = {
        objectId: localStoredValues.objectId,
        objectType: localStoredValues.objectType,
      };
      objectLockService.deleteLockAsync([lockedObject]).then((response) => {
        reloaded(true);
      });
      dispatch(setunLock());
    } else {
      reloaded(true);
    }
    sessionStorage.removeItem("formIsRefreshed");
    //
  }, []);
  useEffect(() => {
    if (isReloaded == true) {
      if (formType === FORM_TYPE.CREATE) {
        let obj = {
          type: formType,
          isPublic: publicType,
        };
        dispatch(initSchedule(obj));
        // } else if (formType === FORM_TYPE.NEW_OBJECT) {
        //   let obj = {
        //     objectId: objectId,
        //     date: date,
        //     type: formType,
        //     isPublic: publicType,
        //   };
        //   dispatch(initSchedule(obj));
      } else {
        let obj = {
          objectId: objectId,
          date: date,
          formType: formType,
          isPublic: publicType,
        };
        dispatch(initScheduleEdit(obj));
      }
    }
  }, [isReloaded]);

  const [show, setShow] = useState(true);

  function save() {
    //remove window prompt
    setIsBlocked(false);
    setIsSave(true);
    var data = {
      scheduleId: scheduleForm.getFieldValue("id"),
      scheduleName: scheduleForm.getFieldValue("name"),
      publicFlag: scheduleForm.getFieldValue("isPublic") ? 1 : 0,
      desc: scheduleForm.getFieldValue("description"),
      updateDate: scheduleForm.getFieldValue("updateDate"),
      urlDate: date,
      formType: formType,
      userName: scheduleForm.getFieldValue("userName"),
      calendarInfoArr: calendarObjLists,
      jobnetInfoArr: jobnetObjLists,
    };

    // function handleOk() {
    //   dispatch(setCalendarObjectLists([]));
    //   dispatch(setJobnetObjectLists([]));
    //   navigate(
    //     `/object-version/schedule/${
    //       data["publicFlag"] ? "public" : "private"
    //     }/${data["scheduleId"]}`
    //   );
    // }

    // ScheduleFormService.saveScheduleObj(data)
    //   .then((result) => {
    //     if (result === "Success") {
    //       alertSuccess(t("title-success"), t("label-success"), handleOk);
    //     } else if (result === "Record Exist") {
    //       alertError(t("title-error"), t("txt-sch-val-id"));
    //     }
    //   })
    //   .catch((err) => {
    //     console.log("Error:", err);
    //     throw err;
    //   });
    dispatch(saveScheduleObj(data));
    isDialog.current = false;
  }

  function cancel() {
    isDialog.current = false;
    return false;
  }

  function finishAction() {
    setIsBlocked(false);
    scheduleForm.submit();
  }

  const saveButtons = [
    {
      label: t("btn-save"),
      disabled: editable === 0 || isLocked === 1,
      icon: <SaveFilled />,
      clickAction: finishAction,
      // click: () => {
      //   var id = scheduleForm.getFieldValue("id");
      //   var name = scheduleForm.getFieldValue("name");
      //   if (!id) {
      //     alertError(t("title-error"), t("txt-schd-id-rq"));
      //   } else if (!name) {
      //     alertError(t("title-error"), t("txt-schd-name-rq"));
      //   } else {
      //     confirmDialog(
      //       t("title-msg-confirm"),
      //       t("txt-data-fil"),
      //       save,
      //       cancel
      //     );
      //   }
      // },
    },
    {
      label: t("btn-close"),
      icon: <CloseCircleFilled />,
      disabled: false,
      click: () => {
        if (
          (!modifyForm.current && formType === FORM_TYPE.EDIT) ||
          (!modifyForm.current && formType === FORM_TYPE.NEW_VERSION)
        ) {
          cancelConfirm();
        } else {
          setIsBlocked(false);
          setIsSave(true);
          confirmDialog(
            t("title-msg-confirm"),
            t("warn-mess-redisplay"),
            cancelConfirm,
            () => {
              setIsBlocked(true);
              setIsSave(false);
              return false;
            }
          );
        }
      },
    },
  ];

  function cancelConfirm() {
    // unlock object for new version and edit
    // if (formType === FORM_TYPE.EDIT || formType === FORM_TYPE.NEW_VERSION) {
    //   var data = { objectId: objectId, objectType: "SCHEDULE" };
    //   objectLockService.deleteLock(data);
    // }
    dispatch(setCalendarObjectLists([]));
    dispatch(setJobnetObjectLists([]));

    if (objectId) {
      if (objectId.length > 0) {
        navigate(
          `/object-version/schedule/${publicType ? "public" : "private"
          }/${objectId}`
        );
      }
    } else {
      navigate(`/object-list/schedule/${publicType ? "public" : "private"}/`);
    }
  }
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const addButtons = [
    {
      label: t("btn-save"),
      icon: <SaveFilled />,

      click: async () => {
        if (objType["title"]) {
          var type = objType["type"];

          if (type === "jobnet") {
            var jobData = {
              optid: objType["title"],
              optDate: objType["update_date"],
              type: objType["type"],
              objLists: jobnetObjLists,
            };
            dispatch(getJobnetObj(jobData));
          } else {
            var regex = new RegExp("[0-9]{1,2}:[0-5]{1}[0-9]{0,1}");
            var intervalRegex = new RegExp("[1-9]{1,3}");

            if (document.getElementById("time").checked) {
              var timeValue = document.getElementById("timevalue").value;

              if (timeValue === "" || timeValue === null) {
                alertError(t("title-error"), t("txt-input-boottime"));
                return;
              } else if (!regex.test(timeValue)) {
                alertError(t("title-error"), t("txt-input-bt-right"));
                return;
              }
              //check length and cast 0

              let [endHrs, endMins] = timeValue.split(":");
              if (parseInt(endHrs).toString().length < 2) {
                endHrs = "0" + parseInt(endHrs);
              }
              if (parseInt(endMins).toString().length < 2) {
                endMins = "0" + parseInt(endMins);
              }
              timeValue = endHrs + ":" + endMins;

              var objData = {
                optid: objType["title"],
                optDate: objType["update_date"],
                type: objType["type"],
                boottime: timeValue,
                time: "time",
                objLists: calendarObjLists,
              };
              dispatch(getCalFilObj(objData));
            } else {
              var startTime = document.getElementById("starttime").value;
              var endTime = document.getElementById("endtime").value;
              var interval = document.getElementById("interval").value;
              if (startTime === "" || startTime === null) {
                alertError(t("title-error"), t("txt-input-strtime"));
                return;
              } else if (!regex.test(startTime)) {
                alertError(t("title-error"), t("txt-input-st-right"));
                return;
              } else if (endTime === "" || endTime === null) {
                alertError(t("title-error"), t("txt-input-endtime"));
                return;
              } else if (!regex.test(endTime)) {
                alertError(t("title-error"), t("txt-input-end-right"));
                return;
              } else if (interval === "" || interval === null) {
                alertError(t("title-error"), t("txt-input-minute"));
                return;
              } else if (!intervalRegex.test(interval)) {
                alertError(t("title-error"), t("txt-min-intv"));
                return;
              }

              let [startHrs, startMins] = startTime.split(":");
              let [endHrs, endMins] = endTime.split(":");

              if (parseInt(startHrs).toString().length < 2) {
                startHrs = "0" + parseInt(startHrs);
              }
              if (parseInt(startMins).toString().length < 2) {
                startMins = "0" + parseInt(startMins);
              }
              startTime = startHrs + ":" + startMins;

              if (parseInt(endHrs).toString().length < 2) {
                endHrs = "0" + parseInt(endHrs);
              }
              if (parseInt(endMins).toString().length < 2) {
                endMins = "0" + parseInt(endMins);
              }
              endTime = endHrs + ":" + endMins;

              var startDate = new Date(null, null, null, startHrs, startMins);
              var endDate = new Date(null, null, null, endHrs, endMins);
              var totalMiliSecInOneDay = 86400000;
              var milliDiff = endDate.valueOf() - startDate.valueOf();
              // var millStart =
              //   parseInt(startHrs) * 3600000 + parseInt(startMins) * 60000;
              // var milliEnd =
              //   parseInt(endHrs) * 3600000 + parseInt(endMins) * 60000;
              // if (
              //   millStart >= totalMiliSecInOneDay ||
              //   milliEnd >= totalMiliSecInOneDay
              // ) {
              //   alertError(t("title-error"), t("txt-str-end-intv"));
              //   return;
              // } else
              if (startHrs > 23) {
                alertError(t("title-error"), t("err-msg-schedule-start-date"))
                return;
              }
              if (!isNaN(milliDiff) && milliDiff > totalMiliSecInOneDay) {
                alertError(t("title-error"), t("txt-str-end-intv"));
                return;
              } else if (!isNaN(milliDiff) && milliDiff <= 0) {
                alertError(t("title-error"), t("txt-str-small-end"));
                return;
              } else if (parseInt(interval) > 720) {
                alertError(t("title-error"), t("txt-min-intv"));
                return;
              }

              var obj = {
                optid: objType["title"],
                optDate: objType["update_date"],
                type: objType["type"],
                startTime: startTime,
                endTime: endTime,
                interval: parseInt(interval),
                time: "cycle",
                objLists: calendarObjLists,
              };
              dispatch(getCalFilObj(obj));
            }

            //null in timevalue
          }
          setShow(true);
          setObjType({});
        } else {
          alertError(t("title-error"), t("err-obj-chose"));
        }
        calForm.resetFields();
      },
    },
    {
      label: t("btn-close"),
      icon: <CloseCircleFilled />,
      click: () => {
        setShow(true);
        setObjType({});
        calForm.resetFields();
      },
    },
  ];

  const onFormFinishAction = (name, { values, forms }) => {
    if (name === "schedule-header-form") {
      isDialog.current = true;
      confirmDialog(t("title-msg-confirm"), t("txt-data-fil"), save, cancel);
    }
  };

  return (
    <Form.Provider
      onFormFinish={(name, { values, forms }) =>
        onFormFinishAction(name, { values, forms })
      }
      onFormChange={() => {
        modifyForm.current = true;
        // if (!isBlocked) {
        //   setIsBlocked(true);
        // }
      }}
    >
      <Spin size="large" spinning={isLoading}>
        <Form
          id="schedule-form"
          form={scheduleForm}
          onFinishFailed={onFinishFailed}
        >
          <Layout>
            <Layout className="object-info-layout">
              <FormObject
                formId={OBJECT_CATEGORY.SCHEDULE}
                objectSlice="schedule"
                publicType={publicType ? "public" : "private"}
              />
            </Layout>

            {show && (
              <Layout id="schedule_list">
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                  }}
                >
                  <div style={{ width: "50%" }}>
                    <Table
                      id="boottime_table"
                      components={components}
                      rowClassName={() => "editable-row"}
                      bordered
                      rowSelection={rowSelection}
                      dataSource={calendarObjLists}
                      columns={columns}
                      size="medium"
                      pagination={false}
                      title={() => t("lab-boot-time") + " :"}
                      scroll={{ y: 450 }}
                    />

                    <div style={{ marginTop: "10px" }}>
                      <Button
                        type="primary"
                        className="ant-btn"
                        disabled={editable === 0}
                        onClick={() => {
                          handleAllDelete();
                        }}
                      >
                        {t("btn-delete")}
                      </Button>
                      <Button
                        type="primary"
                        className="ant-btn"
                        disabled={editable === 0}
                        onClick={() => {
                          dispatch(setBoottimeFlag(true));
                          //bind calendar id to tree node
                          dispatch(getCalendarIdList());
                          setShow(false);
                          setIsCalendar(true);
                        }}
                      >
                        {t("btn-add")}
                      </Button>
                    </div>
                  </div>
                  <div style={{ width: "50%" }}>
                    <Table
                      id="jobnet_table"
                      columns={columns1}
                      dataSource={jobnetObjLists}
                      rowSelection={jobnetRowSelection}
                      size="medium"
                      bordered
                      pagination={false}
                      className="ant-table-body"
                      title={() => t("lab-jobnet") + " :"}
                      scroll={{ y: 450 }}
                    />

                    <div style={{ marginTop: "10px" }}>
                      <Button
                        type="primary"
                        onClick={handleJobnetAllDelete}
                        disabled={editable === 0}
                      >
                        {t("btn-delete")}
                      </Button>
                      <Button
                        type="primary"
                        disabled={editable === 0}
                        onClick={() => {
                          dispatch(setBoottimeFlag(false));
                          setShow(false);
                          setIsCalendar(false);
                          dispatch(getJobnetIdList());
                          //bind add  jobnet to tree node
                        }}
                      >
                        {t("btn-add")}
                      </Button>
                    </div>
                  </div>
                </div>
                <FloatingButtons buttons={saveButtons} />
              </Layout>
            )}
            {!show && (
              <Layout>
                <Form id="cal_form" form={calForm}>
                  <Row
                    className="row"
                    gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                    style={{ paddingLeft: "20px" }}
                  >
                    <Col xs={24} sm={24} md={16} lg={12} xl={10}>
                      <Form.Item
                        labelAlign="left"
                        label={isCalendar ? t("lab-cal") : t("lab-job")}
                        name="object_type"
                        rules={[
                          {
                            required: true,
                            message: t("err-obj-chose"),
                          },
                        ]}
                      >
                        <TreeSelect
                          treeLine={
                            true && {
                              valid,
                            }
                          }
                          listHeight={500}
                          value={objType["value"]}
                          showSearch
                          treeData={treeData}
                          placeholder={
                            isCalendar
                              ? t("lab-calendar-type")
                              : t("lab-jobnet-type")
                          }
                          onSelect={onSelect}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {isCalendar && bindCalFilComponent()}
                  {!isCalendar && objType["type"] === "jobnet" && (
                    <JobnetForm
                      formType={FORM_TYPE.SCHEDULE}
                      publicType={objType["isPublic"] === "public"}
                      objectId={objType["title"] ?? ""}
                      date={objType["update_date"] ?? ""}
                    />
                  )}

                  <FloatingButtons buttons={addButtons} />
                </Form>
              </Layout>
            )}
          </Layout>
        </Form>
      </Spin>
    </Form.Provider>
  );
};

export default ScheduleForm;

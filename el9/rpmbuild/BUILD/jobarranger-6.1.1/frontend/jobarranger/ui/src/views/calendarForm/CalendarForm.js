import React, { useEffect, useRef, useState, useCallback } from "react";
import CalendarFormComponent from "../../components/calendarForm/CalendarForm";
import Layout from "antd/lib/layout/layout";
import {
  confirmDialog,
  alertSuccess,
  alertError,
  alertInfo,
} from "../../components/dialogs/CommonDialog";
import {
  SaveFilled,
  CloseCircleFilled,
  CarryOutOutlined,
  UploadOutlined,
} from "@ant-design/icons/";
import FloatingButtons from "../../components/button/floatingButtons/FloatingButtons";
import { t } from "i18next";
import { Form, Spin } from "antd";
import { useParams, Prompt, useLocation, useHistory } from "react-router-dom";
import store from "../../store";
import { createCalendarFormObjectRequest } from "../../factory/FormObjectFactory";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createCalendarObject,
  setInitRegistShow,
  setFileReadShow,
  cleanupCalendarForm,
  setInitRegistData,
  resetCalendarDates,
} from "../../store/CalendarSlice";
import objectLockService from "../../services/objectLockService";
import CalendarInitRegistDialog from "../../components/dialogs/calendarInitRegistDialog/CalendarInitRegistDialog";
import CalendarFileReadDialog from "../../components/dialogs/calendarfileReadDialog/CalendarFileReadDialog";
import { setunLock } from "../../store/ObjectListSlice";
import { FORM_TYPE, OBJECT_CATEGORY, SERVICE_RESPONSE, USER_TYPE } from "../../constants";

import usePrompt from "../../components/dialogs/usePrompt";

const CalendarForm = ({ formType, publicType }) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const [backKeyEvent, setBackKeyEvent] = useState(false);
  const dispatch = useDispatch();
  let { objectId, date } = useParams();
  const navigate = useNavigate();
  const [mainForm] = Form.useForm();
  const isDialog = useRef(false);
  const disabledAlert = useRef(0);
  const objectLockObject = useRef({
    objectId: "",
    objectType: 0,
  });
  const modifyForm = useRef(false);
  const responseData = useSelector((state) => state["calendar"].responseData);
  const isLoading = useSelector((state) => state["calendar"].isLoading);
  const calendarInfo = useSelector((state) => state["calendar"].data);
  const calendarDateChanged = useSelector(
    (state) => state["calendar"].isCalendarChanged
  );
  const userType = useSelector((state) => state["user"].userInfo);

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
      setIsBlocked(calendarDateChanged);
    }
  }, [calendarDateChanged]);

  useEffect(() => {
    console.log("mdycur : ",modifyForm.current);
    if (
      (calendarDateChanged ||
        modifyForm.current ||
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
  }, [calendarDateChanged, modifyForm.current, backKeyEvent, cancelPopState]);

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
    const unloadCallback = async (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    if (
      calendarDateChanged ||
      modifyForm.current ||
      formType === FORM_TYPE.NEW_OBJECT ||
      formType === FORM_TYPE.CREATE
    ) {
      window.addEventListener("beforeunload", unloadCallback);
      return () => window.removeEventListener("beforeunload", unloadCallback);
    }
  }, [calendarDateChanged, modifyForm.current, calendarInfo]);

  usePrompt(
    t("warn-mess-redisplay"),
    isSave === false &&
    ((formType === FORM_TYPE.NEW_OBJECT || formType === FORM_TYPE.CREATE) && userType.userType != USER_TYPE.USER_TYPE_GENERAL),
    isBlocked
  );

  const heartbeatIntervalTime =
    useSelector((state) => state.user.userInfo.heartbeatIntervalTime) || 30;

  const isFormEditable = useSelector(
    (state) => state["objectList"].isObjectFormEditable
  );

  useEffect(() => {
    //listen to enter event.
    if (calendarInfo) {
      if (Object.keys(calendarInfo).length !== 0) {
        if (userType.userType == USER_TYPE.USER_TYPE_GENERAL && (formType === FORM_TYPE.NEW_OBJECT || formType === FORM_TYPE.CREATE)) {
          alertInfo("", t("txt-permission-denied"));
          navigate(
            `/object-list/calendar/${publicType ? "public" : "private"}/`
          );
          return;
        }
      }
      if (
        (calendarInfo.formType === FORM_TYPE.EDIT ||
          calendarInfo.formType === FORM_TYPE.NEW_VERSION) &&
        calendarInfo.editable === 1 &&
        (!calendarInfo.hasOwnProperty("isLocked") ||
          calendarInfo.isLocked === 0)
      ) {
        const intervalId = setInterval(() => {
          if (!document.hidden) {
            objectLockService.heartbeat({
              objectId,
              objectType: OBJECT_CATEGORY.CALENDAR,
            });
          }
        }, heartbeatIntervalTime * 1000);
        return () => {
          clearInterval(intervalId);
        };
      }
    }
  }, [calendarInfo]);
  const navigateToVersionHandler = () => {
    navigate(
      `/object-version/calendar/${mainForm.getFieldValue("isPublic") ? "public" : "private"
      }/${mainForm.getFieldValue("id")}`
    );
  };

  const cancelConfirm = () => {
    if (objectId) {
      if (objectId.length > 0) {
        // if (!check) {
        navigate(
          `/object-version/calendar/${mainForm.getFieldValue("isPublic") ? "public" : "private"
          }/${objectId}`
        );
        // }
      }
    } else {
      navigate(
        `/object-list/calendar/${mainForm.getFieldValue("isPublic") ? "public" : "private"
        }/`
      );
    }
  };
  const cancelFloatBtn = () => {
    const calendarChanged = store.getState().calendar.isCalendarChanged; //for double click load action
    //let isYearCalendarChangted = store.getState("calendarSlice").isYearCalendarChanged;
    if (
      (!calendarChanged &&
        !modifyForm.current &&
        formType === FORM_TYPE.EDIT) ||
      (!calendarChanged &&
        !modifyForm.current &&
        formType === FORM_TYPE.NEW_VERSION)
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
  };
  const onFormFinishAction = (name, { values, forms }) => {
    isDialog.current = true;
    confirmDialog(
      t("title-msg-confirm"),
      t("txt-data-fil"),
      createCalendar,
      cancel
    );
  };
  const createCalendar = () => {
    //remove window prompt
    setIsBlocked(false);
    setIsSave(true);
    var uniqueArray = [];
    var datesFromForm = mainForm.getFieldValue("dates");
    for (let i = 0; i < datesFromForm.length; i++) {
      if (uniqueArray.indexOf(datesFromForm[i]) === -1) {
        uniqueArray.push(datesFromForm[i]);
      }
    }

    let formObject = store.getState().calendar.formData;
    let calendarUpdateRequest = createCalendarFormObjectRequest(
      formObject.updateDate,
      formObject.id,
      mainForm.getFieldValue("id"),
      mainForm.getFieldValue("name"),
      formObject.userName,
      mainForm.getFieldValue("isPublic") ? 1 : 0,
      moment().format("YYYYMMDDHHmmss"),
      mainForm.getFieldValue("description"),
      formType,
      uniqueArray,
      formObject.createdDate,
      formObject.validFlag,
      formObject.lastday,
      formObject.editable,
      formObject.authority
    );
    dispatch(createCalendarObject(calendarUpdateRequest));
    isDialog.current = false;
  };

  const submitBtnAction = () => {
    mainForm.submit();
  };
  const initRegistBtnAction = () => {
    dispatch(resetCalendarDates());
    var mainFormDates = [];
    mainFormDates = mainForm.getFieldValue("dates");
    mainFormDates.forEach((element) => {
      dispatch(setInitRegistData({ dates: element }));
    });
    dispatch(setInitRegistShow(true));
  };

  const fileReadbtnAction = () => {
    dispatch(resetCalendarDates());
    var mainFormDates = [];
    mainFormDates = mainForm.getFieldValue("dates");
    mainFormDates.forEach((element) => {
      dispatch(setInitRegistData({ dates: element }));
    });
    dispatch(setFileReadShow(true));
  };
  const cancel = () => {
    isDialog.current = false;
  };
  const buttons = [
    {
      label: t("btn-init-reg"),
      icon: <CarryOutOutlined />,
      clickAction: initRegistBtnAction,
      disabled: !isFormEditable,
    },
    {
      label: t("btn-file-read"),
      icon: <UploadOutlined />,
      clickAction: fileReadbtnAction,
      disabled: !isFormEditable,
    },
    {
      label: t("btn-save"),
      icon: <SaveFilled />,
      clickAction: submitBtnAction,
      disabled: !isFormEditable,
    },
    {
      label: t("btn-close"),
      icon: <CloseCircleFilled />,
      clickAction: cancelFloatBtn,
      disabled: false,
    },
  ];

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
            `${t("label-success")} : ${mainForm.getFieldValue("id")}`
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
              `/object-list/calendar/${publicType ? "public" : "private"}/`
            );
          }

          break;
        case SERVICE_RESPONSE.RECORD_EXIST:
          alertError(t("title-error"), t("txt-cal-val-id"));
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
            `/object-list/calendar/${publicType ? "public" : "private"}/`
          );
      }
    }
  }, [responseData]);

  // cleanup data.
  useEffect(() => {
    window.addEventListener("keydown", handleFormKeydown);
    return () => {
      let formObject = store.getState().calendar.formData;
      let isEditable = store.getState().objectList.isObjectFormEditable;
      objectLockObject.current.objectId = formObject.id;
      objectLockObject.current.objectType = "CALENDAR";
      //delete object lock only if updateable.
      if (isEditable) {
        objectLockService.deleteLock([objectLockObject.current]);
        dispatch(setunLock());
      }
      dispatch(cleanupCalendarForm());
      window.removeEventListener("keydown", handleFormKeydown);
    };
  }, []);
  const handleFormKeydown = (e) => {
    if (!isDialog.current) {
      if (e.keyCode === 13) {
        submitBtnAction();
        isDialog.current = true;
      }
    }
  };
  return (
    <Form.Provider
      onFormFinish={(name, { values, forms }) =>
        onFormFinishAction(name, { values, forms })
      }
      onFormChange={() => {
        modifyForm.current = true;
        if (!isBlocked) {
          setIsBlocked(true);
        }
        //block flag change.
      }}
    >
      {/* <Prompt
        when={checkChanges}
        message={(location) =>
          `Are you sure you want to go to ${location.pathname}`
        }
      /> */}

      <Spin size="large" spinning={isLoading}>
        <Form id="main-form" name="main-form" form={mainForm}>
          <CalendarInitRegistDialog />
          <CalendarFileReadDialog />
          <Layout>
            <CalendarFormComponent
              objectId={objectId}
              date={date}
              objectType="calendar"
              formType={formType}
              publicType={publicType}
            />
          </Layout>
          <FloatingButtons buttons={buttons} />
        </Form>
      </Spin>
    </Form.Provider>
  );
};

export default CalendarForm;

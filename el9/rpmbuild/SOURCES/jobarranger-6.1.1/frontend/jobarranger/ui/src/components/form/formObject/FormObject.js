import React, { useEffect, useState, useCallback } from "react";
import "./FormObject.scss";
import {
  Alert,
  Input,
  InputNumber,
  Checkbox,
  Select,
  Col,
  Row,
  Form,
  Collapse,
} from "antd";
import { useTranslation } from "react-i18next";
import { OBJECT_CATEGORY, REGEX_PATTERM } from "../../../constants";
import { useSelector } from "react-redux";
import { getShiftJISByteLength } from "../../../common/Util";
import moment from "moment";
import { isImpossibleStr } from "../../../views/jobnetForm/Validation";
import store from "../../../store";
import { useNavigate } from "react-router-dom";
const { Panel } = Collapse;

const FormObject = ({ formId, objectSlice, formProperty = null }) => {
  const form = useSelector((state) => {
    if (objectSlice === "jobnetForm") {
      return state.jobnetForm.formObjList[formProperty].formData;
    } else {
      return state[objectSlice].formData;
    }
  });

  const { Option } = Select;
  const { t } = useTranslation();
  const objectForm = Form.useFormInstance();
  const [editable, setEditable] = useState(1);
  const [idEditable, setIdEditable] = useState(1);
  const [isLocked, setLocked] = useState(0);
  const [isAutorized, setAuthorized] = useState(0);
  const [isModified, setIsModified] = useState(0);
  const [backKeyEvent, setBackKeyEvent] = useState(false);
  var pathArray = window.location.pathname.split("/");
  const navigate = useNavigate();

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
    if (isModified && backKeyEvent === false) {
      // Add a fake history event so that the back button does nothing if pressed once
      window.history.pushState(
        "fake-route",
        document.title,
        window.location.href
      );
      window.addEventListener("popstate", cancelPopState);
      setBackKeyEvent(true);
    }
  }, [isModified, backKeyEvent, cancelPopState]);
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
    if (isModified) {
      window.addEventListener("beforeunload", unloadCallback);
      return () => window.removeEventListener("beforeunload", unloadCallback);
    }
  }, [isModified]);

  useEffect(() => {
    if (form && form.hasOwnProperty("id")) {
      let tmp_formId = t(`obj-${formId}`);
      if (!checkedValueChanged()) {
        objectForm.setFieldsValue({
          id: form.id,
          name: form.name,
          isPublic: form.isPublic,
          authority: form.authority,
          updateDate: form.updateDate,
          lastWorkingDay: form.lastWorkingDay,
          userName: form.userName,
          description: form.description ? form.description : "",
        });

        if (formId === OBJECT_CATEGORY.JOBNET) {
          objectForm.setFieldsValue({
            multiple: form.multiple,
            timeoutType: form.timeoutType,
            timeout: form.timeout,
          });
        }
      }
      if (form.isLocked) {
        setLocked(form.isLocked);
      }
      if (form.authority) {
        setAuthorized(form.authority);
      }
      if (
        form.editable === 1 &&
        (!form.hasOwnProperty("isLocked") || form.isLocked === 0)
      ) {
        setEditable(1);
        setIdEditable(form.hasOwnProperty("idEditable") ? form.idEditable : 1);
      } else {
        setEditable(0);
        setIdEditable(0);
      }
    }
    pathArray[3] == 'edit' ? document.getElementById("objectName").focus() : document.getElementById("objectId").focus();

  }, [form]);

  const checkedValueChanged = () => {
    if (objectForm.getFieldsValue().id != undefined) {
      if (objectForm.getFieldsValue().id === form.id) {
        return true;
      }
      if (objectForm.getFieldsValue().name === form.name) {
        return true;
      }
      if (objectForm.getFieldsValue().isPublic === form.isPublic) {
        return true;
      }
      if (objectForm.getFieldsValue().description === form.description) {
        return true;
      }
    }
    return false;
  };

  const multipleInput = (formId) => {

    return (
      <Col xs={24} sm={24} md={9} lg={10} xl={4}>
        <Form.Item
          labelAlign="left"
          name="multiple"
          labelCol={{ xs: 10, sm: 6, md: 7, lg: 7, xl: 7 }}
          label={t("lab-multiple")}
          initialValue="0"
        >
          <Select disabled={editable === 0}>
            <Option value="0">{t("sel-yes")}</Option>
            <Option value="1">{t("sel-skip")}</Option>
            <Option value="2">{t("sel-waiting")}</Option>
          </Select>
        </Form.Item>
      </Col>
    );
    return null;
  };

  const timoutInput = (formId) => {
    return (
      <>
        <Col style={{ paddingRight: '0px' }}>
          <Form.Item
            labelAlign="left"
            name="timeout"
            label={t("lab-timeout")}
            initialValue={"0"}
            rules={[{ required: true, message: t("err-timeout-msg") }]}
          >
            <InputNumber
              min={0}
              max={99999}
              className="timeout-warn-input"
              disabled={editable === 0}
            />
          </Form.Item>
        </Col>
        <Col style={{ paddingLeft: '0px' }}>
          <Form.Item labelAlign="left" name="timeoutType" initialValue="0">
            <Select style={{ width: 120 }} disabled={editable === 0}>
              <Option value="0">{t("sel-warning")}</Option>
              <Option value="1">{t("sel-jn-stop")}</Option>
            </Select>
          </Form.Item>
        </Col>
      </>
    );
    return null;
  };

  const uneditableWarningMessage = () => {
    let message = "";
    if (editable == 0) {
      if (isAutorized == 0) {
        message = t("err-msg-no-permission_to_edit");
      } else if (isLocked == 1) {
        message = t("alt-msg-lock");
      } else {
        message = t("alert-msg");
      }
      return (
        <Alert
          style={{ marginBottom: "10px" }}
          showIcon={true}
          message={message}
          type="warning"
        />
      );
    }
    return null;
  };

  const unloadCallback = async (event) => {
    let currentForm = {};
    if (objectSlice === "jobnetForm") {
      currentForm =
        store.getState().jobnetForm.formObjList[formProperty].formData;
      //return state.jobnetForm.formObjList[formProperty].formData;
    } else {
      //let tmp_form =
      currentForm = store.getState()[objectSlice].formData;
      //return state[objectSlice].formData;
    }
    let currentObject = {
      objectId: currentForm.id,
      objectType: formId.toUpperCase(),
      isLocked: currentForm.isLocked,
    };
    sessionStorage.setItem("formIsRefreshed", JSON.stringify(currentObject));
  };
  useEffect(() => {
    window.addEventListener("beforeunload", unloadCallback);
    return () => window.removeEventListener("beforeunload", unloadCallback);
  }, []);

  return (
    <Collapse accordion defaultActiveKey={["1"]} expandIconPosition="end">
      <Panel header={t("label-form-title")} key="1">
        <div id="objInfo">
          <Form
            onValuesChange={(changedValues, allValues) => {
              // Handle form values change here
              setIsModified(true);
            }}
            id={`${formId}-header-form`}
            name={`${formId}-header-form`}
            form={objectForm}
          >
            {uneditableWarningMessage()}
            <Row className="row" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col xs={19} sm={20} md={16} lg={10} xl={7}>
                <Form.Item
                  labelAlign="left"
                  labelCol={{ span: 7 }}
                  className="form-item-id"
                  label={t("label-" + formId + "-id") + " : "}
                  name="id"
                  rules={[
                    {
                      required: true,
                      message: t("err-field-required", {
                        field: t("label-" + formId + "-id"),
                      }),
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        var regex = new RegExp(
                          REGEX_PATTERM.MATCH_HANKAKU_HYPHEN_UNDERBAR
                        );
                        if (!regex.test(value)) {
                          return Promise.reject(new Error(t("err-id-format")));
                        }

                        return Promise.resolve();
                      },
                    }),
                    () => ({
                      validator(_, value) {
                        if (getShiftJISByteLength(value) > 32) {
                          return Promise.reject(
                            new Error(
                              t("err-msg-exceed-byte", {
                                field: t("label-" + formId + "-id"),
                                size: 32,
                              })
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input
                    type="text"
                    disabled={idEditable === 0}
                    maxLength={32}
                    id="objectId"
                  />
                </Form.Item>
              </Col>
              <Col offset={1} xs={5} sm={4} md={8} lg={3} xl={3}>
                <Form.Item
                  labelAlign="left"
                  label={t("lab-pub")}
                  name="isPublic"
                  valuePropName={form.isPublic == 1 ? "checked" : ""}
                >
                  <Checkbox
                    disabled={editable === 0}
                    onChange={(e) =>
                      objectForm.setFieldsValue({ isPublic: e.target.checked })
                    }
                  ></Checkbox>
                </Form.Item>
              </Col>
              <Col
                xs={12}
                sm={12}
                md={6}
                lg={5}
                xl={4}
                style={{ paddingTop: "5px" }}
              >
                <label>
                  {!isAutorized || editable == 0 || isLocked == 1
                    ? t("lab-authority2")
                    : t("lab-authority1")}
                </label>
              </Col>
              <Col
                xs={12}
                sm={12}
                md={9}
                lg={6}
                xl={5}
                style={{ paddingTop: "5px" }}
              >
                <label>{t("lab-upd-date")} :</label>{" "}
                <label>
                  {form.updateDate != "" && form.updateDate != null
                    ? moment(form.updateDate, "YYYYMMDDHHmmss").format(
                      "YYYY/MM/DD HH:mm:ss"
                    )
                    : ""}
                </label>
              </Col>
              {formId === OBJECT_CATEGORY.JOBNET && multipleInput()}
            </Row>
            <Row className="row" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col xs={24} sm={24} md={16} lg={12} xl={9}>
                <Form.Item
                  labelAlign="left"
                  labelCol={{ span: 6 }}
                  label={t("label-" + formId + "-name") + " : "}
                  name="name"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: t("err-field-required", {
                        field: t("label-" + formId + "-name"),
                      }),
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (getShiftJISByteLength(value) > 64) {
                          return Promise.reject(
                            new Error(
                              t("err-msg-exceed-byte", {
                                field: t("label-" + formId + "-name"),
                                size: 64,
                              })
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                    () => ({
                      validator(_, value) {
                        if (isImpossibleStr(value)) {
                          return Promise.reject(
                            new Error(
                              t("err-msg-invalid-string", {
                                field: t("label-" + formId + "-name"),
                              })
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input disabled={editable === 0} maxLength={64} id="objectName" />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={8}
                lg={6}
                xl={4}
                style={{ paddingTop: "5px" }}
              >
                <label id="usrName">{t("lab-user-name")} :</label>{" "}
                <label>{form.userName}</label>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={8}
                lg={6}
                xl={4}
                style={{ paddingTop: "5px" }}
              >
                {formId == "calendar" ? (
                  <>
                    <label id="usrName">
                      {t("lab-lastday")} {":"}
                    </label>{" "}
                    <label>
                      {pathArray[3] == "new-object" ||
                        pathArray[3] == "new-version"
                        ? ""
                        : form.lastWorkingDay != "" &&
                          form.lastWorkingDay != null
                          ? moment(form.lastWorkingDay, "YYYYMMDD").format(
                            "YYYY/MM/DD"
                          )
                          : ""}
                    </label>
                  </>
                ) : (
                  ""
                )}
              </Col>
            </Row>
            <Row className="row" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col xs={24} sm={24} md={22} lg={12} xl={12}>
                <Form.Item
                  labelAlign="left"
                  labelCol={{ span: 4 }}
                  className="form-item-desc"
                  name="description"
                  label={t("lab-description")}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (getShiftJISByteLength(value) > 100) {
                          return Promise.reject(
                            new Error(t("err-desc-length"))
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                    () => ({
                      validator(_, value) {
                        if (isImpossibleStr(value)) {
                          return Promise.reject(
                            new Error(
                              t("err-msg-invalid-string", {
                                field: t("lab-description"),
                              })
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input disabled={editable === 0} maxLength={100} />
                </Form.Item>
              </Col>
              {formId === OBJECT_CATEGORY.JOBNET && timoutInput()}
            </Row>
          </Form>
        </div>
      </Panel>
    </Collapse>
  );
};

export default FormObject;

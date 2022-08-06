import ColorPicker from "common/ColorPicker";
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Col, Label, Row } from "reactstrap";
import RangePicker from "common/RangePicker";
import {
  fontFamilies,
  fontSizes,
  lineHights,
  borders,
  borderTypes,
} from "constants/slidr";
import {
  setTextFieldValue,
  textFieldCopy,
  textFieldDelete,
} from "store/actions";

import max from "lodash/max";
import min from "lodash/min";

const RightBar = () => {
  const { activeField, slides, activeSlide, imageSelect } = useSelector(
    state => state.slidr
  );
  const currentSlide = slides.find(slide => slide.id === activeSlide);
  const textField = useMemo(() => {
    if (currentSlide) {
      return currentSlide[imageSelect ? "imageFields" : "textFields"].find(
        field => field.id === activeField
      );
    }
    return null;
  }, [activeField, imageSelect, currentSlide]);

  const dispatch = useDispatch();

  const handleChange = (key, value) => {
    dispatch(
      setTextFieldValue({
        key,
        value,
      })
    );
  };

  const handleDelete = () => {
    dispatch(textFieldDelete());
  };
  const handleCopy = () => {
    dispatch(textFieldCopy());
  };
  const handleSetTop = () => {
    const maxZIndex = max([
      ...currentSlide.imageFields.map(i => i.zIndex),
      ...currentSlide.textFields.map(i => i.zIndex),
    ]);
    if (maxZIndex === textField.zIndex) return;
    const newZIndex = (maxZIndex || 1000) + 10;

    dispatch(
      setTextFieldValue({
        key: "zIndex",
        value: newZIndex,
      })
    );
  };
  const handleSetBack = () => {
    const minZIndex = min([
      ...currentSlide.imageFields.map(i => i.zIndex),
      ...currentSlide.textFields.map(i => i.zIndex),
    ]);
    if (minZIndex === textField.zIndex) return;
    const newZIndex = (minZIndex || 1000) - 10;
    dispatch(
      setTextFieldValue({
        key: "zIndex",
        value: newZIndex,
      })
    );
  };

  return (
    <Card className="shadow-sm bg-light-gray slidr-right-bar">
      <CardBody>
        {!!textField && (
          <>
            <Row>
              {!imageSelect && (
                <>
                  {" "}
                  <Col sm={12}>
                    <span className="label d-block ms-1">Align</span>
                    <div className="d-flex align-items-center mt-2 mb-3">
                      <i
                        className={`me-3 bx bx-align-left ${
                          textField.textAlign === "left" ? "text-primary" : ""
                        }`}
                        onClick={() => handleChange("textAlign", "left")}
                      />
                      <i
                        className={`me-3 bx bx-align-middle ${
                          textField.textAlign === "center" ? "text-primary" : ""
                        }`}
                        onClick={() => handleChange("textAlign", "center")}
                      />
                      <i
                        className={`bx bx-align-right ${
                          textField.textAlign === "right" ? "text-primary" : ""
                        }`}
                        onClick={() => handleChange("textAlign", "right")}
                      />
                    </div>
                    <hr className="my-4" />
                  </Col>
                  <Col sm={12}>
                    <span className="label d-block ms-1">Font</span>
                    <Row className=" mt-2 mb-3">
                      <Col sm={6}>
                        <select
                          className="form-control flex-grow"
                          value={textField.fontFamily}
                          onChange={e =>
                            handleChange("fontFamily", e.target.value)
                          }
                        >
                          {fontFamilies.map(font => (
                            <option key={font.value} value={font.value}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                      </Col>
                      <Col
                        sm={6}
                        className="d-flex align-items-center flex-grow"
                      >
                        <i
                          className={`me-3 bx bx-underline ${
                            textField.isUnderline ? "text-primary" : ""
                          }`}
                          onClick={() =>
                            handleChange("isUnderline", !textField.isUnderline)
                          }
                        />
                        <i
                          className={`me-3 bx bx-italic ${
                            textField.isItalic ? "text-primary" : ""
                          }`}
                          onClick={() =>
                            handleChange("isItalic", !textField.isItalic)
                          }
                        />
                        <i
                          className={`bx bx-bold ${
                            textField.isBold ? "text-primary" : ""
                          }`}
                          onClick={() =>
                            handleChange("isBold", !textField.isBold)
                          }
                        />
                      </Col>
                    </Row>
                    <Row className=" mt-2 mb-3">
                      <Col
                        sm={6}
                        className="d-flex align-items-center flex-grow"
                      >
                        <i className="bx bx-font-size me-1" />
                        <select
                          className="form-control select-small"
                          value={textField.fontSize}
                          onChange={e =>
                            handleChange("fontSize", e.target.value)
                          }
                        >
                          {fontSizes.map(font => (
                            <option key={font.value} value={`${font.value}px`}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                      </Col>
                      <Col
                        sm={6}
                        className="d-flex align-items-center flex-grow"
                      >
                        <i className="bx bx bx-move-vertical me-1" />
                        <select
                          className="form-control select-small"
                          value={textField.lineHeight}
                          onChange={e =>
                            handleChange("lineHeight", e.target.value)
                          }
                        >
                          {lineHights.map(font => (
                            <option key={font.value} value={`${font.value}px`}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                      </Col>
                    </Row>
                    <hr className="my-4" />
                  </Col>
                  <Col sm={12}>
                    <Row>
                      <Col sm={6} className="d-flex align-items-center">
                        <span className="label d-block ms-1">Text Color</span>
                      </Col>
                      <Col sm={6}>
                        <ColorPicker
                          label=""
                          value={textField.color}
                          onChange={value => {
                            handleChange("color", value);
                          }}
                        />
                      </Col>
                    </Row>
                    <hr className="my-4" />
                  </Col>
                  <Col sm={12}>
                    <Row>
                      <Col sm={6} className="d-flex align-items-center">
                        <span className="label d-block ms-1">
                          Background Color
                        </span>
                      </Col>
                      <Col sm={6}>
                        <ColorPicker
                          label=""
                          disableAlpha={false}
                          type="rgba"
                          value={textField.backgroundColor}
                          onChange={value =>
                            handleChange("backgroundColor", value)
                          }
                        />
                      </Col>
                    </Row>
                    <hr className="my-4" />
                  </Col>
                </>
              )}{" "}
              <Col sm={12}>
                <Row>
                  <Col sm={6} className="d-flex align-items-center">
                    <span className="label d-block ms-1">opacity</span>
                  </Col>
                  <Col sm={6}>
                    <RangePicker
                      value={textField.opacity}
                      icon="bx bxs-droplet-half"
                      valueClasses="label mt-1"
                      onChange={value => handleChange("opacity", value)}
                    />
                  </Col>
                </Row>
                <hr className="my-4" />
              </Col>
              <Col sm={12}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <Label
                    htmlFor="border-settings"
                    className="label d-block mb-0"
                  >
                    Border Settings
                  </Label>
                  <div className="form-check form-switch form-switch-md custom-switch">
                    <input
                      type="checkbox"
                      className="form-check-input cursor-pointer"
                      id="border-settings"
                      checked={textField.borderSettings}
                      onChange={e => {
                        handleChange("borderSettings", e.target.checked);
                      }}
                    />
                  </div>
                </div>
                {textField.borderSettings && (
                  <>
                    <Row>
                      <Col sm={6} className="d-flex align-items-center">
                        <span className="label d-block">Border Color</span>
                      </Col>
                      <Col sm={6}>
                        <ColorPicker
                          label=""
                          value={textField.borderColor}
                          size="sm"
                          onChange={value => handleChange("borderColor", value)}
                        />
                      </Col>
                    </Row>
                    <div className="mt-2">
                      <Row className="d-flex align-items-center flex-grow mb-2">
                        <Col>
                          <span className="label d-block">Border Width</span>
                        </Col>
                        <Col className="d-flex align-items-center">
                          {/* <i className="bx bx-border-all" /> */}
                          <select
                            className="form-control select-small"
                            value={textField.borderWidth}
                            onChange={e =>
                              handleChange("borderWidth", e.target.value)
                            }
                          >
                            {borders.map(border => (
                              <option
                                key={border.value}
                                value={`${border.value}px`}
                              >
                                {border.label}
                              </option>
                            ))}
                          </select>
                        </Col>
                      </Row>
                      <Row className="mb-2 d-flex align-items-center">
                        <Col>
                          <span className="label">Border Radius</span>
                        </Col>
                        <Col className="d-flex form-group">
                          {/* <i className="bx bx-border-radius" /> */}
                          <input
                            className="w-100 form-control me-1"
                            min={0}
                            type="number"
                            value={+textField.borderRadius.replace("px", "")}
                            onChange={e => {
                              handleChange(
                                "borderRadius",
                                `${e.target.value}px`
                              );
                            }}
                          />{" "}
                          <span className="input-group-text">px</span>
                          {/* <select
                            className="form-control select-small ms-2"
                            value={textField.borderRadius}
                            onChange={e =>
                              handleChange("borderRadius", e.target.value)
                            }
                          >
                            {borderRadiuses.map(radius => (
                              <option
                                key={radius.value}
                                value={`${radius.value}px`}
                              >
                                {radius.label}
                              </option>
                            ))}
                          </select> */}
                        </Col>
                      </Row>
                    </div>
                    <Row>
                      <Col sm={6} className="d-flex align-items-center">
                        <span className="label d-block">Border Style</span>
                      </Col>
                      <Col sm={6}>
                        <select
                          className="form-control"
                          value={textField.borderStyle}
                          onChange={e =>
                            handleChange("borderStyle", e.target.value)
                          }
                        >
                          {borderTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </Col>
                    </Row>
                  </>
                )}

                <hr className="my-4" />
              </Col>
              <Col sm={12}>
                <Row>
                  <Col sm={6} className="d-flex align-items-center">
                    <span className="label d-block ms-1">Rotation</span>
                  </Col>
                  <Col sm={6}>
                    <RangePicker
                      value={textField.rotate}
                      icon="bx bx-rotate-left"
                      min={0}
                      max={360}
                      valueClasses="label mt-1"
                      onChange={value => handleChange("rotate", value)}
                      onChangeStart={() => {
                        console.log("start");
                        handleChange("rotating", true);
                      }}
                      onChangeStop={() => {
                        console.log("stop");

                        handleChange("rotating", false);
                      }}
                    />
                  </Col>
                </Row>
                <hr className="my-4" />
              </Col>
              <Col sm={12}>
                <Row>
                  <Col
                    sm={6}
                    className="d-flex align-items-center cursor-pointer mb-2 action-button action-button--delete"
                    onClick={handleDelete}
                  >
                    <i className="bx bx-trash-alt small text-danger me-2" />
                    <span>Delete</span>
                  </Col>
                  <Col
                    sm={6}
                    className="d-flex align-items-center  cursor-pointer mb-2 action-button"
                    onClick={handleCopy}
                  >
                    <i className="bx bx-copy small me-2" />
                    <span>Copy</span>
                  </Col>
                  <Col
                    onClick={handleSetTop}
                    sm={6}
                    className="d-flex align-items-center  cursor-pointer mb-2 action-button"
                  >
                    <i className="mdi mdi-checkbox-multiple-blank small me-2" />
                    <span>Set to Top</span>
                  </Col>
                  <Col
                    sm={6}
                    onClick={handleSetBack}
                    className="d-flex align-items-center cursor-pointer mb-2 action-button"
                  >
                    <i className="mdi mdi-select-multiple small me-2" />
                    <span>Set to Back</span>
                  </Col>
                </Row>
              </Col>
            </Row>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default RightBar;

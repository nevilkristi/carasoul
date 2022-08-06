import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useEffect,
  useRef,
} from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  Input,
  Row,
  Col,
} from "reactstrap";
import { useSelector, useDispatch } from "react-redux";

import { useFormik } from "formik";

import CustomDropZone from "common/CustomDropzone/CustomDropZone";
import CommonButton from "common/Button";
import ColorPicker from "common/ColorPicker";
import Alert from "common/Alert";
import {
  backgroundRepeats,
  backgroundPositions,
  backgroundSizes,
  defaultDocumentTitle,
} from "constants/slidr";
import * as Yup from "yup";
import { autoSlideTimes, presentationSizes } from "constants/slidr";

import { slideSettings } from "store/actions";
import { toast } from "react-toastify";

const initialValues = {
  id: 0,
  title: "",
  feedCode: "",
  presentationSize: "1280*720",
  autoSlide: 0,
  img: "",
  size: "cover",
  position: "center",
  repeat: "no-repeat",
  repeatSlideshow: false,
  slideNumbers: false,
  grids: false,
  color: {
    r: "255",
    g: "255",
    b: "255",
    a: "1",
  },
  isImage: false,
};
const validationSchema = Yup.object().shape({
  img: Yup.string().when("isImage", {
    is: value => value,
    then: Yup.string().required("Image is required."),
    otherwise: Yup.string().nullable(),
  }),
});

const SlideshowSettingsModal = forwardRef((_, ref) => {
  const dispatch = useDispatch();
  const imageRef = useRef();
  const { settings, loadingSlideSettings } = useSelector(state => state.slidr);

  const [isOpen, setIsOpen] = useState(false);
  const [alert, setAlert] = useState(false);
  const [presentation, setPresentation] = useState(null);
  const [isBgValueChange, setIsBgValueChange] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setIsOpen(true),
    }),
    []
  );

  const onSubmit = values => {
    if (!!imageRef?.current?.isUploading && values.isImage) {
      toast.error("Please wait while image is uploading...");
      return true;
    }
    values.title = values.title || defaultDocumentTitle;
    dispatch(slideSettings({ payload: { ...values, isBgValueChange } }));
    setIsOpen(false);
  };

  const {
    values,
    handleSubmit,
    setFieldValue,
    errors,
    resetForm,
    touched,
    handleChange,
  } = useFormik({
    initialValues,
    onSubmit,
    validationSchema,
  });

  useEffect(() => {
    if (isOpen) {
      setIsBgValueChange(false);
      resetForm({
        values: {
          ...initialValues,
          ...settings,
        },
      });
    }
  }, [settings, isOpen, resetForm]);

  const toggle = () => {
    if (!!imageRef.current?.isUploading) {
      toast.error("Please wait while image is uploading");
      return true;
    }
    setIsOpen(false);
  };

  const handleAlert = e => {
    setPresentation(e.target.value);
    setAlert(true);
  };
  const confirmed = () => {
    setFieldValue("presentationSize", +presentation);
    setPresentation(null);
    setAlert(false);
  };
  const changeOption = e => {
    setFieldValue(e.target.name, e.target.value);
  };

  return (
    <>
      {" "}
      <Modal
        isOpen={isOpen}
        toggle={toggle}
        centered
        className="slidr-modal slidr-slideshow-modal"
        backdrop="static"
      >
        <ModalHeader toggle={toggle}>Slideshow Setting</ModalHeader>
        <form onSubmit={handleSubmit} id="slidr-slideshow-form">
          <ModalBody>
            <Row>
              <Col sm={12} className="mb-3">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="Enter Title"
                  value={values.title}
                  onChange={handleChange}
                />
              </Col>
              <Col sm={12} className="mb-3">
                <Label htmlFor="feedCode">Feed Code</Label>
                <Input
                  id="feedCode"
                  type="text"
                  disabled={true}
                  name="feedCode"
                  placeholder="Enter Feed Code"
                  value={values.feedCode}
                  onChange={handleChange}
                />
              </Col>
              <Row>
                <Col sm={6} className="mb-3">
                  <Label htmlFor="presentationSize">Presentation Size</Label>
                  <select
                    className="form-control"
                    id="presentationSize"
                    type="text"
                    name="presentationSize"
                    value={values.presentationSize}
                    onChange={e => handleAlert(e)}
                  >
                    <option value={0} disabled>
                      Select Presentation Size
                    </option>
                    {presentationSizes.map(size => (
                      <option value={size.value} key={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </Col>
                <Col sm={6} className="mb-3">
                  <Label htmlFor="autoSlide">Auto Slide</Label>
                  <select
                    className="form-control"
                    id="autoSlide"
                    type="text"
                    name="autoSlide"
                    value={values.autoSlide}
                    onChange={e => setFieldValue("autoSlide", +e.target.value)}
                  >
                    {autoSlideTimes.map(autoSlide => (
                      <option value={autoSlide.value} key={autoSlide.value}>
                        {autoSlide.label}
                      </option>
                    ))}
                  </select>
                </Col>
              </Row>
              <Col sm={12} className="mb-3">
                <div className="d-flex justify-content-between mb-3">
                  <Label className="mb-0" htmlFor="is_arrow">
                    Do you want to put Image instead ?
                  </Label>
                  <div className="form-check form-switch form-switch-md custom-switch ms-1">
                    <input
                      type="checkbox"
                      className="form-check-input cursor-pointer"
                      id="is_arrow"
                      checked={values.isImage}
                      onChange={e => {
                        if (imageRef?.current?.isUploading) {
                          toast.error(
                            "Please wait while image is uploading..."
                          );
                          return true;
                        }
                        setIsBgValueChange(true);
                        setFieldValue("isImage", e.target.checked);
                        if (!!!e.target.checked) {
                          setFieldValue("img", "");
                        }
                      }}
                    />
                  </div>
                </div>
                {values.isImage ? (
                  <>
                    <div className="mb-3">
                      <Label>Background Image</Label>
                      <CustomDropZone
                        ref={imageRef}
                        type="image"
                        src={values.img}
                        handleOnDrop={url => {
                          setIsBgValueChange(true);
                          setFieldValue("img", url);
                        }}
                        accept=".png,.jpg,.jpeg"
                        folderName={process.env.REACT_APP_AWS_FOLDER_VIDEOS}
                        bucketName={process.env.REACT_APP_AWS_BUCKET_SLIDR}
                        error={!!errors.img && touched.img}
                        errorMessage={errors.img}
                        withBottomMargin={false}
                      />{" "}
                    </div>
                    <div className="row mb-3 align-items-center">
                      <Label className="col col-8">
                        Slide Background Repeat
                      </Label>{" "}
                      <div className="col col-4">
                        <select
                          className="form-control"
                          name="repeat"
                          onChange={e => {
                            changeOption(e);
                            setIsBgValueChange(true);
                          }}
                          value={values.repeat}
                        >
                          {backgroundRepeats.map(bgr => (
                            <option key={bgr.value} value={bgr.value}>
                              {bgr.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="d-flex mb-3 row">
                      <Label className="col col-8">
                        Slide Background Size (All Slides)
                      </Label>
                      <div className="col col-4">
                        {" "}
                        <select
                          className="form-control  "
                          onChange={e => {
                            changeOption(e);
                            setIsBgValueChange(true);
                          }}
                          name="size"
                          value={values.size}
                        >
                          {backgroundSizes.map(bgs => (
                            <option key={bgs.value} value={bgs.value}>
                              {bgs.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="d-flex mb-3 row">
                      <Label className="col col-8">
                        Slide Background Position (All Slides)
                      </Label>
                      <div className="col col-4">
                        <select
                          className="form-control  "
                          value={values.position}
                          onChange={e => {
                            changeOption(e);
                            setIsBgValueChange(true);
                          }}
                          name="position"
                        >
                          {backgroundPositions.map(bgp => (
                            <option key={bgp.value} value={bgp.value}>
                              {bgp.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-2">
                    <ColorPicker
                      value={values.color}
                      onChange={value => {
                        setFieldValue("color", value);
                        setIsBgValueChange(true);
                      }}
                      disableAlpha={false}
                      type="rgba"
                      label="Choose Background Color"
                    />
                  </div>
                )}
              </Col>
              <Col sm={12} className="mb-3">
                <div className="custom-switch-row d-flex align-items-center justify-content-between">
                  <Label className="mb-0" htmlFor="repeatSlideshow">
                    Repeat Slideshow
                  </Label>
                  <div className="form-check form-switch form-switch-md custom-switch">
                    <input
                      type="checkbox"
                      className="form-check-input cursor-pointer"
                      id="repeatSlideshow"
                      checked={values.repeatSlideshow}
                      onChange={e => {
                        setFieldValue("repeatSlideshow", e.target.checked);
                      }}
                    />
                  </div>
                </div>
              </Col>
              <Col sm={12} className="mb-3">
                <div className="custom-switch-row d-flex align-items-center justify-content-between">
                  <Label className="mb-0" htmlFor="slideNumbers">
                    Slide Number
                  </Label>
                  <div className="form-check form-switch form-switch-md custom-switch">
                    <input
                      type="checkbox"
                      className="form-check-input cursor-pointer"
                      id="slideNumbers"
                      checked={values.slideNumbers}
                      onChange={e => {
                        setFieldValue("slideNumbers", e.target.checked);
                      }}
                    />
                  </div>
                </div>
              </Col>
              <Col sm={12} className="mb-3">
                <div className="custom-switch-row d-flex align-items-center justify-content-between">
                  <Label className="mb-0" htmlFor="grids">
                    Show Grid lines
                  </Label>
                  <div className="form-check form-switch form-switch-md custom-switch ">
                    <input
                      type="checkbox"
                      className="form-check-input cursor-pointer "
                      id="grids"
                      checked={values.grids}
                      onChange={e => {
                        setFieldValue("grids", e.target.checked);
                      }}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <div className="text-end">
              <CommonButton
                btnType="submit"
                btnForm="slidr-slideshow-form"
                btnClass="px-4"
                btnText={`${loadingSlideSettings ? "Saving..." : "Save"}`}
                btnDisabled={loadingSlideSettings}
              />
            </div>
          </ModalFooter>
        </form>
      </Modal>
      <Alert
        isOpen={alert}
        onClose={() => setAlert(false)}
        alertHeaderText="Change Presentation Size"
        alertDescriptionText="Are you sure you want to change presentation size?"
        confirmed={confirmed}
        fromSlideShowSetting={true}
      />
    </>
  );
});

export default SlideshowSettingsModal;

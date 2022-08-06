import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Label } from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import CustomDropZone from "common/CustomDropzone/CustomDropZone";

import CommonButton from "common/Button";
import ColorPicker from "common/ColorPicker";

import { setBackgroundField } from "store/actions";
import { useDispatch, useSelector } from "react-redux";

import {
  backgroundRepeats,
  backgroundSizes,
  backgroundPositions,
} from "constants/slidr";
import { toast } from "react-toastify";

const initialValues = {
  backgroundImage: "",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "#556ee6",
  isBackgroundImage: false,
};

const validationSchema = Yup.object().shape({
  backgroundImage: Yup.string().when("isBackgroundImage", {
    is: true,
    then: Yup.string().required("Image is required."),
    otherwise: Yup.string().nullable(),
  }),
});

const SlideBackgroundSettingsModal = forwardRef((_, ref) => {
  const imageRef = useRef();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const { slides, activeSlide } = useSelector(state => state.slidr);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setIsOpen(true),
    }),
    []
  );

  const onSubmit = values => {
    if (!!imageRef?.current?.isUploading && values.isBackgroundImage) {
      toast.error("Please wait while image is uploading...");
      return true;
    }
    dispatch(
      setBackgroundField({
        backgroundImage: values.backgroundImage,
        backgroundColor: values.backgroundColor,
        isBackgroundImage: values.isBackgroundImage,
        backgroundRepeat: values.backgroundRepeat,
        backgroundSize: values.backgroundSize,
        backgroundPosition: values.backgroundPosition,
      })
    );
    toggle();
  };

  const changeOption = e => {
    setFieldValue(e.target.name, e.target.value);
  };

  const { values, handleSubmit, setFieldValue, errors, resetForm, touched } =
    useFormik({
      initialValues,
      validationSchema,
      onSubmit,
    });

  const toggle = useCallback(() => {
    if (!!imageRef.current?.isUploading) {
      toast.error("Please wait while image is uploading...");
      return true;
    }
    resetForm({
      values: { ...initialValues },
    });
    setIsOpen(prev => !prev);
  }, [resetForm]);

  useEffect(() => {
    let slide = slides.find(slide => slide.id === activeSlide);
    if (slide) {
      setFieldValue("backgroundColor", slide.backgroundColor);
      setFieldValue("isBackgroundImage", slide.isBackgroundImage);
      setFieldValue("backgroundImage", slide.backgroundImage);
      setFieldValue("backgroundRepeat", slide.backgroundRepeat);
      setFieldValue("backgroundSize", slide.backgroundSize);
      setFieldValue("backgroundPosition", slide.backgroundPosition);
      if (!!slide.backgroundImage) {
        setFieldValue("isBackgroundImage", true);
      }
    }
  }, [activeSlide, isOpen, setFieldValue, slides]);

  return (
    <Modal
      isOpen={isOpen}
      centered
      className="slidr-modal slidr-background-upload-modal"
      backdrop="static"
    >
      <ModalHeader toggle={toggle}>Slide Background Setting</ModalHeader>
      <form onSubmit={handleSubmit} id="slidr-background-upload-form">
        <ModalBody>
          <div className="mb-3 d-flex align-items-center justify-content-between">
            <div className="mb-0" htmlFor="is_arrow">
              Do you want to put Image instead ?
            </div>
            <div className="custom-switch-row d-flex align-items-center">
              <div className="form-check form-switch form-switch-md custom-switch ms-1">
                <input
                  type="checkbox"
                  className="form-check-input cursor-pointer"
                  id="is_arrow"
                  checked={values.isBackgroundImage}
                  onChange={e => {
                    setFieldValue("isBackgroundImage", e.target.checked);
                  }}
                />
              </div>
            </div>
          </div>

          {values.isBackgroundImage ? (
            <>
              {" "}
              <div className="mb-3">
                <Label>Background Image</Label>
                <CustomDropZone
                  ref={imageRef}
                  type="image"
                  src={values.backgroundImage}
                  handleOnDrop={url => {
                    setFieldValue("backgroundImage", url);
                  }}
                  accept=".jpg,.jpeg,.png"
                  folderName={process.env.REACT_APP_AWS_FOLDER_IMAGES}
                  bucketName={process.env.REACT_APP_AWS_BUCKET_SLIDR}
                  error={!!errors.backgroundImage && touched.backgroundImage}
                  errorMessage={errors.backgroundImage}
                  withBottomMargin={false}
                />
              </div>
              <div className="d-flex mb-3 row align-items-center">
                <Label className="col col-8 m-0">Slide Background Repeat</Label>{" "}
                <div className="col col-4">
                  <select
                    className="form-control"
                    name="backgroundRepeat"
                    onChange={changeOption}
                    value={values.backgroundRepeat}
                  >
                    {backgroundRepeats.map(bgr => (
                      <option key={bgr.value} value={bgr.value}>
                        {bgr.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex mb-3 row align-items-center">
                <Label className="col col-8">Slide Background Size</Label>
                <div className="col col-4">
                  {" "}
                  <select
                    className="form-control"
                    onChange={changeOption}
                    name="backgroundSize"
                    value={values.backgroundSize}
                  >
                    {backgroundSizes.map(bgs => (
                      <option key={bgs.value} value={bgs.value}>
                        {bgs.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex mb-3 row align-items-center">
                <Label className="col col-8">Slide Background Position</Label>
                <div className="col col-4">
                  <select
                    className="form-control"
                    value={values.backgroundPosition}
                    onChange={changeOption}
                    name="backgroundPosition"
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
            <ColorPicker
              type="rgba"
              disableAlpha={false}
              value={values.backgroundColor}
              onChange={value => {
                setFieldValue("backgroundColor", value);
              }}
              label="Choose Background Color"
            />
          )}
        </ModalBody>
        <ModalFooter>
          <div className="text-end">
            <CommonButton
              btnType="submit"
              btnForm="slidr-background-upload-form"
              btnClass="px-4"
              btnText="Save"
            />
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
});

export default SlideBackgroundSettingsModal;

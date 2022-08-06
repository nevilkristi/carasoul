import React, { useEffect } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { Input, FormFeedback } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import { useFormik } from "formik";
import * as Yup from "yup";

import { addUpdateFeed, updateSlideshow } from "../store/actions";
import CommonButton from "common/Button";
const initialValues = {
  feed_name: "",
};
const validationSchema = Yup.object().shape({
  feed_name: Yup.string().trim().required("Feed name is required"),
});
const AddUpdateFeedModal = ({ isOpen, handleClose, modalType, editData }) => {
  const { loadingAddUpdateFeed } = useSelector(state => state.feeds);
  const dispatch = useDispatch();

  const onSubmit = val => {
    if ([1, 2].includes(modalType)) {
      dispatch(
        addUpdateFeed({
          payload: {
            feed_id: modalType === 2 ? editData?.feed_id : 0,
            title: val.feed_name,
          },
          callBack: () => onClose(),
        })
      );
    } else {
      dispatch(
        updateSlideshow({
          feed_id: editData.feed_id,
          slideshow_id: editData.slideshow_id,
          title: val.feed_name,
          callBack: () => onClose(),
        })
      );
    }
  };
  const {
    setFieldValue,
    resetForm,
    handleSubmit,
    handleChange,
    values,
    touched,
    errors,
    handleBlur,
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  useEffect(() => {
    resetForm();
    if ([2].includes(modalType) && editData) {
      setFieldValue("feed_name", editData.title);
    }
  }, [modalType, isOpen, editData, setFieldValue]);

  const onClose = () => {
    handleClose();
  };

  return (
    <Modal centered isOpen={isOpen} backdrop="static">
      <ModalHeader toggle={onClose}>
        {modalType === 1
          ? "Add Feed"
          : modalType === 2
          ? "Edit Feed"
          : modalType === 3
          ? "Move Slideshow"
          : ""}
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <Input
            name="feed_name"
            placeholder="Enter Feed Name"
            type="text"
            onChange={handleChange}
            value={values.feed_name}
            invalid={touched.feed_name && !!errors.feed_name}
            onBlur={handleBlur}
            className="form-control"
            id="feed_name"
          />

          <FormFeedback>{errors.feed_name}</FormFeedback>
        </ModalBody>
        <ModalFooter>
          <CommonButton
            btnType="submit"
            btnDisabled={loadingAddUpdateFeed}
            btnText={
              loadingAddUpdateFeed
                ? "Loading..."
                : modalType === 1
                ? "Add Feed"
                : modalType === 2
                ? "Edit Feed"
                : ""
            }
          />
        </ModalFooter>
      </form>
    </Modal>
  );
};
export default AddUpdateFeedModal;

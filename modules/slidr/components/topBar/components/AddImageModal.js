import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useRef,
} from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import CustomDropzone from "common/CustomDropzone";
import CommonButton from "common/Button";
import { addImage } from "store/actions";

import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const AddImageModal = forwardRef((_, ref) => {
  const initialValues = {
    img: "",
  };

  const validationSchema = Yup.object().shape({
    img: Yup.string().required("Image is required."),
  });
  const dispatch = useDispatch();
  const imageRef = useRef();
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setIsOpen(true),
    }),
    []
  );

  const onSubmit = values => {
    if (!!imageRef.current?.isUploading) {
      toast.error("Please wait while image is uploading...");
      return true;
    }
    dispatch(addImage(values.img));
    onClose();
  };

  const onClose = () => {
    if (!!imageRef.current?.isUploading) {
      toast.error("Please wait while image is uploading...");
      return true;
    }
    resetForm({
      values: { ...initialValues },
    });
    setIsOpen(false);
  };

  const { values, handleSubmit, setFieldValue, errors, resetForm } = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  return (
    <Modal isOpen={isOpen} centered backdrop="static">
      <ModalHeader toggle={onClose}>Upload Image</ModalHeader>
      <form onSubmit={handleSubmit} id="slidr-image-upload-form">
        <ModalBody>
          <CustomDropzone
            ref={imageRef}
            type="image"
            src={values.img}
            handleOnDrop={url => {
              setFieldValue("img", url);
            }}
            accept=".jpg,.jpeg,.png"
            folderName={process.env.REACT_APP_AWS_FOLDER_IMAGES}
            bucketName={process.env.REACT_APP_AWS_BUCKET_SLIDR}
            error={!!errors.img}
            errorMessage={errors.img}
            withBottomMargin={false}
          />
        </ModalBody>
        <ModalFooter>
          <CommonButton btnType="submit" btnText="Upload Image" />
        </ModalFooter>
      </form>
    </Modal>
  );
});

export default AddImageModal;

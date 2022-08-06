import CommonButton from "common/Button";
import React from "react";
import { useSelector } from "react-redux";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const ConfirmPublishModal = ({ isOpen, confirm, onClose }) => {
  const { loadingPublishSlideshow } = useSelector(state => state.slidr);

  return (
    <Modal centered isOpen={isOpen} backdrop="static">
      <ModalHeader toggle={onClose}>Publish Slideshow</ModalHeader>
      <ModalBody>
        <div className="mb-3">
          Are you sure, you finished editing and ready to publish this Slideshow
          on the TV App?
        </div>
        <b>Note: This process will take few minutes to finish.</b>
      </ModalBody>
      <ModalFooter>
        <CommonButton
          btnText={loadingPublishSlideshow ? "Publishing..." : "Publish"}
          btnClick={confirm}
          btnDisabled={loadingPublishSlideshow}
        />
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmPublishModal;

import React from "react";
import { Modal, ModalFooter, ModalBody, ModalHeader } from "reactstrap";
import CommonButton from "common/Button";

const Alert = ({
  onClose,
  isOpen,
  confirmed,
  loading,
  alertHeaderText,
  alertDescriptionText,
  confirmBtn = true,
  redBtn = true,
  fromSlideShowSetting,
}) => {
  return (
    <Modal centered isOpen={isOpen} backdrop="static">
      <ModalHeader toggle={onClose}>{alertHeaderText}</ModalHeader>
      <ModalBody className="m-0">
        {alertDescriptionText}{" "}
        {fromSlideShowSetting && (
          <div className="mt-4">
            <p>
              <b>
                <span className="text-theme">Note:</span>
              </b>{" "}
              If you are changing this size after preparing all slides then it
              may be possible that your contents position get change according
              to presentation size and won't look proper. So you have to
              rearrange/resize them manually.
            </p>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {confirmBtn && (
          <CommonButton
            btnClass={` ${redBtn ? "bg-danger delete-pop-btn" : ""}  `}
            btnText={loading ? "Loading..." : alertHeaderText}
            btnClick={confirmed}
            btnDisabled={loading}
          />
        )}
      </ModalFooter>
    </Modal>
  );
};
export default Alert;

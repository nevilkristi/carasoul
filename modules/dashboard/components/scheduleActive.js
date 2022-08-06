import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import DateTimePicker from "react-datetime-picker";
import CommonButton from "common/Button";
import { axiosSlidr } from "services/api";
import { SCHEDULE_SLIDESHOW_URL } from "constants/urls";
import moment from "moment";
import { toast } from "react-toastify";
import { setSlideshowScheduleActiveDateTime } from "../store/actions";
import { useDispatch } from "react-redux";

const ScheduleActive = ({ scheduleActive, onClose }) => {
  const dispatch = useDispatch();
  const [dateTime, setDateTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (scheduleActive.scheduleActiveDateTime) {
      setDateTime(new Date(scheduleActive.scheduleActiveDateTime));
    }
  }, [scheduleActive]);
  const saveScheduleActive = () => {
    if (moment(new Date()).isBefore(dateTime)) {
      setLoading(true);
      const payload = {
        feed_id: scheduleActive.feedId,
        slideshow_id: scheduleActive.slideShowId,
        schedule_active_date_time: moment(dateTime).utc().format(),
      };
      axiosSlidr
        .post(SCHEDULE_SLIDESHOW_URL, payload)
        .then(res => {
          if (res.status) {
            dispatch(setSlideshowScheduleActiveDateTime(payload));
            setLoading(false);
            toast.success(res.data.message);
            onClose();
          }
        })
        .catch(err => {
          toast.error(err.response?.data?.message || err.message);
          setLoading(false);
        });
    } else {
      toast.error("Please select future date time.");
    }
  };
  return (
    <Modal centered isOpen={scheduleActive.mode} toggle={onClose}>
      <ModalHeader toggle={onClose}>Schedule Activation</ModalHeader>
      <ModalBody>
        <DateTimePicker
          className="form-control"
          onChange={setDateTime}
          value={dateTime}
          format="MM-dd-y hh:mm a"
          minDate={new Date()}
        />
      </ModalBody>
      <ModalFooter>
        <CommonButton
          btnText={loading ? "Loading..." : "Save"}
          btnDisabled={loading}
          btnRounded={true}
          btnClick={saveScheduleActive}
        />
      </ModalFooter>
    </Modal>
  );
};

export default ScheduleActive;

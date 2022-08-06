import React, { useMemo, useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import CommonButton from "common/Button";

import { moveSlideshow } from "store/actions";

const MoveSlideshowModal = ({
  isOpen,
  onClose,
  fromFeedId,
  fromSlideshowId,
}) => {
  const dispatch = useDispatch();

  const { feeds, loadingMoveSlideshow } = useSelector(state => state.feeds);

  const [feed, setFeed] = useState(null);
  const [error, setError] = useState(false);

  const onSubmit = () => {
    if (feed) {
      setError(false);
      dispatch(
        moveSlideshow({
          from_feed_id: fromFeedId,
          to_feed_id: feed.value,
          slideshow_id: fromSlideshowId,
          callback: handleClose,
        })
      );
    } else {
      setError(true);
    }
  };
  const feedsOption = useMemo(
    () =>
      feeds && feeds.length
        ? feeds
            .filter(feed => ![fromFeedId].includes(feed.feed_id))
            .map(feed => ({ label: feed.title, value: feed.feed_id }))
        : "",
    [feeds, fromFeedId]
  );

  const handleClose = () => {
    setFeed(null);
    onClose();
  };

  return (
    <Modal centered isOpen={isOpen} backdrop="static">
      <ModalHeader toggle={handleClose}>Move Slideshow</ModalHeader>
      <ModalBody>
        <Select
          className="basic-single"
          placeholder="Select Feed"
          name="feed"
          value={feed}
          options={feedsOption}
          onChange={e => {
            setFeed(e);
            setError(false);
          }}
        />
        {error && (
          <div className="text-danger mt-1" style={{ fontSize: "14px" }}>
            Please select feed.
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <CommonButton
          type="submit"
          btnClick={onSubmit}
          btnText={loadingMoveSlideshow ? "Moving..." : "Move Slideshow"}
          btnDisabled={loadingMoveSlideshow}
        />
      </ModalFooter>
    </Modal>
  );
};
export default MoveSlideshowModal;

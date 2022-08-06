import React, { useEffect, useState, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";
import { UncontrolledTooltip } from "reactstrap";

import {
  deleteFeed,
  fetchFeeds,
  deleteSlideShow,
  copySlideShow,
  activeDeActiveSlideshow,
  setIntroductionTour,
} from "store/actions";
import AddUpdateFeedModal from "./components/addUpdateFeedModal";
import Alert from "common/Alert";
import {
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
} from "reactstrap";
import AddSlideShowModal from "./components/addSlideShowModal";
import MoveSlideshowModal from "./components/moveSlideShowModal";
import CommonButton from "common/Button";

import Tour from "reactour";
import { toast } from "react-toastify";
import { getSliderContent } from "utils/slider";
import { handleDownloadZip } from "utils";
import ScheduleActive from "./components/scheduleActive";
import moment from "moment";

const Slide = ({
  ss,
  feed,
  history,
  clickDeleteSlideShow,
  clickCopySlideShow,
  moveSlideshow,
  clickActiveDeActiveSlideshow,
  isOpen,
  setIsOpen,
  isFeedOne,
}) => {
  const [loadingExport, setLoadingExport] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [scheduleActive, setScheduleActive] = useState({
    mode: false,
    slideShowId: 0,
    feedId: 0,
  });

  const isPublished = !!ss.published_datetime;

  const handleExport = () => {
    if (!isPublished) {
      setShowAlert(true);
      return;
    }

    const fileTitle = ss.title;
    setLoadingExport(true);
    handleDownloadZip(
      fileTitle,
      ss.slideshow_id,
      (_, err) => {
        setLoadingExport(false);
        setExportProgress(0);
        if (!!err) {
          toast.error(err.response?.data?.message || err.message);
          return;
        }
      },
      percent => {
        setExportProgress(percent);
      }
    );
  };

  return (
    <>
      <Alert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        alertHeaderText="Oops!"
        alertDescriptionText="Please publish this Slideshow before you export the slides."
        confirmBtn={false}
      />
      <ScheduleActive
        scheduleActive={scheduleActive}
        onClose={() =>
          setScheduleActive({
            mode: false,
            slideShowId: 0,
            feedId: 0,
            scheduleActiveDateTime: "",
          })
        }
      />
      <div
        className={`feed-slider-admin-feed ${
          ss?.gs_slideshows_setting?.presentation_size === "960*720"
            ? "sm"
            : "lg"
        }`}
      >
        <div className="feed-data feature-slide dash-card">
          <div className="main-slider-area">
            <div className="slide-drop dropdown c-dropdown">
              <div
                className=" mb-0"
                data-toggle="dropdown"
                aria-expanded="false"
                id="dropdownMenuButton"
              >
                <Dropdown
                  isOpen={isOpen === ss.slideshow_id}
                  toggle={e => {
                    if (isOpen === ss.slideshow_id) setIsOpen(0);
                    else setIsOpen(ss.slideshow_id);
                  }}
                  className="float-end"
                  direction="right"
                >
                  <DropdownToggle aline="right" tag="a" className="text-muted">
                    <i className="fa fa-ellipsis text-white"></i>
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      id="delete-slideshow"
                      onClick={() =>
                        clickDeleteSlideShow(feed.feed_id, ss.slideshow_id)
                      }
                    >
                      <i className="fa fa-trash-can" />
                      <span className="ms-2">Delete</span>
                    </DropdownItem>
                    <DropdownItem
                      id="duplicate-slideshow"
                      onClick={() =>
                        clickCopySlideShow({
                          feed_id: feed.feed_id,
                          slideshow_length: feed.gs_slideshows.length,
                          slideshow_id: ss.slideshow_id,
                        })
                      }
                    >
                      <i className="fa fa-clone"></i>
                      <span className="ms-2">Duplicate</span>
                    </DropdownItem>
                    <DropdownItem
                      id="edit-slideshow"
                      onClick={() => history.push(`/slidr/${ss.slideshow_id}`)}
                    >
                      <i className="fa fa-pen-to-square"></i>
                      <span className="ms-2">Edit</span>
                    </DropdownItem>
                    <DropdownItem
                      disabled={isFeedOne}
                      id="move-slideshow"
                      onClick={() => {
                        moveSlideshow({
                          slideShowId: ss.slideshow_id,
                          slideshowLength: ss.length,
                          feedId: feed.feed_id,
                        });
                      }}
                    >
                      <i className="fa fa-arrows"></i>
                      <span className="ms-2">Move</span>
                    </DropdownItem>
                    <DropdownItem
                      id="preview-slideshow"
                      onClick={() =>
                        window.open(`/slide-show-preview/${ss.slideshow_id}`)
                      }
                    >
                      <i className="fa fa-eye"></i>
                      <span className="ms-2">Preview</span>
                    </DropdownItem>
                    <DropdownItem
                      id="export-slideshow"
                      toggle={false}
                      onClick={handleExport}
                      disabled={loadingExport}
                    >
                      <i className="fa-solid fa-download"></i>
                      <span className="ms-2">
                        {loadingExport
                          ? `Exporting...${
                              exportProgress > 0
                                ? ` (${exportProgress.toFixed(0)}%)`
                                : ""
                            }`
                          : "Export Slides"}
                      </span>
                    </DropdownItem>
                    <DropdownItem
                      id="schedule-active-slideshow"
                      toggle={false}
                      onClick={() =>
                        setScheduleActive({
                          mode: true,
                          slideShowId: ss.slideshow_id,
                          scheduleActiveDateTime: ss.schedule_active_date_time,
                          feedId: feed.feed_id,
                        })
                      }
                    >
                      <i className="fa-solid fa-calendar-days"></i>
                      <span className="ms-2">Schedule Activation</span>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>

            <div
              className="add-new-slide"
              onClick={() => history.push(`/slidr/${ss.slideshow_id}`)}
            >
              {ss &&
              ss?.gs_slides &&
              ss.gs_slides.length > 0 &&
              ss.gs_slides[0].content ? (
                <div
                  className="prv-html"
                  dangerouslySetInnerHTML={{
                    __html: getSliderContent(ss?.gs_slides[0]?.content || ""),
                  }}
                />
              ) : (
                ""
              )}
            </div>

            <div className="slide-thumb-details">
              <div className="c-flex-between c-switch">
                <h6 className="subslide-title mb-0">{ss.title}</h6>

                <div className="d-flex align-items-center">
                  {" "}
                  {ss.schedule_active_date_time && (
                    <>
                      {" "}
                      <i
                        className="fa-regular fa-clock cursor-pointer"
                        id={`date_${ss.slideshow_id}`}
                      />
                      <UncontrolledTooltip
                        placement="top"
                        target={`date_${ss.slideshow_id}`}
                      >
                        Slideshow will active on{" "}
                        {moment(ss.schedule_active_date_time).format(
                          "MM/DD/YYYY, hh:mm a"
                        )}
                      </UncontrolledTooltip>
                    </>
                  )}
                  <div className=" form-check form-switch form-switch-md custom-switch ms-1 mb-0">
                    <input
                      type="checkbox"
                      className="form-check-input cursor-pointer mt-0 mb-0"
                      checked={ss.is_active ? true : false}
                      onChange={() => {
                        clickActiveDeActiveSlideshow({
                          is_active: ss.is_active ? 0 : 1,
                          slideshow_id: ss.slideshow_id,
                          feed_id: feed.feed_id,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const FeedDashboard = ({ history }) => {
  const dispatch = useDispatch();
  const {
    loadingFeeds,
    loadingDeleteFeed,
    loadingDeleteSlideshow,
    loadingCopySlideshow,
    feeds,
  } = useSelector(state => state.feeds);
  const { tour, subscriptionStatus } = useSelector(state => state.profile);
  const { user } = useSelector(state => state.auth);

  const [modalType, setModalType] = useState(0);
  const [openAddFeedModal, setOpenAddFeedModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmAlert, setConfirmAlert] = useState(false);
  const [deleteFeedId, setDeleteFeedId] = useState(0);
  const [alertType, setAlertType] = useState(0);
  const [deleteSlideShowIds, setDeleteSlideShowIds] = useState({
    feed_id: 0,
    slideshow_id: 0,
  });
  const [openAddSlideshowModal, setOpenAddSlideshowModal] = useState(false);

  const [openMoveSlideshowModal, setOpenMoveSlideshowModal] = useState(false);
  const [fromSlideshowId, setFromSlideshowId] = useState(0);
  const [fromFeedId, setFromFeedId] = useState(0);
  const [feedId, setFeedId] = useState(0);
  const [isOpen, setIsOpen] = useState(0);

  useEffect(() => {
    dispatch(fetchFeeds());
  }, [dispatch]);

  const isSubscribed = useMemo(
    () => [1, 2].includes(user?.user_role) || subscriptionStatus,
    [subscriptionStatus, user]
  );
  const clickOpenFeed = () => {
    if (isSubscribed || feeds.length === 0) {
      setModalType(1);
      setOpenAddFeedModal(true);
    } else {
      redirectingToSubscription();
    }
  };

  const editFeed = ({ feed_id, title }) => {
    setModalType(2);
    setOpenAddFeedModal(true);
    setEditData({
      feed_id: feed_id,
      title: title,
    });
  };

  const clickDelete = feed_id => {
    setAlertType(1);
    setConfirmAlert(true);
    setDeleteFeedId(feed_id);
  };
  const confirmed = () => {
    if (alertType === 1) {
      dispatch(deleteFeed({ feed_id: deleteFeedId, callBack: onCloseAlert }));
    } else if (alertType === 2) {
      dispatch(
        deleteSlideShow({
          feed_id: deleteSlideShowIds.feed_id,
          slideshow_id: deleteSlideShowIds.slideshow_id,
          callBack: onCloseAlert,
        })
      );
    } else if (alertType === 3) {
      dispatch(
        copySlideShow({
          feed_id: editData.feed_id,
          slideshow_id: editData.slideshow_id,
          callBack: onCloseAlert,
        })
      );
    }
  };

  const onCloseAlert = () => {
    setConfirmAlert(false);
    setAlertType(0);
  };

  const handleCloseAddUpdateFeed = () => {
    setOpenAddFeedModal(false);
    setEditData(null);
  };

  const clickDeleteSlideShow = (feed_id, slideshow_id) => {
    setAlertType(2);
    setConfirmAlert(true);
    setDeleteSlideShowIds({
      feed_id: feed_id,
      slideshow_id: slideshow_id,
    });
  };

  const clickCopySlideShow = ({ feed_id, slideshow_id, slideshow_length }) => {
    if (isSubscribed || slideshow_length === 0) {
      setEditData({
        feed_id,
        slideshow_id,
      });
      setConfirmAlert(true);
      setAlertType(3);
    } else {
      redirectingToSubscription();
    }
  };

  const moveSlideshow = ({ slideShowId, feedId, slideshowLength }) => {
    if (isSubscribed || slideshowLength === 0) {
      setFromSlideshowId(slideShowId);
      setFromFeedId(feedId);
      setOpenMoveSlideshowModal(true);
    } else {
      redirectingToSubscription();
    }
  };
  const clickActiveDeActiveSlideshow = ({
    is_active,
    feed_id,
    slideshow_id,
  }) => {
    dispatch(
      activeDeActiveSlideshow({
        slideshow_id: slideshow_id,
        feed_id: feed_id,
        is_active: is_active,
      })
    );
  };

  const firstSlideId = useMemo(() => {
    let slideId = null;
    if (!!!feeds.length) slideId = null;
    else
      for (let i = 0; i < feeds.length; i++) {
        if (!!feeds[i].gs_slideshows.length) {
          slideId = feeds[i].gs_slideshows[0].slideshow_id;
          break;
        }
      }
    return slideId;
  }, [feeds]);

  const steps = useMemo(
    () => [
      {
        selector: "#add-feed",
        content: () => <p className="mt-3">Click here to add a new Feed.</p>,
      },
      ...(!!feeds.length
        ? [
            {
              selector: "#edit-feed",
              content: () => <p className="mt-3">Click here to edit Feed.</p>,
            },
            {
              selector: "#delete-feed",
              content: () => <p className="mt-3">Click here to delete Feed.</p>,
            },
          ]
        : []),
      ...(!!firstSlideId
        ? [
            {
              selector: "#delete-slideshow",
              content: () => (
                <p className="mt-3">Click here to delete slideshow.</p>
              ),
            },
            {
              selector: "#duplicate-slideshow",
              content: () => (
                <p className="mt-3">Click here to duplicate slideshow.</p>
              ),
            },
            {
              selector: "#edit-slideshow",
              content: () => (
                <p className="mt-3">Click here to edit slideshow.</p>
              ),
            },
            {
              selector: "#move-slideshow",
              content: () => (
                <p className="mt-3">Click here to move Slideshow.</p>
              ),
            },
            {
              selector: "#preview-slideshow",
              content: () => (
                <p className="mt-3">Click here to preview slideshow.</p>
              ),
            },
            {
              selector: "#export-slideshow",
              content: () => (
                <p className="mt-3">Click here to download slides as images.</p>
              ),
            },
            {
              selector: "#schedule-active-slideshow",
              content: () => (
                <p className="mt-3">Click here to schedule active Slideshow.</p>
              ),
            },
          ]
        : []),
    ],
    [firstSlideId, feeds]
  );

  const getCurrentStep = step => {
    if (step >= 3 && !!firstSlideId) {
      setIsOpen(firstSlideId);
    } else {
      setIsOpen(0);
    }
  };
  const handleAddSlideshow = (feed_id, slideshowLength) => {
    if (isSubscribed || slideshowLength === 0) {
      setOpenAddSlideshowModal(true);
      setFeedId(feed_id);
    } else {
      redirectingToSubscription();
    }
  };

  const redirectingToSubscription = () => {
    toast.error("You need to purchase subscription before proceeding further");
    history.push("/subscription");
  };
  return (
    <div className="blue-bg">
      <Tour
        steps={steps}
        isOpen={tour.dashboard}
        onRequestClose={() => {
          dispatch(setIntroductionTour({ dashboard: false }));
          setIsOpen(0);
        }}
        accentColor="#33bfd7"
        rounded={15}
        startAt={0}
        getCurrentStep={getCurrentStep}
        disableInteraction
      />
      <section className="slider-content ptb-50" id="slider-content">
        <div>
          <div className="row">
            <div className="col-sm-12">
              <div className="slider-heading">
                <div className="back-arrow-title">
                  <div
                    className="slide-title canvas-title"
                    title="Double click to edit Slideshow title"
                  >
                    <h2 className="mb-0" id="content">
                      Feed Dashboard
                    </h2>
                  </div>
                </div>
                <div className="slider-search-btn">
                  <div className="plan_searchbar d-none">
                    <input
                      className="form-control mr-sm-2 p-0"
                      type="search"
                      placeholder="Search"
                      aria-label="Search"
                    />
                  </div>

                  <div
                    id="add-feed"
                    className="feedbtn ml-2 ml-0"
                    onClick={clickOpenFeed}
                  >
                    <CommonButton btnText="Add Feed" btnRounded={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {loadingFeeds ? (
            <div className="mt-30 feed-slider-card">
              Please wait while data is loading...
            </div>
          ) : (
            <>
              {feeds && feeds.length ? (
                feeds.map(feed => (
                  <div key={feed.feed_id} className="row">
                    <div className="col-sm-12">
                      <div className="feed-slider-card">
                        <div className="row c-rem-margin mb30">
                          <div className="col-sm-12">
                            <div className="slider-heading-main">
                              <div className="slider-title-left">
                                <div className="title-line">
                                  <h3>{feed.title}</h3>
                                  <div className="v-line"></div>
                                </div>
                                <h4>
                                  Code: <span>{feed.code}</span>
                                </h4>
                              </div>
                              <div className="slider-btn-right">
                                <CommonButton
                                  btnId="edit-feed"
                                  btnText="Edit"
                                  btnRounded={true}
                                  btnClick={() => {
                                    editFeed({
                                      feed_id: feed.feed_id,
                                      title: feed.title,
                                    });
                                  }}
                                />
                                <CommonButton
                                  btnId="delete-feed"
                                  btnClick={() => clickDelete(feed.feed_id)}
                                  btnText="Delete"
                                  btnClass="slider-edit-btn-red ms-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="feed-slider-row">
                          {feed.gs_slideshows && feed.gs_slideshows.length > 0 && (
                            <>
                              {feed.gs_slideshows.map(ss => (
                                <Slide
                                  key={ss.slideshow_id}
                                  ss={ss}
                                  feed={feed}
                                  history={history}
                                  dispatch={dispatch}
                                  clickDeleteSlideShow={clickDeleteSlideShow}
                                  clickCopySlideShow={clickCopySlideShow}
                                  moveSlideshow={moveSlideshow}
                                  clickActiveDeActiveSlideshow={
                                    clickActiveDeActiveSlideshow
                                  }
                                  isOpen={isOpen}
                                  setIsOpen={setIsOpen}
                                  isFeedOne={feeds.length === 1}
                                />
                              ))}
                            </>
                          )}

                          <div className="feed-slider-admin-feed lg">
                            <div className="feed-data feature-slide dash-card">
                              <div className="main-slider-area">
                                <div
                                  style={{ border: "none" }}
                                  className="add-new-slide"
                                  data-toggle="modal"
                                  data-target="#add_announcement_item"
                                >
                                  <div
                                    className="slider-content-detail add-under-slide"
                                    onClick={() =>
                                      handleAddSlideshow(
                                        feed.feed_id,
                                        feed.gs_slideshows.length
                                      )
                                    }
                                  >
                                    <div className="add-icon">
                                      <i className="fa-solid fa-plus"></i>
                                    </div>

                                    <h4>Add Slideshow</h4>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="mt-30 feed-slider-card">No feed available</div>
              )}
            </>
          )}
        </div>
      </section>
      <AddUpdateFeedModal
        isOpen={openAddFeedModal}
        modalType={modalType}
        handleClose={handleCloseAddUpdateFeed}
        editData={editData}
      />
      <MoveSlideshowModal
        isOpen={openMoveSlideshowModal}
        onClose={() => setOpenMoveSlideshowModal(false)}
        fromSlideshowId={fromSlideshowId}
        fromFeedId={fromFeedId}
      />
      <Alert
        isOpen={confirmAlert}
        onClose={onCloseAlert}
        confirmed={confirmed}
        redBtn={[1, 2].includes(alertType) ? true : false}
        loading={
          alertType === 1
            ? loadingDeleteFeed
            : alertType === 2
            ? loadingDeleteSlideshow
            : loadingCopySlideshow
        }
        alertHeaderText={
          alertType === 1
            ? "Delete Feed"
            : alertType === 2
            ? "Delete Slideshow"
            : "Duplicate Slideshow "
        }
        alertDescriptionText={`Are you sure you want to ${
          alertType === 1
            ? "Delete Feed"
            : alertType === 2
            ? "Delete Slideshow"
            : "Duplicate Slideshow"
        }?`}
      />
      <AddSlideShowModal
        isOpen={openAddSlideshowModal}
        feedId={feedId}
        onClose={() => {
          setOpenAddSlideshowModal(false);
        }}
      />
    </div>
  );
};
export default FeedDashboard;

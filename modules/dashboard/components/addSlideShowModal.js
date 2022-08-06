import React, { useState, useRef, useMemo, useEffect } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import titleDot from "assets/images/title-dot.svg";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import { addSlideshow, addGrowSlideshow } from "store/actions";

import { axiosAdmin, axiosSlidr } from "services/api";
import {
  GET_VOLUMES_URL,
  GET_ALL_SERIES_URL,
  GET_ALL_GAME_URL,
} from "constants/urls";
import CommonButton from "common/Button";
import InfiniteScroll from "react-infinite-scroll-component";
import useDebounce from "hooks/useDebounce";

const AddSlideShowModal = ({ isOpen, onClose, feedId }) => {
  const history = useHistory();
  const ref = useRef();
  const dispatch = useDispatch();
  const page_record = 12;
  const { loadingAddGrowSlideshow, loadingAddSlideshow } = useSelector(
    state => state.feeds
  );

  const [isOpenGrowSlideshow, setIsOpenGrowSlideshow] = useState(false);
  const [ministryType, setMinistryType] = useState(0);
  const [loadingVolume, setLoadingVolume] = useState(false);
  const [volumes, setVolumes] = useState([]);
  const [volumeId, setVolumeId] = useState(0);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [loadingSlideshow, setLoadingSlideshow] = useState(false);
  const [series, setSeries] = useState([]);
  const [slideshowId, setSlideshowId] = useState(0);
  const [seriesId, setSeriesId] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [gameSlideShow, setGameSlideShow] = useState([]);
  const [page, setPage] = useState(1);
  const [totalSize, setTotalSize] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search);

  const next = () => {
    setPage(page + 1);
    page_record * page < totalSize ? setHasMore(true) : setHasMore(false);
  };

  const slideshows = useMemo(
    () =>
      series.find(x => x.category_id === seriesId)?.slide_show_details || [],
    [seriesId, series]
  );

  useEffect(() => {
    try {
      if (page !== 1) {
        // setLoadingSlideshow(true);
        axiosSlidr
          .post(GET_ALL_GAME_URL, {
            page_no: page,
            page_record: page_record,
          })
          .then(res => {
            if (res.status && res.data?.data?.slideShows) {
              setGameSlideShow(prev => [
                ...prev,
                ...res.data?.data?.slideShows.rows,
              ]);
            }
          });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  }, [page]);

  useEffect(() => {
    setPage(1);
    try {
      if (ministryType === 4) {
        setLoadingSlideshow(true);
        setSlideshowId(0);
        axiosSlidr
          .post(GET_ALL_GAME_URL, {
            page_no: 1,
            page_record: page_record,
            search: debounceSearch,
          })
          .then(res => {
            if (res.status && res.data?.data?.slideShows) {
              setGameSlideShow(res.data?.data?.slideShows?.rows);
              // res.data?.data?.slideShows?.rows.length === 0 &&
              //   setSlideshowId(0);
              setTotalSize(res.data?.data?.slideShows?.count);
              page_record < res.data?.data?.slideShows?.count
                ? setHasMore(true)
                : setHasMore(false);
              setLoadingSlideshow(false);
            }
          });
      }
    } catch (err) {
      // setLoadingSeries(false);
      setLoadingSlideshow(false);
      toast.error(err.response?.data?.message || err.message);
    }
  }, [debounceSearch]);

  useEffect(() => {
    if (!!volumes.length || !!series.length || !!slideshows.length) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [volumes, series, slideshows]);
  const addBlankSlideshow = (category_id = 0) => {
    setActiveTab(1);
    dispatch(
      addSlideshow({
        payload: {
          feed_id: feedId,
          category_id: category_id,
        },
        history: history,
      })
    );
  };
  const handleAddGrowSlideshow = () => {
    dispatch(
      addGrowSlideshow({
        feed_id: feedId,
        slideshow_id: slideshowId,
        history: history,
      })
    );
  };
  const clickGrowSlideshow = () => {
    setActiveTab(2);
    setIsOpenGrowSlideshow(true);
  };
  const resetData = () => {
    setVolumeId(0);
    setVolumes([]);
    setSeriesId(0);
    setSeries([]);
    setSlideshowId(0);
    setGameSlideShow([]);
    setLoadingSlideshow(false);
  };
  const changeMinistryType = ministryType => {
    resetData();
    setMinistryType(ministryType);
    try {
      setLoadingVolume(true);
      axiosAdmin.get(`${GET_VOLUMES_URL}/${ministryType}`).then(res => {
        if (res.status && res.data?.data?.purchased_volumes) {
          resetData();

          setLoadingVolume(false);
          let vol = res.data.data.purchased_volumes.filter(
            x => x.category_id !== +process.env.REACT_APP_MUSIC_ID
          );
          setVolumes(vol);
        }
      });
    } catch (err) {
      setLoadingVolume(false);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const changeGameType = ministryType => {
    resetData();
    setMinistryType(ministryType);
    setPage(1);
    setSearch("");
    try {
      setSlideshowId(0);
      setLoadingSlideshow(true);
      axiosSlidr
        .post(GET_ALL_GAME_URL, {
          page_no: 1,
          page_record: page_record,
        })
        .then(res => {
          if (res.status && res.data?.data?.slideShows) {
            setGameSlideShow(res.data?.data?.slideShows?.rows);
            // res.data?.data?.slideShows?.rows.length === 0 && setSlideshowId(0);
            setTotalSize(res.data?.data?.slideShows?.count);
            page_record < res.data?.data?.slideShows?.count
              ? setHasMore(true)
              : setHasMore(false);
            setLoadingSlideshow(false);
          }
        });
    } catch (err) {
      // setLoadingSeries(false);
      setLoadingSlideshow(false);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const changeVolume = categories_id => {
    setVolumeId(categories_id);
    try {
      setLoadingSeries(true);
      axiosSlidr
        .post(GET_ALL_SERIES_URL, {
          volume_id: categories_id,
          ministry_type: ministryType,
        })
        .then(res => {
          if (res.status && res.data?.data?.rows) {
            setSeriesId(0);
            setLoadingSeries(false);
            setSeries(res.data.data.rows);
          }
        });
    } catch (err) {
      setLoadingSeries(false);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const changeSlideshow = id => {
    setSlideshowId(id);
  };
  const handleOnClose = () => {
    resetData();
    setIsOpenGrowSlideshow(false);
    setMinistryType(0);
    setActiveTab(0);
    onClose();
  };
  return (
    <Modal
      className="add-slideshow-modal"
      size="lg"
      centered
      isOpen={isOpen}
      backdrop="static"
    >
      <ModalHeader toggle={handleOnClose}>Add Slideshow</ModalHeader>
      <ModalBody>
        <div
          className="add-slideshow-modal-body"
          id="add-slide-show-infinite"
          ref={ref}
        >
          <p>How do you want to create your slideshow?</p>
          <div
            className={`plan-grow-content mb-4 ${
              activeTab === 1 ? "theme-border" : ""
            }`}
            onClick={() => addBlankSlideshow(0)}
          >
            <div className="teaching-information">
              <img src={titleDot} alt="dots" />
              <h4 className="teaching-information-text d-flex">
                Blank Slideshow{" "}
                {loadingAddSlideshow && (
                  <i className="bx bx-loader d-flex align-items-center ms-2" />
                )}
              </h4>
            </div>
            <div>
              <i className="fa fa-arrow-right-long"></i>
            </div>
          </div>
          <div
            onClick={clickGrowSlideshow}
            className={`plan-grow-content mb-4 ${
              activeTab === 2 ? "theme-border" : ""
            }`}
          >
            <div className="teaching-information">
              <img src={titleDot} alt="dots" />
              <h4 className="teaching-information-text">Grow Slideshow</h4>
            </div>
            <div>
              <i className="fa fa-arrow-right-long"></i>{" "}
            </div>
          </div>
          {isOpenGrowSlideshow && (
            <>
              {" "}
              <form action="" className="grow-age-group">
                <h5 className="semi-bold">Select Age Group</h5>
                <div className="content-category-1">
                  <ul className="grow_content_ul">
                    <label htmlFor="kids">
                      <li>
                        <div>
                          <input
                            onChange={() => changeMinistryType(1)}
                            type="radio"
                            name="kids"
                            checked={ministryType === 1}
                            id="kids"
                            disabled={
                              loadingSlideshow || loadingVolume ? true : false
                            }
                          />
                        </div>
                        <div className="content_folder">
                          <i className="bx bxs-folder-open" />
                          <h6 className="mb-0">Grow Kids</h6>
                        </div>
                      </li>
                    </label>
                    <label htmlFor="student">
                      <li>
                        <div>
                          <input
                            onChange={() => changeMinistryType(2)}
                            type="radio"
                            name="student"
                            checked={ministryType === 2}
                            id="student"
                            disabled={
                              loadingSlideshow || loadingVolume ? true : false
                            }
                          />
                          {console.log(
                            "loadingSlideshow || loadingVolume ? true : false",
                            loadingSlideshow || loadingVolume ? true : false
                          )}
                          {console.log("loadingSlideshow", loadingSlideshow)}
                          {console.log("loadingVolume", loadingVolume)}
                        </div>
                        <div className="content_folder">
                          <i className="bx bxs-folder-open" />
                          <h6 className="mb-0">Grow Students</h6>
                        </div>
                      </li>
                    </label>
                    <label htmlFor="group">
                      <li>
                        <div>
                          <input
                            onChange={() => changeMinistryType(3)}
                            type="radio"
                            name="group"
                            checked={ministryType === 3}
                            id="group"
                            disabled={
                              loadingSlideshow || loadingVolume ? true : false
                            }
                          />
                        </div>
                        <div className="content_folder">
                          <i className="bx bxs-folder-open" />
                          <h6 className="mb-0">Grow Groups</h6>
                        </div>
                      </li>
                    </label>
                    <label htmlFor="game">
                      <li>
                        <div>
                          <input
                            onChange={() => changeGameType(4)}
                            type="radio"
                            name="game"
                            checked={ministryType === 4}
                            id="game"
                            disabled={
                              loadingSlideshow || loadingVolume ? true : false
                            }
                          />
                        </div>
                        <div className="content_folder">
                          <i className="bx bxs-folder-open" />
                          <h6 className="mb-0">Grow Games</h6>
                        </div>
                      </li>
                    </label>
                  </ul>
                </div>
              </form>
              {loadingVolume && (
                <div className="text-center">
                  Please wait while data is loading..
                </div>
              )}
              {volumes && volumes.length > 0 && (
                <form action="" className="grow-age-group">
                  <h5 className="semi-bold">Select Volume</h5>
                  <div className="content-category-1">
                    <ul className="grow_content_ul">
                      {volumes.map(vol => (
                        <label
                          className="volumeCategory"
                          key={vol.category_id}
                          htmlFor={vol.category_id}
                        >
                          <li>
                            <div>
                              <input
                                id={vol.category_id}
                                type="radio"
                                name="radio"
                                onChange={() => changeVolume(vol.category_id)}
                                checked={volumeId === vol.category_id}
                              />
                            </div>

                            <div className="content_folder">
                              <i className="bx bxs-folder-open" />
                              <h6 className="mb-0">{vol.category_title}</h6>
                            </div>
                          </li>
                        </label>
                      ))}
                    </ul>
                  </div>
                </form>
              )}
              {(volumes &&
                volumes.length === 0 &&
                ministryType !== 0 &&
                !loadingVolume) ||
                (gameSlideShow.length > 0 && (
                  <div className="text-center">No volume available</div>
                ))}
              {loadingSeries && (
                <div className="text-center">
                  Please wait while data is loading..
                </div>
              )}
              {!!!loadingSeries && series && series.length > 0 && (
                <form action="" className="grow-age-group">
                  <h5 className="semi-bold">Select Series</h5>
                  <div className="content-category-1">
                    <ul className="grow_content_ul">
                      {series.map(series => (
                        <label
                          className="volumeCategory"
                          key={series.category_id}
                          htmlFor={"series" + series.category_id}
                        >
                          <li>
                            <div>
                              <input
                                id={"series" + series.category_id}
                                type="radio"
                                name="radio"
                                onChange={() => setSeriesId(series.category_id)}
                                checked={seriesId === series.category_id}
                              />
                            </div>
                            <div className="content_folder">
                              <i className="bx bxs-folder-open" />
                              <h6 className="mb-0">{series.category_title}</h6>
                            </div>
                          </li>
                        </label>
                      ))}
                    </ul>
                  </div>
                </form>
              )}
              {ministryType !== 0 &&
                volumes.length > 0 &&
                series.length === 0 &&
                volumeId !== 0 &&
                !loadingSeries && (
                  <div className="text-center">No series available</div>
                )}
              {slideshows && slideshows.length > 0 && (
                <>
                  {" "}
                  <form action="" className="grow-age-group">
                    <h5 className="semi-bold">Select Slideshow</h5>
                    <div className="content-category-1">
                      <ul className="grow_content_ul">
                        {slideshows.map(slideShow => (
                          <label
                            className="volumeCategory"
                            key={slideShow.slideshow_id}
                            htmlFor={"slideShow" + slideShow.slideshow_id}
                          >
                            <li>
                              <div>
                                <input
                                  id={"slideShow" + slideShow.slideshow_id}
                                  type="radio"
                                  name="radio"
                                  onChange={() =>
                                    changeSlideshow(slideShow.slideshow_id)
                                  }
                                  checked={
                                    slideshowId === slideShow.slideshow_id
                                  }
                                />
                              </div>
                              <div className="content_folder">
                                <i className="bx bxs-folder-open" />
                                <h6 className="mb-0">{slideShow.title}</h6>
                              </div>
                            </li>
                          </label>
                        ))}
                      </ul>
                    </div>
                  </form>
                </>
              )}
              {ministryType !== 0 &&
                volumes.length > 0 &&
                series.length > 0 &&
                slideshows.length === 0 &&
                !!!loadingSeries &&
                seriesId !== 0 && (
                  <div className="text-center">No slideshow available</div>
                )}
              {ministryType === 4 && (
                <div className="slideshow-search-header">
                  <h5 className="semi-bold">Select Slideshow</h5>
                  <div class="search-container">
                    <input
                      type="text"
                      name="search"
                      placeholder="Search Slideshow"
                      class="search-input"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    <div class="search-btn">
                      <i class="fas fa-search"></i>
                    </div>
                  </div>
                </div>
              )}
              {!loadingSlideshow ? (
                <InfiniteScroll
                  dataLength={gameSlideShow.length}
                  next={next}
                  hasMore={hasMore}
                  // loader={<Loader />}
                  scrollableTarget={"add-slide-show-infinite"}
                  style={{
                    overflow: "auto",
                  }}
                >
                  {gameSlideShow && gameSlideShow.length > 0 && (
                    <>
                      {" "}
                      <form action="" className="grow-age-group">
                        <div className="content-category-1">
                          <ul className="grow_content_ul">
                            {gameSlideShow.map(slideShow => (
                              <label
                                className="volumeCategory"
                                key={slideShow.slideshow_id}
                                htmlFor={"slideShow" + slideShow.slideshow_id}
                              >
                                <li>
                                  <div>
                                    <input
                                      id={"slideShow" + slideShow.slideshow_id}
                                      type="radio"
                                      name="radio"
                                      onChange={() =>
                                        changeSlideshow(slideShow.slideshow_id)
                                      }
                                      checked={
                                        slideshowId === slideShow.slideshow_id
                                      }
                                    />
                                  </div>
                                  <div className="content_folder">
                                    <i className="bx bxs-folder-open" />
                                    <h6 className="mb-0">{slideShow.title}</h6>
                                  </div>
                                </li>
                              </label>
                            ))}
                          </ul>
                        </div>
                      </form>
                    </>
                  )}
                </InfiniteScroll>
              ) : (
                <div className="text-center">
                  Please wait while data is loading..
                </div>
              )}
              {ministryType === 4 &&
                gameSlideShow.length === 0 &&
                !!!loadingSlideshow && (
                  <div className="text-center">No slideshow available</div>
                )}
            </>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        {slideshowId !== 0 && (
          <CommonButton
            btnText={`${
              loadingAddGrowSlideshow ? "Adding..." : "Add Slideshow"
            }`}
            btnClick={handleAddGrowSlideshow}
            btnDisabled={loadingAddGrowSlideshow}
          />
        )}
      </ModalFooter>
    </Modal>
  );
};
export default AddSlideShowModal;

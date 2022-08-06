import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { axiosAdmin } from "services/api";
import { GET_ALL_TUTORIALS } from "constants/urls";
import { toast } from "react-toastify";
import DomPurify from "dompurify";
import noThumbnail from "assets/images/noThumbnail.png";
import {
  getCloudFrontImgUrl,
  getCloudFrontThumbnailUrl,
} from "utils/cloudFrontUrl";

const TutorialDetails = ({ tutorialDetails }) => {
  return (
    <>
      <div className="text-aligns-center d-flex justify-content-center">
        {tutorialDetails.video_url ? (
          <video
            controls
            className="video w-50"
            key={tutorialDetails.video_url}
            style={{ height: "500px" }}
          >
            <source src={tutorialDetails.video_url} type="video/mp4" />
            <source src={tutorialDetails.video_url} type="video/ogg" />
          </video>
        ) : tutorialDetails.featured_image_url ? (
          <img
            src={getCloudFrontImgUrl(tutorialDetails.featured_image_url)}
            className="m-auto w-50"
            alt="featuredImage"
          />
        ) : (
          <img src={noThumbnail} className="m-auto w-50" alt="noThumbnail" />
        )}
      </div>
      <div className="text-center">
        <h6 className="tutorials-details-title">{tutorialDetails.title}</h6>
        <div
          dangerouslySetInnerHTML={{
            __html: DomPurify.sanitize(tutorialDetails.content),
          }}
        />
      </div>
    </>
  );
};

const Tutorial = ({ history }) => {
  const [loading, setLoading] = useState(false);
  const [tutorial, setTutorial] = useState([]);
  const [tutorialDetailsId, setTutorialDetailsId] = useState(0);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState([]);

  useEffect(() => {
    setLoading(true);
    axiosAdmin
      .get(`${GET_ALL_TUTORIALS}/${6}`)
      .then(res => {
        if (res.status && res.data?.data?.rows) {
          setLoading(false);
          setTutorial(res.data.data.rows);
        }
      })
      .catch(err => {
        setLoading(false);
        toast.error(err.response?.data?.message || err.message);
      });
  }, []);

  const tags = useMemo(() => {
    if (!!tutorial && !!tutorial?.length) {
      const data = [];
      tutorial.forEach(i => {
        data.push(...i.tags.map(tag => tag.toLowerCase().trim()));
      });
      return [...new Set(data)];
    } else return [];
  }, [tutorial]);

  const handleFilter = value => {
    if (!active.includes(value)) {
      setActive(old => [...old, value]);
    } else {
      setActive(active.filter(x => x !== value));
    }
  };

  const filteredTutorials = useMemo(
    () =>
      tutorial.filter(
        x =>
          !!x.is_active &&
          (!active.length
            ? true && RegExp(`${search}`, "gi").test(x.title)
            : x.tags.some(i => active.includes(i)) &&
              RegExp(`${search}`, "gi").test(x.title))
      ) || [],
    [tutorial, active, search]
  );

  const backTutorial = () => {
    if (!!tutorialDetailsId) {
      setTutorialDetailsId(0);
    } else {
      history.push("/");
    }
  };

  const getPreviewImage = url => {
    const data = url.split(".");
    data.pop();
    let returnUrl = `${data
      .join(".")
      .replace(".s3.us-east", "-thumbnails.s3.us-east")}.jpg`;
    return returnUrl;
  };

  const tutorialDetails = useMemo(
    () => tutorial.find(x => x.tutorial_id === tutorialDetailsId),
    [tutorialDetailsId, tutorial]
  );
  return (
    <div className="blue-bg">
      <section className="sub-header filter-block">
        <div className="c-flex-between">
          <div className="back-arrow-title">
            <div className="sub-header-title align-items-center">
              <span
                className="back-arrow back-arrow-canvas"
                onClick={backTutorial}
              >
                <i className="fa-solid fa-arrow-left"></i>
              </span>
              <div className="d-flex">
                <h2 className="mb0">
                  {!!tutorialDetailsId ? tutorialDetails.title : "Tutorial"}
                </h2>
              </div>
            </div>
          </div>
          {!!!tutorialDetailsId && (
            <div>
              <div className="search">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <i className="bx bx-search-alt search-icon"></i>
              </div>
            </div>
          )}
        </div>
        {!!!tutorialDetailsId && (
          <div>
            {tags && !!tags.length && (
              <div className="p-2 my-2 d-flex flex-wrap">
                {tags?.map(tag => (
                  <div
                    key={tag}
                    className={`filter-box mt-2 ${
                      active.includes(tag) ? "activeTab" : ""
                    }`}
                    onClick={() => handleFilter(tag)}
                  >
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <div className="sub-container">
        <Card>
          <CardBody>
            {!!tutorialDetailsId ? (
              <TutorialDetails tutorialDetails={tutorialDetails} />
            ) : !!tutorial &&
              tutorial.filter(x => RegExp(`${search}`, "gi").test(x.title))
                .length > 0 ? (
              <>
                <Row>
                  {!!filteredTutorials.length ? (
                    filteredTutorials.map(tutorial => (
                      <Col className="p-2" key={tutorial.tutorial_id} lg={3}>
                        <div className="tutorial-card">
                          <div className="card-img">
                            <img
                              style={{ height: "185px" }}
                              alt="featuredImage"
                              src={
                                tutorial.featured_image_url
                                  ? getCloudFrontImgUrl(
                                      tutorial.featured_image_url
                                    )
                                  : !!tutorial.video_url
                                  ? getCloudFrontThumbnailUrl(
                                      getPreviewImage(tutorial.video_url)
                                    )
                                  : noThumbnail
                              }
                              className="w-100"
                            />
                          </div>
                          <div className="card-desc">
                            <h6>{tutorial.title}</h6>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: DomPurify.sanitize(tutorial.content),
                              }}
                            />
                            <span
                              className="read-more"
                              onClick={() => {
                                tutorial.button_link
                                  ? window.open(tutorial.button_link, "_blank")
                                  : setTutorialDetailsId(tutorial.tutorial_id);
                              }}
                            >
                              Read More &gt;
                            </span>
                          </div>
                        </div>
                      </Col>
                    ))
                  ) : (
                    <div>No tutorial available</div>
                  )}
                </Row>
              </>
            ) : (
              <>
                {loading ? (
                  <div>Please wait while data is loading...</div>
                ) : (
                  <div>No tutorial available</div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Tutorial;

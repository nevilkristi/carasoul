import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Label } from "reactstrap";
import { useDispatch } from "react-redux";

import axios from "axios";

import * as Yup from "yup";
import { useFormik } from "formik";

import CustomDropZone from "common/CustomDropzone";
import CommonButton from "common/Button";

import { videoField } from "store/actions";

import noThumbnail from "assets/images/noThumbnail.png";
import { toast } from "react-toastify";

const initialValues = {
  video: "",
};

const validationSchema = Yup.object().shape({
  video: Yup.string().required("Video link is required."),
});

const videoSupportInfoData = [
  {
    id: 1,
    label: "Apple TV",
    youtube: true,
    vimeo: true,
    mp4: true,
    caption: "",
  },
  {
    id: 2,
    label: "Android TV",
    youtube: false,
    vimeo: false,
    mp4: true,
    caption: "",
  },
  {
    id: 3,
    label: "Amazon Devices",
    youtube: false,
    vimeo: false,
    mp4: true,
    caption: "(Firestick, FireTV)",
  },
  {
    id: 4,
    label: "Roku",
    youtube: false,
    vimeo: false,
    mp4: true,
    caption: "",
  },
];

const VideoPreview = ({ src }) => {
  const type = useMemo(
    () =>
      src.includes("www.youtube.com")
        ? "youtube"
        : src.includes("vimeo.com")
        ? "vimeo"
        : "aws",

    [src]
  );
  return type === "aws" ? (
    <video className="slidr-video-preview icon-video" controls key={src}>
      <source src={src} type="video/mp4" />
      <source src={src} type="video/ogg" />
      <source src={src} type="video/ogg" />
      <source src={src} type="video/ogg" />
    </video>
  ) : (
    <>
      <iframe
        title="slidr-video"
        src={src}
        width="100%"
        height={320}
        frameBorder="0"
        allow="autoplay; picture-in-picture"
        allowFullScreen
      ></iframe>
    </>
  );
};

const getPreviewImage = async url => {
  const type = url.includes("www.youtube.com")
    ? "youtube"
    : url.includes("vimeo.com")
    ? "vimeo"
    : url.includes("amazonaws.com")
    ? "aws"
    : "default";

  switch (type) {
    case "youtube":
      const youtubeVideoId = url.split("/").pop();
      return `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
    case "vimeo":
      const vimeoVideoId = url.split("/").pop();
      try {
        const res = await axios.get(
          `https://vimeo.com/api/v2/video/${vimeoVideoId}.json`
        );
        if (res.status) {
          return res.data[0]?.thumbnail_large;
        }
      } catch (err) {
        return noThumbnail;
      }
      break;

    case "aws":
      const data = url.split(".");
      data.pop();
      const awsThumbUrl = `${data
        .join(".")
        .replace(".s3.us-east", "-thumbnails.s3.us-east")}.jpg`;
      return awsThumbUrl;
    default:
      return noThumbnail;
  }
};

const AddVideoModal = forwardRef(({ slideshow_id }, ref) => {
  const dispatch = useDispatch();

  const videoRef = useRef();

  const [isOpen, setIsOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setIsOpen(true),
    }),
    []
  );

  const onSubmit = async values => {
    if (!!videoRef.current?.isUploading) {
      toast.error("Please wait while video is uploading...");
      return;
    }
    const thumbUrl = await getPreviewImage(values.video);
    if (thumbUrl.includes("amazonaws.com")) checkImage(values, thumbUrl);
    else onSubmitSuccess(values, thumbUrl);
  };

  const onSubmitSuccess = (values, url) => {
    setLoading(false);
    dispatch(
      videoField({
        payload: {
          slideshow_id: slideshow_id,
          videoUrl: values.video,
          videoPreviewImageUrl: url,
        },
      })
    );
    onClose();
  };

  const onClose = () => {
    if (videoRef.current?.isUploading) {
      toast.error("Please wait while video is uploading...");
      return true;
    }
    resetForm({
      values: { ...initialValues },
    });
    setIsOpen(false);
  };

  const checkImage = (values, url) => {
    let count = 0;

    const checkThumb = async () => {
      count += 1;
      setLoading(true);
      try {
        const res = await axios.get(url);
        if (res.status) {
          onSubmitSuccess(values, url);
        }
      } catch (err) {
        if (count < 5) {
          setTimeout(() => {
            checkThumb(values, url);
          }, 1000);
        } else {
          setLoading(false);
          toast.error("Something went wrong, please try again");
        }
      }
    };
    checkThumb();
  };

  const { values, handleSubmit, setFieldValue, errors, resetForm } = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  const handleVideo = url => {
    setFieldValue("video", url);
  };
  const getYoutubeVideoId = url => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };
  const handleKeyUp = e => {
    let url = e.target?.value;
    if (url) {
      if (
        ["www.youtube.com", "youtu.be", "youtube.com"].some(item =>
          url.includes(item)
        )
      ) {
        const code = getYoutubeVideoId(url);
        const newUrl = `https://www.youtube.com/embed/${code || ""}`;
        setFieldValue("video", newUrl);
      } else if (["vimeo.com"].some(item => url.includes(item))) {
        const code = url.split("/").pop();
        const newUrl = `https://player.vimeo.com/video/${code}`;
        setFieldValue("video", newUrl);
      } else setFieldValue("video", url);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      centered
      className="slidr-modal add-video-modal"
      backdrop="static"
    >
      <ModalHeader toggle={onClose}>Upload Video</ModalHeader>
      <form onSubmit={handleSubmit} id="slidr-image-upload-form">
        <ModalBody>
          <CustomDropZone
            ref={videoRef}
            type="video"
            src={values.video}
            handleOnDrop={handleVideo}
            accept=".mp4"
            folderName={process.env.REACT_APP_AWS_FOLDER_VIDEOS}
            bucketName={process.env.REACT_APP_AWS_BUCKET_SLIDR}
            error={!!errors.video}
            errorMessage={errors.video}
            showPreview={false}
            handleSwitch={resetForm}
            handleKeyUp={handleKeyUp}
          />

          {values.video && <VideoPreview src={values.video} />}

          <p className="info mb-3">
            (Recommended Video Length: 30 Seconds - 15 Minutes, Recommended
            Video Quality: 1080P, Recommended Video Dimension: 16:9)
          </p>
          <Label>Supported Video Formats By Devices</Label>
          <div className="table-responsive">
            <table className="video-support-info-table table">
              <thead>
                <tr>
                  <th></th>
                  <th className="text-center">Youtube</th>
                  <th className="text-center">Vimeo</th>
                  <th className="text-center">.Mp4</th>
                </tr>
              </thead>
              <tbody>
                {videoSupportInfoData.map(
                  ({ id, caption, label, mp4, vimeo, youtube }) => (
                    <tr key={id}>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="heading">{label}</span>
                          {!!caption && (
                            <span className="sub-heading">{caption}</span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        {youtube ? (
                          <i className="bx bx-comment-check text-success" />
                        ) : (
                          <i className="bx bx-x text-gray" />
                        )}
                      </td>
                      <td className="text-center">
                        {vimeo ? (
                          <i className="bx bx-comment-check text-success" />
                        ) : (
                          <i className="bx bx-x text-gray" />
                        )}
                      </td>
                      <td className="text-center">
                        {mp4 ? (
                          <i className="bx bx-comment-check text-success" />
                        ) : (
                          <i className="bx bx-x text-gray" />
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="text-end">
            <CommonButton
              btnType="submit"
              btnForm="slidr-image-upload-form"
              btnClass="px-3"
              btnDisabled={loading}
              btnText={loading ? "Loading..." : "Add New Video In Slide"}
            />
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
});

export default AddVideoModal;

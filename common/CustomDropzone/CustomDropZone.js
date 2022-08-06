import React, {
  useCallback,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { FormFeedback, Input, Label, Progress } from "reactstrap";
import { useDropzone } from "react-dropzone";
import { s3 } from "services/aws";
import { getCloudFrontImgUrl } from "utils/cloudFrontUrl";
import { toast } from "react-toastify";

const Video = ({ src }) => {
  return (
    <video controls className="video" key={src}>
      <source src={src} type="video/mp4" />
      <source src={src} type="video/ogg" />
      <source src={src} type="video/ogg" />
      <source src={src} type="video/ogg" />
    </video>
  );
};

const CustomDropZone = forwardRef(
  (
    {
      label,
      handleOnDrop,
      src,
      accept = "image/*",
      folderName,
      type = "image",
      bucketName,
      error,
      errorMessage,
      handleKeyUp,
      name,
      withBottomMargin = true,
      showPreview = true,
      handleSwitch = () => {},
    },
    ref
  ) => {
    const [progress, setProgress] = useState({
      0: 0,
    });
    const [totalFiles, setTotalFiles] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isVideoLink, setIsVideoLink] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        isUploading,
      }),
      [isUploading]
    );

    const progressValue = useMemo(() => {
      const values = Object.values(progress);
      return values.reduce((a, b) => a + b, 0) / totalFiles;
    }, [progress, totalFiles]);

    useEffect(() => {
      if (progressValue === 100 && isUploading) {
        setIsUploading(false);
        setProgress({ 0: 0 });
        setTotalFiles(0);
      }
    }, [progressValue, isUploading]);

    const onDrop = useCallback(
      acceptedFiles => {
        setTotalFiles(acceptedFiles.length);

        const file = acceptedFiles[0];
        if (!!file) {
          setIsUploading(true);
          const fileName = file.name
            .split(".")
            .slice(0, -1)
            .join(".")
            .replace(/[\s()]/g, "_");

          const fileExtension = file.name.split(".")[1];

          const currentTime = file.lastModified;

          const fileFullName =
            fileName + "_" + currentTime + "." + fileExtension;

          const params = {
            ACL: "public-read",
            Key: fileFullName,
            ContentType: file.type,
            Body: file,
          };

          s3(folderName, bucketName)
            .upload(params)
            .on("httpUploadProgress", function (evt) {
              const value = Math.round((evt.loaded / evt.total) * 100);
              setProgress({ 0: value });
            })
            .send(function (err, data) {
              if (err) {
                return;
              }
              handleOnDrop(data.Location);
              setIsUploading(false);
            });
        }
      },
      [folderName, bucketName, handleOnDrop]
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } =
      useDropzone({
        onDrop,
        accept,
        multiple: false,
      });
    useEffect(() => {
      if (
        fileRejections &&
        fileRejections.length &&
        fileRejections[0]?.errors[0]?.message
      ) {
        toast.error(fileRejections[0].errors[0].message);
      }
    }, [fileRejections]);
    return (
      <div className={`${withBottomMargin ? "mb-3" : ""}`}>
        <div className="mb-2">
          {!!label && <Label className="mb-0">{label}</Label>}
          {type === "video" && (
            <div className="custom-switch-row d-flex align-items-center justify-content-between">
              <div className="mb-0" htmlFor="is_arrow">
                Do you want to put video link instead ?
              </div>
              <div className="form-check form-switch form-switch-md custom-switch ms-1">
                <input
                  disabled={isUploading}
                  type="checkbox"
                  className="form-check-input cursor-pointer"
                  id="is_arrow"
                  checked={isVideoLink}
                  onChange={e => {
                    setIsVideoLink(e.target.checked);
                    handleSwitch();
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {isVideoLink ? (
          <>
            <div className="mb-3">
              <Input
                type="url"
                value={src}
                name={name || "video"}
                placeholder={"Video Link"}
                onKeyUp={handleKeyUp}
                onChange={e => {
                  handleOnDrop(e.target.value);
                }}
                invalid={error && !!errorMessage}
              />
              <FormFeedback>{errorMessage}</FormFeedback>
            </div>
          </>
        ) : (
          <>
            <div className={"d-flex align-items-center"}>
              <div
                {...getRootProps()}
                className="dropzone-area d-flex align-items-center justify-content-center"
                style={{
                  borderColor: error
                    ? "#F46A6A"
                    : isDragActive
                    ? "rgba(52, 195, 143)"
                    : "#ced4da",
                }}
              >
                <input {...getInputProps()} disabled={isUploading} />
                {error && !!errorMessage ? (
                  <span className="text-danger text-capitalize text-center">
                    {errorMessage}
                  </span>
                ) : isDragActive ? (
                  <p className="mb-0 text-center">Drop {type} here...</p>
                ) : (
                  <p className="mb-0 text-center">
                    Drag and drop your {type} here...
                  </p>
                )}
              </div>
              {!!src &&
                (type === "image" ? (
                  <div className="image-container me-2">
                    <img
                      className="ms-2 icon-image"
                      src={getCloudFrontImgUrl(src)}
                      alt="icon"
                    />
                    <button
                      type="button"
                      className="close-icon text-white p-0 bg-danger"
                      onClick={() => handleOnDrop("")}
                    >
                      <i className="bx bx-x" />
                    </button>
                  </div>
                ) : type === "video" && showPreview ? (
                  <div className="video-box ms-2">
                    <Video src={src} className="icon-video" />
                    <button
                      type="button"
                      className="close-icon text-white p-0 bg-danger me-2"
                      onClick={() => handleOnDrop("")}
                    >
                      <i className="bx bx-x" />
                    </button>
                  </div>
                ) : type === "zip" ? (
                  <div className="image-container ms-2 ">
                    <div className="h-100 w-100 d-flex align-items-center justify-content-center">
                      <i className="fas fa-file-archive fa-6x" />
                    </div>
                    <button
                      type="button"
                      className="close-icon text-white p-0 bg-danger me-2"
                      onClick={() => handleOnDrop("")}
                    >
                      <i className="bx bx-x" />
                    </button>
                  </div>
                ) : type === "document" ? (
                  <></>
                ) : null)}
            </div>
            {isUploading && (
              <div className="mt-1">
                <Progress value={progressValue} className="progress-xl">
                  {progressValue.toFixed(0)}%
                </Progress>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);
export default CustomDropZone;

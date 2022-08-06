import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import ModalVideo from "react-modal-video";
import { setModalPreview } from "store/actions";
const VideoPreview = () => {
  const { modalPreview, slides, activeSlide } = useSelector(
    state => state.slidr
  );
  const dispatch = useDispatch();
  const videoMeta = useMemo(() => {
    const currentSlide = slides.find(slide => slide?.id === activeSlide);
    if (!!currentSlide) {
      const videoUrl = currentSlide.videoUrl;
      const type = currentSlide.videoUrl.includes("youtube.com")
        ? "youtube"
        : currentSlide.videoUrl.includes("vimeo.com")
        ? "vimeo"
        : "custom";
      if (["youtube", "vimeo"].includes(type))
        return {
          videoId: videoUrl.split("/").pop(),

          channel: type,
        };
      else
        return {
          url: videoUrl,

          channel: type,
        };
    } else return null;
  }, [slides, activeSlide]);

  return (
    <ModalVideo
      {...videoMeta}
      isOpen={modalPreview}
      onClose={() => dispatch(setModalPreview(false))}
      allowFullScreen={true}
    />
  );
};
export default VideoPreview;

import React, { useEffect } from "react";
import Settings from "modules/slidr/components/topBar";
import LeftBar from "modules/slidr/components/leftBar";
import CenterBar from "modules/slidr/components/centerBar";
import RightBar from "modules/slidr/components/rightBar";
import { useDispatch, useSelector } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import VideoPreview from "./components/centerBar/components/modalPreview";
import { getSlideshow } from "./store/actions";
import Loader from "common/Loader";

const Slidr = ({ match }) => {
  const dispatch = useDispatch();
  const slideshow_id = !!match.params.slideshow_id
    ? match.params.slideshow_id
    : 0;
  const { activeField, loadingGetSlideshow } = useSelector(
    state => state.slidr
  );

  useEffect(() => {
    if (slideshow_id) {
      dispatch(getSlideshow(slideshow_id));
    }
  }, [slideshow_id, dispatch]);

  return (
    <>
      {loadingGetSlideshow ? (
        <Loader />
      ) : (
        <div className="slidr h-100 w-100">
          <div className="slidr-width">
            <VideoPreview />
            <Settings slideshow_id={slideshow_id} />
            <div className="d-flex">
              <DndProvider backend={HTML5Backend}>
                <LeftBar slideshow_id={slideshow_id} />
                <CenterBar />
              </DndProvider>
              {!!activeField && <RightBar />}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Slidr;

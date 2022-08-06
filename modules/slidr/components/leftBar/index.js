import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, UncontrolledTooltip } from "reactstrap";
import {
  deleteSlide,
  setActiveSlide,
  setSlides,
  copySlide,
  addSlide,
} from "store/actions";
import { Container } from "modules/slidr/components/centerBar";

import { useDrag, useDrop } from "react-dnd";
import clonedeep from "lodash.clonedeep";
import update from "immutability-helper";
import Alert from "common/Alert";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";

const type = "SLIDE";

const Slide = ({
  slide,
  index,
  onCopy,
  onDelete,
  onSelect,
  moveSlide,
  slidesLength,
  slidrLeftRef,
  activeSlideIndex,
  slideshowId,
}) => {
  const ref = useRef(null);
  const dispatch = useDispatch();

  const { activeSlide, settings, loadingDeleteSlide, loadingCopySlide } =
    useSelector(state => state.slidr);

  const selected = useMemo(
    () => slide.id === activeSlide,
    [activeSlide, slide]
  );

  const [{ isDragging }, drag] = useDrag({
    type,
    item: () => {
      return { id: slide.id, index };
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [_, drop] = useDrop({
    accept: type,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveSlide(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  drag(drop(ref));

  useEffect(() => {
    if (selected) {
      const delta = activeSlideIndex * (140 + 16);
      slidrLeftRef.current.scrollTop = delta;
    }
  }, [selected, activeSlideIndex, slidrLeftRef]);
  return (
    <>
      {" "}
      <ContextMenuTrigger id={slide.id.toString()}>
        <div
          className={`d-flex slide mb-3 ${isDragging ? "opacity-0" : ""} ${
            settings.presentationSize === 2 ? "small-box-size" : ""
          }`}
          ref={ref}
        >
          <div className="d-flex justify-content-between align-items-center flex-column me-2">
            <span className={`slide-number `}>{index + 1}</span>
            <div
              className={`d-flex flex-column slide-actions  ${
                selected ? "text-theme" : ""
              }  `}
            >
              <i
                className={`mb-3 bx ${
                  loadingCopySlide.status &&
                  loadingCopySlide.slide_id === slide.id
                    ? "bx-loader"
                    : "bx-copy"
                }`}
                id={`copy_${slide.id}`}
                onClick={() => {
                  if (loadingCopySlide.slide_id !== slide.id) {
                    onCopy(slide.id);
                  }
                }}
              />
              <UncontrolledTooltip placement="top" target={`copy_${slide.id}`}>
                Duplicate
              </UncontrolledTooltip>
              <i
                className={`bx ${
                  loadingDeleteSlide.status &&
                  loadingDeleteSlide.slide_id === slide.id
                    ? "bx-loader"
                    : "bx-trash-alt"
                } ${slidesLength === 1 ? "disabled " : ""}`}
                id={`delete_${slide.id}`}
                onClick={() => {
                  if (slidesLength === 1) return;
                  onDelete(slide.id);
                }}
              />
              <UncontrolledTooltip
                placement="top"
                target={`delete_${slide.id}`}
              >
                Delete
              </UncontrolledTooltip>
            </div>
          </div>

          <div
            className={`flex-grow-1 overflow-hidden shadow-sm cursor-pointer slide-box ${
              selected ? "selected" : ""
            } `}
            onContextMenu={e => {
              e.preventDefault();
            }}
            onClick={e => onSelect(slide.id)}
          >
            <Container slide={slide} withDrag={false} grids={false} />
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenu id={slide.id.toString()}>
        <MenuItem
          data={{ foo: "bar" }}
          onClick={() => dispatch(addSlide(slideshowId, slide.id))}
        >
          Add Slide
        </MenuItem>
        <MenuItem
          data={{ foo: "bar" }}
          onClick={() => {
            onCopy(slide.id);
          }}
        >
          Duplicate Slide
        </MenuItem>
        <MenuItem
          data={{ foo: "bar" }}
          onClick={() => {
            onDelete(slide.id);
          }}
        >
          Delete Slide
        </MenuItem>
      </ContextMenu>
    </>
  );
};

const LeftBar = ({ slideshow_id }) => {
  const { slides, activeSlide, newSlides, loadingDeleteSlide } = useSelector(
    state => state.slidr
  );

  const [isOpenAlert, setIsOpenAlert] = useState(false);
  const [deleteSlideId, setDeleteSlideId] = useState(0);
  const slidrLeftRef = useRef();
  const dispatch = useDispatch();

  const handleSelect = id => {
    dispatch(setActiveSlide(id));
  };

  const handleCopy = slide_id => {
    dispatch(copySlide({ slideshow_id: slideshow_id, slide_id: slide_id }));
  };

  const handleDelete = id => {
    setIsOpenAlert(true);
    setDeleteSlideId(id);
  };
  const confirmed = () => {
    dispatch(
      deleteSlide({
        slide_id: deleteSlideId,
        callBack: () => {
          setDeleteSlideId(0);
          setIsOpenAlert(false);
        },
      })
    );
  };

  const moveSlide = useCallback(
    (dragIndex, hoverIndex) => {
      const updatedSlides = clonedeep(slides);
      const dragSlide = updatedSlides[dragIndex];
      dispatch(
        setSlides(
          update(updatedSlides, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, dragSlide],
            ],
          })
        )
      );
    },
    [slides, dispatch]
  );

  return (
    <div className="slidr-left-bar shadow-sm bg-white" ref={slidrLeftRef}>
      <Card className="bg-transparent">
        <CardBody>
          {!!slides && slides.length > 0 ? (
            <>
              {slides.map((slide, index) => (
                <Slide
                  key={slide.id}
                  slide={slide}
                  index={index}
                  onCopy={() => handleCopy(slide.id)}
                  onDelete={handleDelete}
                  onSelect={handleSelect}
                  moveSlide={moveSlide}
                  slidesLength={slides.length}
                  slidrLeftRef={slidrLeftRef}
                  activeSlideIndex={slides.findIndex(x => x.id === activeSlide)}
                  slideshowId={slideshow_id}
                />
              ))}

              {[...Array(newSlides).keys()].map(i => (
                <div key={i} className={`d-flex slide mb-3 placeholder-glow`}>
                  <div className="d-flex justify-content-between align-items-center flex-column">
                    <span className={`slide-number `}>
                      {slides.length + i + 1}
                    </span>
                    <div
                      className={`d-flex flex-column  slide-actions   me-2 `}
                    >
                      <i
                        className={`bx bx-copy mb-3
                     `}
                      />
                      <i className={`bx bx-trash-alt `} />
                    </div>
                  </div>
                  <div
                    className={`flex-grow-1 overflow-hidden shadow-sm cursor-pointer placeholder slide-box border-0`}
                  >
                    <div></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center"> No slide available</div>
          )}
          <Alert
            isOpen={isOpenAlert}
            onClose={() => setIsOpenAlert(false)}
            alertHeaderText="Delete Slide"
            confirmed={confirmed}
            alertDescriptionText="Are you sure you want to delete this slide?"
            loading={loadingDeleteSlide}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default LeftBar;

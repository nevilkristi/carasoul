import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveField,
  setTextFieldValue,
  setIsImageSelect,
  setModalPreview,
} from "store/actions";
import { Resizable } from "re-resizable";
import Draggable from "react-draggable";

import { Editor } from "@tinymce/tinymce-react";

import DomPurify from "dompurify";
import {
  getCloudFrontImgUrl,
  getCloudFrontThumbnailUrl,
} from "utils/cloudFrontUrl";

let resize = {
  x: 0,
  y: 0,
  height: "0px",
  width: "0px",
};

let drag = {
  x: 0,
  y: 0,
};

const Div = ({
  isActive,
  size,
  onResizeStop,
  onDragStop,
  children,
  onResize,
  onResizeStart,
  withDrag,
  ...rest
}) => {
  return isActive && withDrag ? (
    <Resizable
      bounds="parent"
      size={size}
      onResizeStart={onResizeStart}
      onResize={onResize}
      onResizeStop={onResizeStop}
      handleClasses={{
        top: "resize resize-top",
        bottom: "resize resize-bottom",
        left: "resize resize-left",
        right: "resize resize-right",
        topLeft: "resize resize-top-left",
        topRight: "resize resize-top-right",
        bottomLeft: "resize resize-bottom-left",
        bottomRight: "resize resize-bottom-right",
      }}
      {...rest}
    >
      {children}
    </Resizable>
  ) : (
    <div {...rest}>{children}</div>
  );
};

const DraggableDiv = ({
  children,
  withDrag,
  onStop,
  onStart,
  isDisabled,
  position,
  onDrag,
}) => {
  return withDrag ? (
    <Draggable
      position={position}
      bounds="parent"
      onStop={onStop}
      onStart={onStart}
      disabled={isDisabled}
      handle="#handle"
      onDrag={onDrag}
    >
      {children}
    </Draggable>
  ) : (
    children
  );
};
const Input = ({ textField, setInputField, maxHeight }) => {
  const ref = useRef();
  const dispatch = useDispatch();
  const [height, setHeight] = useState(+textField.height.replace("px", ""));

  useEffect(() => {
    if (+textField.height.replace("px", "") !== height)
      dispatch(
        setTextFieldValue({
          key: "height",
          value: `${height}px`,
          id: textField.id,
        })
      );
  }, [height, textField, dispatch]);
  const changeText = e => {
    dispatch(
      setTextFieldValue({
        id: textField.id,
        key: "text",
        value: e,
      })
    );
  };

  return (
    <div
      style={{
        height: "100%",
        ...(!!textField.backgroundColor
          ? {
              backgroundColor: `rgb(${Object.values(
                textField.backgroundColor
              ).join(",")})`,
            }
          : {}),
      }}
    >
      <Editor
        ref={ref}
        inline={true}
        value={textField.text}
        onEditorChange={changeText}
        onClick={e => e.stopPropagation()}
        onKeyUp={e => {
          setHeight(e.target.offsetHeight);
          ref.current.elementRef.current.scrollTop =
            ref.current.elementRef.current.scrollHeight;
        }}
        onKeyDown={e => e.stopPropagation()}
        onFocus={() => {
          ref.current.editor.selection.select(
            ref.current.editor.getBody(),
            true
          );
          ref.current.editor.selection.collapse(false);
          ref.current.elementRef.current.scrollTop =
            ref.current.elementRef.current.scrollHeight;
        }}
        onBlur={e => {
          e.stopImmediatePropagation();
          setInputField("");
          if (ref.current?.editor?.destroy)
            setTimeout(ref.current.editor.destroy);
        }}
        init={{
          selector: "textarea",
          toolbar: [
            "undo redo | bold italic underline | fontselect fontsizeselect",
            "forecolor backcolor | alignleft aligncenter alignright alignfull | lineheight ",
          ],
          formats: {
            bold: {
              inline: "span",
              styles: { "font-weight": "bold" },
            },
            italic: {
              inline: "span",
              styles: { "font-style": "italic" },
            },
          },
          font_formats:
            "Andale Mono = andalemono;Arial=arial;Baskerville=baskerville;Calibri=calibri;Bodoni=bodoni;Cambria=cambria;Comic Sans MS=comicsansms;Courier New=couriernew;Futura=futura;Franklin Gothic=franklingothic;Garamond=garamond;Georgia=georgia;Gotham=gotham;Helvetica=helvetica;Impact=impact;Myriad=myriad;Rockwell=rockwell;Symbol=symbol;Tahoma=tahoma;Terminal=terminal;Times New Roman=timesnewroman;Trebuchet MS=trebuchetms;Verdana=verdana",
          menubar: false,
          lineheight_formats: "14pt 18pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt",
          fontsize_formats:
            "8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 22pt 24pt 26pt 28pt 30pt 36pt 42pt 48pt 60pt 72pt 84pt 96pt 108pt 114pt 120pt 125pt",
          auto_focus: true,
          plugins: "importcss",
          content_style: `.mce-content-body { 
                      outline: none;
                      border : none;
                      text-align: ${textField.textAlign};
                      font-family: ${textField.fontFamily};
                      font-size: ${textField.fontSize};
                      line-height: ${textField.lineHeight};
                      color: ${textField.color};
                      scroll-behavior: smooth;
                      max-height: ${maxHeight}px;
                      overflow-y: auto;
                      opacity: ${textField.opacity}%;
                      border-color: ${textField.borderColor};
                      border-width: ${textField.borderWidth};
                      border-radius: ${textField.borderRadius};
                      border-style: ${textField.borderStyle};
                      transform: rotate(${textField.rotate}deg);
                      ${textField.isBold ? "font-weight: bold;" : ""};
                      ${
                        textField.isUnderline
                          ? "text-decoration: underline;"
                          : ""
                      };
                      ${textField.isItalic ? "font-style: italic;" : ""}
                    },`,
        }}
      />
    </div>
  );
};
const TextField = ({
  textField,
  dispatch,
  withDrag,
  presentationSize,
  activeField,
  dragged,
  changeDrag,
}) => {
  const [dragging, setDragging] = useState("");
  const [inputFieldId, setInputField] = useState("");
  const onResize = (e, direction, ref, d) => {
    const height = +resize.height.replace("px", "") + d.height;
    const width = +resize.width.replace("px", "") + d.width;
    handleChange("height", `${height}px`);
    handleChange("width", `${width}px`);
    if (["top", "topRight"].includes(direction)) {
      handleChange("translate", {
        x: resize.x,
        y: resize.y - d.height,
      });
    } else if (direction === "topLeft") {
      handleChange("translate", {
        x: resize.x - d.width,
        y: resize.y - d.height,
      });
    } else if (["left", "bottomLeft"].includes(direction)) {
      handleChange("translate", {
        x: resize.x - d.width,
        y: resize.y,
      });
    } else {
    }
  };
  const onDragStart = (e, data) => {
    drag.x = data.x;
    drag.y = data.y;
  };
  const onDragStop = (e, data, id) => {
    if (drag.x !== data.x || drag.y !== data.y)
      dispatch(
        setTextFieldValue({
          key: "translate",
          value: { x: data.x, y: data.y },
          id,
          isImage: false,
        })
      );
    setDragging("");
  };

  const onResizeStart = textField => {
    resize.x = textField.translate.x;
    resize.y = textField.translate.y;
    resize.height = textField.height;
    resize.width = textField.width;
  };
  const onResizeStop = () => {
    resize.x = 0;
    resize.y = 0;
    resize.height = "0px";
    resize.width = "0px";
  };

  const handleTextFieldClick = id => {
    dispatch(setActiveField(id));
  };

  const handleChange = (key, value) => {
    dispatch(
      setTextFieldValue({
        key,
        value,
      })
    );
  };
  const maxHeight = useMemo(
    () => 720 - textField.translate.y,
    [textField.translate.y]
  );
  return (
    <DraggableDiv
      position={{
        x: textField.translate.x,
        y: textField.translate.y,
      }}
      withDrag={true}
      key={textField.id}
      onDrag={(e, data) => {
        e.stopPropagation();
        setDragging(textField.id);
        changeDrag(textField.id);
      }}
      onStart={onDragStart}
      onStop={(e, data) => onDragStop(e, data, textField.id)}
      isDisabled={inputFieldId === textField.id}
    >
      <Div
        withDrag={withDrag}
        onResize={onResize}
        onResizeStart={() => onResizeStart(textField)}
        onResizeStop={onResizeStop}
        size={{
          width: textField.width,
          height: textField.height,
        }}
        isActive={textField.id === activeField}
        className={`${
          textField.id === activeField && withDrag ? "border border-theme" : ""
        } `}
        style={{
          position: textField.position,
          transform: `translate(${textField.translate.x}px,${textField.translate.y}px)`,
          zIndex: textField.zIndex,
          width: textField.width,
          height: textField.height,
        }}
      >
        {inputFieldId === textField.id ? (
          <Input
            textField={textField}
            setInputField={setInputField}
            maxHeight={maxHeight}
          />
        ) : (
          <>
            <div
              onMouseUp={e => {
                e.stopPropagation();
                if (!!!dragged) {
                  dispatch(setIsImageSelect(false));
                  if (activeField !== textField.id) {
                    handleTextFieldClick(textField.id);
                  }
                } else {
                  if (dragged === textField.id) changeDrag(0);
                }
              }}
              onClick={e => {
                e.stopPropagation();
              }}
              onDoubleClick={e => {
                e.stopPropagation();
                setInputField(textField.id);
              }}
              id="handle"
              style={{
                textAlign: textField.textAlign,
                fontFamily: textField.fontFamily,
                fontSize: textField.fontSize,
                lineHeight: textField.lineHeight,
                color: textField.color,
                ...(textField.backgroundColor
                  ? {
                      backgroundColor: `rgba(${Object.values(
                        textField.backgroundColor
                      ).join(",")})`,
                    }
                  : {}),
                opacity: `${textField.opacity}%`,
                borderColor: textField.borderSettings
                  ? textField.borderColor
                  : "",
                borderWidth: textField.borderSettings
                  ? textField.borderWidth
                  : "",
                borderRadius: textField.borderSettings
                  ? textField.borderRadius
                  : "",
                borderStyle: textField.borderSettings
                  ? textField.borderStyle
                  : "",
                transform: `${
                  !!textField.rotate ? `rotate(${textField.rotate}deg)` : ""
                }`,
                ...(textField.isBold ? { fontWeight: "bold" } : {}),
                ...(textField.isUnderline
                  ? { textDecoration: "underline" }
                  : {}),
                ...(textField.isItalic ? { fontStyle: "italic" } : {}),
                width: "100%",
                height: "100%",
              }}
              dangerouslySetInnerHTML={{
                __html:
                  !!textField.text && !["<p></p>", ""].includes(textField.text)
                    ? DomPurify.sanitize(textField.text)
                    : `<p>${textField.placeholder}</p>`,
              }}
            />
          </>
        )}

        {dragging === textField.id && (
          <>
            <span className="slidr-border-top" />
            <span className="slidr-border-right" />
            <span className="slidr-border-bottom" />
            <span className="slidr-border-left" />
          </>
        )}
      </Div>
    </DraggableDiv>
  );
};
const TextFields = ({
  dispatch,
  slide,
  withDrag,
  activeField,
  presentationSize,
  dragged,
  changeDrag,
}) => {
  return (
    <>
      {!!slide &&
        slide?.textFields &&
        slide.textFields.length > 0 &&
        slide.textFields.map(textField => (
          <TextField
            key={textField.id}
            textField={textField}
            dispatch={dispatch}
            withDrag={withDrag}
            presentationSize={presentationSize}
            activeField={activeField}
            dragged={dragged}
            changeDrag={changeDrag}
          />
        ))}
    </>
  );
};

const ImageFields = ({
  slide,
  withDrag,
  dispatch,
  activeField,
  presentationSize,
  dragged,
  changeDrag,
}) => {
  return (
    <>
      {" "}
      {slide &&
        slide?.imageFields &&
        slide.imageFields.length > 0 &&
        slide.imageFields.map(image => (
          <ImageField
            key={image.id}
            image={image}
            withDrag={withDrag}
            dispatch={dispatch}
            activeField={activeField}
            presentationSize={presentationSize}
            dragged={dragged}
            changeDrag={changeDrag}
          />
        ))}
    </>
  );
};

const ImageField = ({
  image,
  withDrag,
  dispatch,
  activeField,
  presentationSize,
  dragged,
  changeDrag,
}) => {
  const [dragging, setDragging] = useState("");

  const onImageDragStart = (e, data) => {
    drag.x = data.x;
    drag.y = data.y;
  };
  const onImageDragStop = (e, data, id) => {
    let payload = {
      key: "translate",
      value: { x: data.x, y: data.y },
      id: id,
      isImage: true,
    };
    dispatch(setTextFieldValue(payload));
    setDragging("");
  };
  const onResizeImage = (e, direction, ref, d) => {
    const height = +resize.height.replace("px", "") + d.height;
    const width = +resize.width.replace("px", "") + d.width;

    handleChange("height", `${height}px`);
    handleChange("width", `${width}px`);
    if (["top", "topRight"].includes(direction)) {
      handleChange("translate", {
        x: resize.x,
        y: resize.y - d.height,
      });
    } else if (direction === "topLeft") {
      handleChange("translate", {
        x: resize.x - d.width,
        y: resize.y - d.height,
      });
    } else if (["left", "bottomLeft"].includes(direction)) {
      handleChange("translate", {
        x: resize.x - d.width,
        y: resize.y,
      });
    } else {
    }
  };
  const onImageResizeStart = imageField => {
    resize.x = imageField.translate.x;
    resize.y = imageField.translate.y;
    resize.height = imageField.height;
    resize.width = imageField.width;
  };
  const onImageResizeStop = () => {
    resize.x = 0;
    resize.y = 0;
    resize.height = "0px";
    resize.width = "0px";
  };
  const handleTextFieldClick = id => {
    dispatch(setActiveField(id));
  };
  const handleChange = (key, value) => {
    dispatch(
      setTextFieldValue({
        key,
        value,
      })
    );
  };

  return (
    <DraggableDiv
      position={{
        x: image.translate.x,
        y: image.translate.y,
      }}
      withDrag={false}
      key={image.id}
      onDrag={() => {
        setDragging(image.id);
        changeDrag(image.id);
      }}
      onStart={onImageDragStart}
      onStop={(e, data) => onImageDragStop(e, data, image.id)}
    >
      <Div
        onResize={onResizeImage}
        onResizeStart={() => onImageResizeStart(image)}
        onResizeStop={onImageResizeStop}
        withDrag={false}
        size={{
          width: image.width,
          height: image.height,
        }}
        isActive={image.id === activeField}
        className={`${image.id === activeField ? "border border-theme" : ""} `}
        style={{
          position: image.position,
          transform: `translate(${image.translate.x}px,${
            image.translate.y
          }px)  ${!!image.rotate ? `rotate(${image.rotate}deg)` : ""}`,
          zIndex: image.zIndex,
          width: image.width,
          height: image.height,
          fontSize: "25px",
        }}
      >
        <div
          onClick={e => {
            e.stopPropagation();
          }}
          onMouseUp={e => {
            e.stopPropagation();
            if (!!!dragged) {
              handleTextFieldClick(image.id);
              dispatch(setIsImageSelect(true));
            } else {
              if (dragged === image.id) changeDrag(0);
            }
          }}
          id="handle"
          style={{
            textAlign: image.textAlign,
            fontFamily: image.fontFamily,
            fontSize: image.fontSize,
            lineHeight: image.lineHeight,
            color: image.color,

            // transform: `${!!image.rotate ? `rotate(${image.rotate}deg)` : ""}`,
            width: "100%",
            height: "100%",
          }}
        >
          <img
            alt="imageField"
            className="user-drag-none"
            src={getCloudFrontImgUrl(image.src)}
            style={{
              height: "100%",
              width: "100%",
              // objectFit: "cover",
              // objectPosition: "center",

              opacity: `${image.opacity}%`,

              borderColor: image.borderSettings ? image.borderColor : "",
              borderWidth: image.borderSettings ? image.borderWidth : "",
              borderRadius: image.borderSettings ? image.borderRadius : "",
              borderStyle: image.borderSettings ? image.borderStyle : "",
            }}
          />
        </div>
        {dragging === image.id && (
          <>
            <span className="slidr-border-top" />
            <span className="slidr-border-right" />
            <span className="slidr-border-bottom" />
            <span className="slidr-border-left" />
          </>
        )}
      </Div>
    </DraggableDiv>
  );
};

const VideoField = ({ slide, dispatch }) => {
  return (
    <>
      {" "}
      {slide && slide.videoUrl && (
        <React.Fragment>
          <i
            onClick={() => dispatch(setModalPreview(true))}
            className="bx bx-play-circle"
            style={{
              color: "white",
              position: "absolute",
              top: "35%",
              left: "43%",
              cursor: "pointer",
              fontSize: "200px",
              zIndex: 9999,
            }}
          ></i>
          <img
            alt="videoPreviewImage"
            src={getCloudFrontThumbnailUrl(slide.videoPreviewImageUrl)}
            style={{
              height: "100%",
              width: "100%",
              position: "absolute",
              inset: 0,
              objectPosition: "center",
              objectFit: "contain",
              top: 0,
              left: 0,
            }}
          />
        </React.Fragment>
      )}
    </>
  );
};

export const Container = ({ slide, withDrag = true, grids = true }) => {
  const { activeField, settings } = useSelector(state => state.slidr);
  const [dragged, setDragged] = useState(0);
  const dispatch = useDispatch();

  const handleOutsideClick = () => {
    if (!!!dragged) {
      dispatch(setActiveField(""));
      dispatch(setIsImageSelect(false));
    } else {
      setDragged(0);
    }
  };

  const gridSize = useMemo(
    () =>
      settings.presentationSize === 1
        ? (1280 * 720) / 6400
        : (960 * 720) / 6400,
    [settings]
  );

  const changeDrag = useCallback(value => {
    setDragged(value);
  }, []);

  return (
    <React.Fragment>
      {slide ? (
        <section
          id={slide.id}
          className="main-container"
          onClick={handleOutsideClick}
          style={{
            ...(slide.backgroundType === "image"
              ? !!slide.backgroundImage
                ? {
                    backgroundImage: `url("${slide.backgroundImage}")`,
                    backgroundPosition: slide.backgroundPosition,
                    backgroundSize: slide.backgroundSize,
                    backgroundRepeat: slide.backgroundRepeat,
                  }
                : {}
              : !!slide.backgroundColor
              ? {
                  backgroundColor:
                    typeof slide.backgroundColor === "string"
                      ? slide.backgroundColor
                      : `rgba(${Object.values(slide.backgroundColor).join(
                          ","
                        )})`,
                }
              : {}),
            height: "720px",
            width: settings.presentationSize === 1 ? "1280px" : "960px",
          }}
        >
          {settings.grids && grids && (
            <>
              {[...Array(gridSize).keys()].map((x, index) => (
                <div key={index} className="grid-block"></div>
              ))}
            </>
          )}
          <TextFields
            withDrag={withDrag}
            dispatch={dispatch}
            activeField={activeField}
            slide={slide}
            presentationSize={settings.presentationSize}
            dragged={dragged}
            changeDrag={changeDrag}
          />
          <ImageFields
            slide={slide}
            dispatch={dispatch}
            withDrag={withDrag}
            activeField={activeField}
            dragged={dragged}
            changeDrag={changeDrag}
          />
          <VideoField slide={slide} dispatch={dispatch} />
        </section>
      ) : (
        <></>
      )}
    </React.Fragment>
  );
};

const CenterBar = () => {
  const { slides, activeSlide, activeField } = useSelector(
    state => state.slidr
  );

  const currentSlide = useMemo(
    () => slides.find(slide => slide.id === activeSlide),
    [slides, activeSlide]
  );

  return (
    <Card className="slidr-center-bar bg-light-gray flex-grow-1 d-flex align-items-center my-4">
      <div
        className={`slidr-container shadow-lg rounded ${
          !!activeField ? "selected" : ""
        }`}
      >
        {activeSlide && <Container slide={currentSlide} />}
      </div>
    </Card>
  );
};

export default CenterBar;

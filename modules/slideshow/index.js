import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import Reveal from "reveal.js";
import DomPurify from "dompurify";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/white.css";
import { Link } from "react-router-dom";
import { generateSlideObject, hexToRgba, rgbaToHexA } from "utils/slider";

import { GET_SLIDESHOW_PREVIEW_URL } from "constants/urls";
import { axiosSlidr } from "services/api";
import Loader from "common/Loader";
import { getCloudFrontImgUrl } from "utils/cloudFrontUrl";
const getBackgroundImageData = ({ url, position, repeat, size }) => ({
  "data-background-image": url,
  "data-background-position": position,
  "data-background-repeat": repeat,
  "data-background-size": size,
});
const getBackgroundColorData = color => ({
  "data-background-color": `${rgbaToHexA(color)}`,
});
const getYoutubeMaxResolutionImage = url => {
  const newUrl = url.split("/");
  return [...newUrl.slice(0, newUrl.length - 1), "maxresdefault.jpg"].join("/");
};
const Slideshow = ({ match, location }) => {
  const slideshowId = !!match?.params?.id ? match.params.id : 0;
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState([]);
  const [settings, setSettings] = useState(null);
  const dispatch = useDispatch();
  const ref = useRef();

  const isPreviewRoute = useMemo(
    () => location.pathname.startsWith("/slide-show-preview"),
    [location]
  );
  useEffect(() => {
    if (!!settings && !loading) {
      ref.current = new Reveal({
        slideNumber: settings.slideNumbers && isPreviewRoute,
        width: settings.presentationSize === 1 ? 1280 : 960,
        height: 720,
        hash: true,
        loop: settings.repeatSlideshow,
        autoSlide: !isPreviewRoute ? 0 : settings.autoSlide,
        center: true,
        progress: isPreviewRoute,
        controls: isPreviewRoute,
      });
      ref.current.initialize();
    }
    return () => {
      if (!!ref.current) ref.current.destroy();
    };
  }, [settings, loading, isPreviewRoute]);
  useEffect(() => {
    if (slideshowId !== undefined) {
      setLoading(true);
      (async () => {
        try {
          const res = await axiosSlidr.get(
            `${GET_SLIDESHOW_PREVIEW_URL}/${slideshowId}`
          );
          if (res.status) {
            if (res.data?.data?.slideShowSetting) {
              const slideShowSetting = res.data.data.slideShowSetting;
              const values = {
                title: slideShowSetting?.title || "Untitled Slideshow",
                feedCode: slideShowSetting?.feedCode || "",
                presentationSize:
                  slideShowSetting?.presentation_size === "960*720" ? 2 : 1,
                autoSlide: slideShowSetting?.auto_slide || 0,
                img: slideShowSetting?.background_image || "",
                size: slideShowSetting?.background_size || "cover",
                position: slideShowSetting?.background_position || "center",
                repeat: slideShowSetting?.background_repeat || "no-repeat",
                repeatSlideshow: !!slideShowSetting?.slideshow_repeat,
                slideNumbers: !!slideShowSetting?.show_slide_no,
                grids: !!slideShowSetting.slideshow_gridlines,
                color: !!slideShowSetting.background_color
                  ? typeof slideShowSetting.background_color === "string"
                    ? hexToRgba(slideShowSetting.background_color)
                    : slideShowSetting.background_color
                  : {
                      r: "255",
                      g: "255",
                      b: "255",
                      a: "1",
                    },
                isImage: !!slideShowSetting?.background_image,
              };
              setSettings(values);
            }
            if (res.data?.data?.slides) {
              const slides = res.data.data.slides
                .filter(slide => !!slide.content)
                .map(slide =>
                  generateSlideObject(slide.content, slide.slide_id)
                );
              if (!!slides.filter(slide => !!slide).length) {
                setSlides(slides);
              }
            }
            setLoading(false);
          }
        } catch (err) {
          setLoading(false);
        }
      })();
    }
  }, [slideshowId, dispatch]);

  return (
    <div className="reveal">
      <div className="slides">
        {loading ? (
          <section>
            {" "}
            <Loader withFullscreen={false} />{" "}
          </section>
        ) : (
          slides.map(slide => (
            <section
              key={slide.id}
              {...(slide.backgroundType === "image"
                ? {
                    ...getBackgroundImageData({
                      url: slide.backgroundImage,
                      position: slide.backgroundPosition,
                      repeat: slide.backgroundRepeat,
                      size: slide.backgroundSize,
                    }),
                  }
                : slide.backgroundType === "color"
                ? {
                    ...getBackgroundColorData(slide.backgroundColor),
                  }
                : settings.isImage
                ? {
                    ...getBackgroundImageData({
                      url: settings.img,
                      position: settings.position,
                      repeat: settings.repeat,
                      size: settings.size,
                    }),
                  }
                : { ...getBackgroundColorData(settings.color) })}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {!!slide.videoUrl ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <img
                    alt="videoPreviewImage"
                    data-src={
                      slide.videoPreviewImageUrl.includes("img.youtube.com")
                        ? getYoutubeMaxResolutionImage(
                            getCloudFrontImgUrl(slide.videoPreviewImageUrl)
                          )
                        : getCloudFrontImgUrl(slide.videoPreviewImageUrl)
                    }
                    style={{
                      height: "100%",
                      width: "100%",
                      objectPosition: "center",
                      objectFit: "contain",
                    }}
                  />
                  <Link
                    className="bg-video--play-image"
                    target="__blank"
                    to={{ pathname: slide.videoUrl }}
                  />
                </div>
              ) : (
                <>
                  {slide.textFields
                    .filter(field => !["", "<p></p>"].includes(field.text))
                    .map(textField => (
                      <div
                        key={textField.id}
                        style={{
                          position: textField.position,
                          zIndex: textField.zIndex,
                          width: textField.width,
                          height: textField.height,
                          top: `${textField.translate.y}px`,
                          left: `${textField.translate.x}px`,
                        }}
                      >
                        <div
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
                            borderColor: textField.borderColor,
                            borderWidth: textField.borderWidth,
                            borderRadius: textField.borderRadius,
                            borderStyle: textField.borderStyle,
                            ...(textField.isBold ? { fontWeight: "bold" } : {}),
                            ...(textField.isUnderline
                              ? { textDecoration: "underline" }
                              : {}),
                            ...(textField.isItalic
                              ? { fontStyle: "italic" }
                              : {}),
                            width: "100%",
                            height: "100%",
                            transform: `rotate(${textField.rotate}deg)`,
                          }}
                          dangerouslySetInnerHTML={{
                            __html: DomPurify.sanitize(textField.text),
                          }}
                        />
                      </div>
                    ))}
                  {slide.imageFields.map(imageField => (
                    <div
                      key={imageField.id}
                      style={{
                        position: imageField.position,
                        zIndex: imageField.zIndex,
                        width: imageField.width,
                        height: imageField.height,
                        top: `${imageField.translate.y}px`,
                        left: `${imageField.translate.x}px`,
                      }}
                    >
                      <div
                        style={{
                          opacity: `${imageField.opacity}%`,
                          borderColor: imageField.borderColor,
                          borderWidth: imageField.borderWidth,
                          borderRadius: imageField.borderRadius,
                          borderStyle: imageField.borderStyle,
                          width: "100%",
                          height: "100%",
                          transform: `rotate(${imageField.rotate}deg)`,
                          overflow: imageField.overflow,
                        }}
                      >
                        <img
                          data-src={getCloudFrontImgUrl(imageField.src)}
                          alt="img"
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </section>
          ))
        )}
      </div>
    </div>
  );
};
export default Slideshow;

import hexRgb from "hex-rgb";
import { parse, stringify } from "himalaya";
import { v4 as uuidV4 } from "uuid";
import { defaultTextParameters, defaultImageParameters } from "constants/slidr";
import clonedeep from "lodash.clonedeep";
import cssParse from "style-to-object";

import rgbHex from "rgb-hex";

export const getVideoType = videoUrl =>
  videoUrl.includes("www.youtube.com/embed")
    ? 1
    : videoUrl.includes("player.vimeo.com/video")
    ? 2
    : 3;

export const rgbaToHexA = ({ r, g, b, a }) => {
  return `#${rgbHex(+r, +g, +b, +a)}`;
};

export const hexToRgba = hex => {
  if (![6, 8].includes(hex.length))
    return {
      r: "255",
      g: "255",
      b: "255",
      a: "1",
    };
  const rgba = hexRgb(hex);
  return {
    r: `${rgba.red}`,
    g: `${rgba.green}`,
    b: `${rgba.blue}`,
    a: `${rgba.alpha}`,
  };
};

export const rgbToObj = rgb => {
  let colors = ["r", "g", "b", "a"];
  let str = rgb.replaceAll(" ", "").slice(rgb.indexOf("(") + 1);
  let colorArr = str.slice(0, str.indexOf(")")).split(",");
  let obj = new Object();
  colorArr.forEach((k, i) => {
    obj[colors[i]] = k;
  });
  if (colorArr.length === 3) {
    obj.a = "1";
  }
  return obj;
};

const defaultSlideParams = {
  id: "",
  videoUrl: "",
  videoPreviewImageUrl: "",
  backgroundType: "color",
  backgroundImage: "",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  backgroundColor: {
    r: "255",
    g: "255",
    b: "255",
    a: "1",
  },
  textFields: [],
  imageFields: [],
};

export const getValue = (arr, key) =>
  arr.find(attr => attr.key === key)?.value || "";

export const parseStyle = style => {
  const styles = cssParse(style);
  Object.keys(styles).forEach(key => {
    styles[key] = styles[key].replace(" !important", "");
  });
  return styles;
};

export const generateSlideObject = (content, slide_id) => {
  if (!!!content) return null;

  const slideParams = clonedeep(defaultSlideParams);
  const slide = parse(content).find(el => el.tagName === "section");
  try {
    if (!!slide) {
      // Id
      const id = getValue(slide.attributes, "data-slide-id");
      slideParams.id = slide_id || id;

      const styles = parseStyle(getValue(slide.attributes, "style"));
      if (!!styles) {
        // Background-Color
        if (styles.hasOwnProperty("background-color")) {
          if (styles["background-color"].startsWith("#")) {
            slideParams.backgroundColor = {
              ...hexToRgba(styles["background-color"]),
            };
          }
          if (styles["background-color"].startsWith("rgb")) {
            slideParams.backgroundColor = {
              ...rgbToObj(styles["background-color"]),
            };
          }
        }
        // Background_image
        if (styles.hasOwnProperty("background-image")) {
          const imgURl = styles["background-image"]
            .replaceAll("&quot;", "")
            .replace("url(", "")
            .replace(")", "")
            .trim();
          if (imgURl) {
            slideParams.backgroundType = "image";
            slideParams.backgroundImage = imgURl;
            if (styles.hasOwnProperty("background-size")) {
              slideParams.backgroundSize = styles["background-size"];
            }
            if (styles.hasOwnProperty("background-position")) {
              slideParams.backgroundPosition =
                styles["background-position"].split(" ")[0];
            }
            if (styles.hasOwnProperty("background-repeat")) {
              slideParams.backgroundRepeat = styles["background-repeat"];
            }
          }
        }
      }
      const fields = slide.children;

      let zIndex = 1000;
      fields
        .filter(
          f =>
            f.hasOwnProperty("attributes") &&
            !!f?.attributes?.find(attr => attr.key === "data-block-type")
        )
        .forEach(field => {
          const slideType = getValue(field.attributes, "data-block-type");
          // VIDEO Field
          if (slideType === "iframe") {
            const imgTag = field.children[0].children?.find(
              el => el.tagName === "img"
            );
            if (!!imgTag) {
              const imgUrl = getValue(imgTag.attributes, "src");
              const videoUrl = getValue(imgTag.attributes, "data-video-url");
              slideParams.videoUrl = videoUrl;
              slideParams.videoPreviewImageUrl = imgUrl;
            }
          }
          // IMAGE Field
          if (slideType === "image") {
            const imgParams = clonedeep(defaultImageParameters);
            // id: ""
            const id = getValue(field.attributes, "data-block-id") || uuidV4();
            imgParams.id = id;
            // position: "absolute",
            const style = parseStyle(getValue(field.attributes, "style"));
            // translate: {
            //   x: 0,
            //   y: 0,
            // },
            if (style.hasOwnProperty("left"))
              imgParams.translate.x = +style["left"].replace("px", "");
            if (style.hasOwnProperty("top"))
              imgParams.translate.y = +style["top"].replace("px", "");
            // width: "500px",
            if (style.hasOwnProperty("width")) imgParams.width = style["width"];
            // height: "500px",
            if (style.hasOwnProperty("height"))
              imgParams.height = style["height"];
            // zIndex: 1000,
            if (style.hasOwnProperty("z-index"))
              imgParams.zIndex = +style["z-index"];
            else imgParams.zIndex = zIndex + 1;
            // rotate: 0,
            if (style.hasOwnProperty("transform"))
              imgParams.rotate = +style["transform"]
                .replace("rotate(", "")
                .replace("deg)", "");

            const imgField = field.children
              ?.find(el => el.tagName === "div")
              ?.children?.find(el => el.tagName === "img");

            if (!!imgField) {
              // url: "",
              imgParams.src = getValue(imgField.attributes, "src");
              const style = parseStyle(getValue(imgField.attributes, "style"));

              // opacity: 100,
              if (style.hasOwnProperty("opacity"))
                imgParams.opacity = +style["opacity"].replace("%", "");
              // borderSettings: false,
              if (style.hasOwnProperty("border")) {
                imgParams.borderSettings = true;
                const border = style["border"].split(" ").filter(val => !!val);
                // borderColor: "#000000",
                imgParams.borderColor = border[2];
                // borderWidth: "0px",
                imgParams.borderWidth = border[0];
                // borderStyle: "solid",
                imgParams.borderStyle = border[1];
              }
              // borderRadius: "0px",
              if (style.hasOwnProperty("border-radius"))
                imgParams.borderRadius = style["border-radius"];
            }

            slideParams.imageFields = [...slideParams.imageFields, imgParams];
          }
          // TEXT Field
          if (slideType === "text") {
            const textParams = clonedeep(defaultTextParameters);
            // id: ""

            const id = getValue(field.attributes, "data-block-id") || uuidV4();
            textParams.id = id;

            // position: "absolute",
            const style = parseStyle(getValue(field.attributes, "style"));
            // translate: { x: 390, y: 337.5 },
            if (style.hasOwnProperty("left"))
              textParams.translate.x = +style["left"].replace("px", "");
            if (style.hasOwnProperty("top"))
              textParams.translate.y = +style["top"].replace("px", "");
            // width: "500px",
            if (style.hasOwnProperty("width"))
              textParams.width = style["width"];
            // height: "500px",
            if (style.hasOwnProperty("height"))
              textParams.height = style["height"];
            // zIndex: 1000,
            if (style.hasOwnProperty("z-index"))
              textParams.zIndex = +style["z-index"];
            else textParams.zIndex = zIndex + 1;
            // rotate: 0,
            if (style.hasOwnProperty("transform"))
              textParams.rotate = +style["transform"]
                .replace("rotate(", "")
                .replace("deg)", "");

            const childDiv = field.children.find(el => el.tagName === "div");

            if (!!childDiv) {
              // placeholder: "Enter Text Here",
              textParams.placeholder = getValue(
                childDiv.attributes,
                "data-text"
              );
              const style = parseStyle(getValue(childDiv.attributes, "style"));

              // textAlign: "center",
              if (style.hasOwnProperty("text-align")) {
                textParams.textAlign = style["text-align"];
              }
              // fontFamily: "arial",
              if (style.hasOwnProperty("font-family")) {
                textParams.fontFamily = style["font-family"];
              }
              // isBold: false,
              if (style.hasOwnProperty("font-weight")) {
                textParams.isBold = style["font-weight"] === "bold";
              }
              // isUnderline: false,
              if (style.hasOwnProperty("text-decoration")) {
                textParams.isUnderline =
                  style["text-decoration"] === "underline";
              }
              // isItalic: false,
              if (style.hasOwnProperty("font-style")) {
                textParams.isItalic = style["font-style"] === "italic";
              }
              // fontSize: "48px",
              if (style.hasOwnProperty("font-size")) {
                textParams.fontSize = style["font-size"];
              }
              // lineHeight: "65px",
              if (style.hasOwnProperty("line-height")) {
                textParams.lineHeight = style["line-height"];
              }
              // color: "#000000",
              if (style.hasOwnProperty("color")) {
                textParams.color = style["color"];
              }
              // opacity: 100,
              if (style.hasOwnProperty("opacity"))
                textParams.opacity = +style["opacity"].replace("%", "");

              // borderSettings: false,
              if (style.hasOwnProperty("border")) {
                textParams.borderSettings = true;
                const border = style["border"].split(" ").filter(val => !!val);
                // borderColor: "#000000",
                textParams.borderColor = border[2];
                // borderWidth: "0px",
                textParams.borderWidth = border[0];
                // borderStyle: "solid",
                textParams.borderStyle = border[1];
              }
              // borderRadius: "0px",
              if (style.hasOwnProperty("border-radius"))
                textParams.borderRadius = style["border-radius"];
              // backgroundColor: {
              //   r: "0",
              //   g: "0",
              //   b: "0",
              //   a: "0",
              // },

              if (
                style.hasOwnProperty("background-color") ||
                style.hasOwnProperty("background")
              ) {
                const key = style.hasOwnProperty("background-color")
                  ? "background-color"
                  : "background";

                if (style[key].startsWith("#")) {
                  textParams.backgroundColor = {
                    ...hexToRgba(style[key]),
                  };
                }
                if (style[key].startsWith("rgb")) {
                  textParams.backgroundColor = {
                    ...rgbToObj(style[key]),
                  };
                }
              }
              // text: "<p></p>",
              textParams.text = stringify(childDiv.children);
            }
            slideParams.textFields = [...slideParams.textFields, textParams];
          }
          zIndex += 1;
        });
      return slideParams;
    }
  } catch (err) {
    return null;
  }

  return null;
};

export const generateTextFieldString = obj => {
  return `<div data-block-id="${
    obj.id
  }" data-block-type="text" style="position: absolute; top: ${
    obj.translate.y
  }px; left: ${obj.translate.x}px; width: ${obj.width}; height: ${
    obj.height
  }; transform: rotate(${obj.rotate}deg); z-index: ${obj.zIndex};">
    <div data-text="${obj.placeholder}" style="text-align: ${
    obj.textAlign
  }; font-family: ${obj.fontFamily}; font-size: ${obj.fontSize}; line-height: ${
    obj.lineHeight
  }; color: ${obj.color}; ${
    obj.backgroundColor
      ? `background-color: rgba(${Object.values(obj.backgroundColor).join(
          ","
        )});`
      : ""
  } 
  opacity: ${obj.opacity}%; 
  ${
    obj.borderSettings
      ? `border: ${obj.borderWidth} ${obj.borderStyle} ${obj.borderColor}; border-radius: ${obj.borderRadius};`
      : ""
  }
  ${obj.isBold ? "font-weight: bold;" : ""} 
  ${obj.isUnderline ? "text-decoration: underline;" : ""} 
  ${obj.isItalic ? "font-style: italic;" : ""} 
  ">${obj.text}</div>
  </div>`;
};
export const generateImageFieldString = obj => {
  return `<div data-block-id="${
    obj.id
  }" data-block-type="image" style="position: absolute; top: ${
    obj.translate.y
  }px; left: ${obj.translate.x}px; width: ${obj.width}; height: ${
    obj.height
  }; transform: rotate(${obj.rotate}deg); z-index: ${obj.zIndex};">
  <div style="overflow: hidden; height: 100%; width: 100%; "><img src="${
    obj.src
  }" style="opacity: ${obj.opacity}%;
  width: 100%; height: 100%; object-fit: cover; object-position: center; 
  ${
    obj.borderSettings
      ? `border: ${obj.borderWidth} ${obj.borderStyle} ${obj.borderColor}; border-radius: ${obj.borderRadius};`
      : ""
  }" /></div>
  </div>`;
};
export const generateTextImgString = obj => {
  return `${obj.textFields
    .map(field => generateTextFieldString(field))
    .join("")}${obj.imageFields
    .map(field => generateImageFieldString(field))
    .join("")}`;
};

export const generateVideoSlideString = (url, thumbnail) =>
  `<div data-block-type="iframe" style="position : relative; height: 100%; width: 100%;"><div style="width: 100%; height: 100%;"><img src="${thumbnail}" data-video-url="${url}" /><a href="${url}"></a></div></div>`;

export const generateSlideString = (obj, presentationSize) => {
  return `
    <section data-slide-id="${obj.id}" style="height: 720px; width: ${
    presentationSize === 1 ? "1280px" : "960px"
  }; ${
    obj.backgroundType === "color" && obj.backgroundColor
      ? `background-color: rgba(${Object.values(obj.backgroundColor).join(
          ","
        )});`
      : `background-image: url(${obj.backgroundImage}); background-position: ${obj.backgroundPosition}; background-size: ${obj.backgroundSize}; background-repeat: ${obj.backgroundRepeat};`
  }">${
    !!obj.videoUrl
      ? generateVideoSlideString(obj.videoUrl, obj.videoPreviewImageUrl)
      : generateTextImgString(obj)
  }</section>`
    .replace(/[\r\n]/g, "")
    .replace(/\s{2,}/g, " ");
};
export const getSliderContent = content => {
  const checkUrl = content.match(/url\(.*?\)/);
  if (!!checkUrl) {
    const url = checkUrl[0];
    const newUrl = url.replace(/\s/g, "%20");
    return content.replace(url, newUrl);
  } else return content;
};

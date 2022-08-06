import useOutsideClick from "common/UseOutSideClick";
import React, { useRef, useState } from "react";
import { SketchPicker } from "react-color";
import { Label } from "reactstrap";

const getColor = (type, color) => {
  switch (type) {
    case "hex":
      return color.hex;
    case "rgba":
      return color.rgb;
    default:
      return color.hex;
  }
};

const rgbaToHex = rgba => {
  rgba = rgba.match(
    /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i
  );
  return rgba && rgba.length === 4
    ? "#" +
        ("0" + parseInt(rgba[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgba[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgba[3], 10).toString(16)).slice(-2)
    : "";
};

const ColorPicker = ({
  value,
  onChange,
  label = "Choose Color",
  size = "sm",
  type = "hex",
  disableAlpha = true,
}) => {
  const ref = useRef();
  const [isOpen, setIsOpen] = useState(false);
  useOutsideClick(ref, () => {
    setIsOpen(false);
  });

  return (
    <div className="d-flex align-items-center justify-content-between">
      {!!label && <Label>{label}</Label>}
      <div className="d-flex align-items-center">
        <div
          className={`color-circle--${size} cursor-pointer color-input border border-dark me-2`}
          onClick={() => {
            setIsOpen(true);
          }}
          style={
            !!value
              ? {
                  backgroundColor:
                    type === "hex"
                      ? value
                      : `rgba(${Object.values(value).join(",")})`,
                }
              : null
          }
        >
          {isOpen && (
            <div className={`parent-color-picker`} ref={ref}>
              <SketchPicker
                color={!!value ? value : ""}
                onChangeComplete={color => {
                  if (!!onChange && typeof onChange === "function")
                    onChange(getColor(type, color));
                }}
                disableAlpha={disableAlpha}
              />
            </div>
          )}
        </div>

        {value ? (
          <Label
            className={`mb-0 ${
              type === "hex" ? "text-uppercase" : ""
            } cursor-pointer`}
            onClick={() => {
              setIsOpen(true);
            }}
          >
            {type === "rgba"
              ? rgbaToHex(`rgba(${Object.values(value).join(",")})`)
              : value}
          </Label>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default ColorPicker;

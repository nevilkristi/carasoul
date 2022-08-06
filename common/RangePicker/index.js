import React from "react";
import Slider from "react-rangeslider";
import "react-rangeslider/lib/index.css";

const RangePicker = ({
  value,
  onChange,
  onChangeStart,
  onChangeStop,
  min = 0,
  max = 100,
}) => {
  return (
    <>
      <Slider
        className="flex-grow-1"
        value={value}
        min={min}
        max={max}
        orientation="horizontal"
        onChange={value => {
          if (!!onChange && typeof onChange === "function") {
            onChange(value);
          }
        }}
        onChangeStart={onChangeStart}
        onChangeComplete={onChangeStop}
      />
    </>
  );
};

export default RangePicker;

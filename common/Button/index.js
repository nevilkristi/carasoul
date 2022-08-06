import React from "react";

const CommonButton = ({
  btnText,
  btnClass = "",
  btnClick,
  btnType = "button",
  btnDisabled,
  btnRounded = "true",
  btnChildren = "",
  children,
  btnId = "",
  btnOutline = false,
}) => {
  return (
    <button
      id={btnId}
      className={` common-btn ${btnClass} ${btnRounded ? "btn-rounded" : ""} ${
        btnChildren ? "d-flex" : ""
      } ${btnOutline ? "outline" : ""} ${btnDisabled ? "disabled" : ""} `}
      disabled={btnDisabled}
      onClick={btnClick}
      type={btnType}
    >
      {!!children ? children : btnText}
    </button>
  );
};
export default CommonButton;

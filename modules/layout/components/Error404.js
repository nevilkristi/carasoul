import React from "react";
import ERROR404 from "assets/images/404_error.svg";
const Error404 = () => {
  return (
    <div className="d-flex justify-content-center">
      <img src={ERROR404} className="w-50" alt="error404" />
    </div>
  );
};

export default Error404;

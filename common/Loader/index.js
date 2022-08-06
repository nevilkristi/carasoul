import React from "react";

import Logo from "assets/images/logo.png";

const Loader = ({ withFullscreen = true }) => {
  return (
    <div
      style={withFullscreen ? { height: "100vh" } : {}}
      className="full-screen d-flex align-items-center justify-content-center flex-column"
    >
      <img src={Logo} alt="logo" className="slidr-loader avatar-lg" />
      <div className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default Loader;

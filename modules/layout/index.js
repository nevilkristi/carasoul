import React from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";

const Layout = ({ children, showHeader, showFooter, withContainer = true }) => {
  return (
    <>
      {showHeader && <Header />}
      {withContainer ? (
        <div className="slider-container">{children}</div>
      ) : (
        children
      )}

      {showFooter && <Footer />}
    </>
  );
};
export default Layout;

import React, { useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import sliderLogo from "../../../assets/images/logo.svg";
import UserImg from "../../../assets/images/UserImg.png";

import { useDispatch } from "react-redux";
import { setIntroductionTour, setUnauthorized } from "store/actions";
import Profile from "./Profile";
import { getCloudFrontImgUrl } from "utils/cloudFrontUrl";
import { get } from "services/cookies";

const Header = () => {
  const location = useLocation();
  const token = get("token");

  const dispatch = useDispatch();
  const history = useHistory();

  const { menus } = useSelector(state => state.profile);
  const { user, profileLoading } = useSelector(state => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [addShowClass, setAddShowClass] = useState(false);

  const clickMenu = (menu, link) => {
    if (menu === "Introduction Tour") {
      if (!!location.pathname) {
        let objKey =
          location.pathname === "/"
            ? "dashboard"
            : location.pathname.startsWith("/slidr")
            ? "slidr"
            : "";
        if (!!objKey) dispatch(setIntroductionTour({ [objKey]: true }));
      }
    } else if (["tutorial", "subscription"].includes(menu.toLowerCase())) {
      if (link.startsWith("http")) {
        window.location.replace(link);
      } else {
        let redirectLink = link.startsWith("/") ? link : `/${link}`;
        history.push(redirectLink);
      }
    } else if (menu.toLowerCase() === "help") {
      window.open(link, "_blank");
    }
  };

  return (
    <React.Fragment>
      <header id="main-header">
        <div className="top-header">
          <nav className="navbar navbar-expand-lg navbar-light d-flex ">
            <div className="container header-container">
              <div
                className="user-logo"
                onClick={() => {
                  dispatch(setUnauthorized(false));
                  history.push("/");
                }}
              >
                <Link className="navbar-brand text-white" to="#">
                  {!!sliderLogo && <img src={sliderLogo} alt="img-fluid" />}
                </Link>
              </div>

              <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
                onClick={() => setAddShowClass(!addShowClass)}
              >
                <i className="fas fa-bars"></i>
              </button>

              <div
                className={`collapse navbar-collapse ${
                  addShowClass ? "show" : ""
                }`}
                id="navbarNav"
              >
                <ul className="navbar-nav ml-auto">
                  {!!menus.length &&
                    menus?.map((MainMenu, i) => (
                      <li
                        className="nav-item  dropdown active navbar-side-spacing "
                        key={i}
                        onClick={() =>
                          clickMenu(
                            MainMenu.application_menu_title,
                            MainMenu.link
                          )
                        }
                      >
                        <Link className="nav-link header-menu" target="" to="#">
                          {MainMenu.application_menu_title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
              {token && (
                <div
                  className="d-flex cursor-pointer"
                  id="openSidebarMenu"
                  onClick={() => setIsOpen(true)}
                >
                  <img
                    src={
                      user?.profile_image
                        ? getCloudFrontImgUrl(user.profile_image)
                        : UserImg
                    }
                    alt="user-img"
                    className="profile-img-icon"
                  />

                  <span className="user-header-name d-flex">
                    {profileLoading ? "Loading..." : user?.first_name}
                    <i className="fas fa-chevron-down mx-2 mt-1"></i>
                  </span>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <Profile
        onClose={() => {
          setIsOpen(false);
        }}
        isOpen={isOpen}
        close={() => setIsOpen(false)}
      />
    </React.Fragment>
  );
};
export default Header;

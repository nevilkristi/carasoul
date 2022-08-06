import React from "react";
import { OffcanvasBody } from "react-bootstrap";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

import { clear } from "services/cookies";

import userImg from "assets/images/UserImg.png";
import Grow from "assets/images/grow.png";

import { logOutUser } from "store/actions";
import { getCloudFrontImgUrl } from "utils/cloudFrontUrl";

const Profile = ({ isOpen, close }) => {
  const { user } = useSelector(state => state.auth);
  const { sites, siteLoading } = useSelector(state => state.profile);

  const history = useHistory();
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logOutUser());
  };
  const getRndInteger = (min, max) =>
    Math.floor(Math.random() * (max - min)) + min;
  const selected = url => {
    return window.location.origin + "/" === url;
  };
  const Loader = () => {
    return [...Array(6).keys()].map(index => (
      <li key={index} className="placeholder-glow p-2">
        <span className="site-logo placeholder col-2"></span>
        <p className={`placeholder col-${getRndInteger(4, 7)} mb-0`}></p>
      </li>
    ));
  };
  return (
    <Offcanvas className="profile-canvas" show={isOpen} placement="end">
      <OffcanvasBody className="p-0">
        <ul className="sidebarMenuInner">
          <div className="user">
            <img
              src={
                !!user && !!user.profile_image
                  ? getCloudFrontImgUrl(user.profile_image)
                  : userImg
              }
              alt="user-img"
              className="user-img"
            />
            <label className="close-sidebar" onClick={close}>
              <i className="fa fa-times"></i>
            </label>

            {!!user && !!user.display_name && (
              <h3 className="mtb10">{user.display_name}</h3>
            )}
            {!!user && !!user.email && (
              <p className="header-user-email">{user.email}</p>
            )}
            <div className="siderbar-btn">
              <Link
                to={{ pathname: process.env.REACT_APP_ACCOUNT_SITE_URL }}
                className="btn account-btn btn-size "
                target="_parent"
              >
                Account
              </Link>

              <Link
                to=""
                className="btn logout-btn btn-size "
                onClick={handleLogout}
              >
                Logout
              </Link>
            </div>
          </div>
          <li>
            <h5 className="heading-text">Applications</h5>
            <ul className="application-submenu">
              {siteLoading ? (
                <Loader />
              ) : (
                sites.map(site => (
                  <React.Fragment key={site.application_menu_id}>
                    {site.application_menu_id === 3 ? (
                      <>
                        <Link
                          target="_parent"
                          to={{ pathname: `${site.link}builder` }}
                        >
                          <li>
                            <img src={!!site.icon ? site.icon : Grow} alt="" />
                            Message Builder
                          </li>
                        </Link>
                        <Link
                          target="_parent"
                          to={{ pathname: `${site.link}app-builder` }}
                        >
                          <li>
                            <img src={!!site.icon ? site.icon : Grow} alt="" />
                            App Builder
                          </li>
                        </Link>
                      </>
                    ) : (
                      <Link target="_parent" to={{ pathname: site.link }}>
                        <li
                          className={`${!!selected(site.link) ? "active" : ""}`}
                        >
                          <img
                            src={
                              !!site.icon
                                ? getCloudFrontImgUrl(site.icon)
                                : Grow
                            }
                            alt=""
                          />
                          {site.application_menu_title}
                        </li>
                      </Link>
                    )}
                  </React.Fragment>
                ))
              )}
            </ul>
          </li>
        </ul>
        {[1, 2].includes(user?.user_role) && (
          <div className="admin-btn">
            <Link
              target="_parent"
              className="btn-edit-profile"
              to={{ pathname: process.env.REACT_APP_ADMIN_SITE_URL }}
            >
              Go To Admin Panel
            </Link>
          </div>
        )}
      </OffcanvasBody>
    </Offcanvas>
  );
};
export default Profile;

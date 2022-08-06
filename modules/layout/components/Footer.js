import { GET_MENUS } from "constants/urls";
import React, { useEffect, useState } from "react";
import { axiosAccount } from "services/api";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
const Footer = () => {
  const todaysDate = new Date();
  const currentYear = todaysDate.getFullYear();
  const history = useHistory();
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    try {
      axiosAccount
        .post(GET_MENUS, {
          site_id: 6,
          menu_type: 2,
        })
        .then(response => {
          if (response.status && response?.data?.data?.application_menu) {
            setMenus(response.data.data.application_menu);
          }
        });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  }, []);
  const clickMenu = link => {
    if (link.startsWith("http")) {
      window.location.replace(link);
    } else {
      history.push(link);
    }
  };
  return (
    <footer className="footer-content">
      <div className="container">
        <div className="footer-info">
          <i className="fa fa-copyright"></i>
          {currentYear} Stuff You Can Use
          {!!menus.length &&
            menus.map(menu => (
              <React.Fragment key={menu.application_menu_id}>
                {" "}
                |{" "}
                <span
                  className="cursor-pointer"
                  onClick={() => clickMenu(menu.link)}
                >
                  {menu.application_menu_title}
                </span>
              </React.Fragment>
            ))}{" "}
        </div>
      </div>
    </footer>
  );
};
export default Footer;

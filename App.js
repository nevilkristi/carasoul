import "./assets/css/custom.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.min.css";
import "assets/css/_materialdesignicons.scss";

import React, { useLayoutEffect, useEffect, Suspense, useMemo } from "react";
import { Switch, useLocation, useHistory, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import PrivateRoute from "./routes/PrivateRoute";
import Layout from "./modules/layout";
import { get, set, remove } from "services/cookies";
import { useDispatch, useSelector } from "react-redux";
import {
  setToken,
  fetchProfile,
  setIsAuth,
  setLoading,
  fetchAccessToken,
  fetchMenus,
  subscriptionStatus,
} from "store/actions";
import queryString from "query-string";
// import { connectMainIo } from "services/socket";

import Loader from "common/Loader";

import { axiosAccount } from "services/api";
import { GET_DRIFT_DATA } from "constants/urls";

import { toast } from "react-toastify";
import Error401 from "modules/layout/components/Error401";
import Error404 from "modules/layout/components/Error404";

function App() {
  const { isAuth, isUnauthorized } = useSelector(state => state.auth);
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const qry = queryString.parse(location.search);
  const tempToken = qry?.token;
  const userToken = qry?.userToken;
  const pageUrl = location.pathname;

  useEffect(() => {
    window.uetq = window.uetq || [];
    window.uetq.push("event", "page_view", { page_path: window.location.href });
  }, [pageUrl]);

  useLayoutEffect(() => {
    dispatch(setLoading(true));
    const token = get("token");
    if (!isAuth && !!token) {
      dispatch(setToken(token));
      dispatch(fetchProfile(6));
      dispatch(setIsAuth(true));
    }
    dispatch(setLoading(false));
  }, [dispatch, isAuth]);

  const isSlideshowRoute = useMemo(
    () => location.pathname.startsWith("/slide-show"),
    [location]
  );
  const isTutorialRoute = useMemo(
    () => location.pathname.startsWith("/tutorial"),
    [location]
  );
  const isErrorRoute = useMemo(
    () => location.pathname.startsWith("/404"),
    [location]
  );

  useEffect(() => {
    if (isAuth) {
      let payload = {
        site_id: 6,
        menu_type: 1,
      };
      let siteMenu = {
        site_id: 1,
        menu_type: 4,
      };
      dispatch(fetchMenus(payload));
      dispatch(fetchMenus(siteMenu));
      // connectMainIo();
      dispatch(subscriptionStatus(6));
    }
  }, [isAuth, dispatch]);

  useEffect(() => {
    const token = get("token");
    dispatch(setLoading(true));
    if (
      isAuth === false &&
      !token &&
      tempToken === undefined &&
      userToken === undefined &&
      !isSlideshowRoute &&
      !isTutorialRoute &&
      !isErrorRoute
    ) {
      window.location.replace(
        `${process.env.REACT_APP_ACCOUNT_SITE_URL}/login?redirect=${process.env.REACT_APP_SLIDR_SITE_URL}/&app_id=6`
      );
    }
    dispatch(setLoading(false));
  }, [
    isAuth,
    tempToken,
    userToken,
    dispatch,
    isSlideshowRoute,
    isTutorialRoute,
    isErrorRoute,
  ]);

  useEffect(() => {
    if (tempToken) {
      dispatch(setLoading(true));
      set("site_id", 6);
      dispatch(
        fetchAccessToken({ temp_token: tempToken, site_id: 6 }, () => {
          history.replace("/");
          dispatch(setLoading(false));
        })
      );
    }
  }, [tempToken, dispatch, history]);

  const onClose = () => {
    const mainToken = get("mainToken");
    set("token", mainToken);
    remove("mainToken");
    remove("userId");
    remove("site");
    window.location.replace(process.env.REACT_APP_ADMIN_SITE_URL);
  };

  useEffect(() => {
    (async () => {
      try {
        const payload = {
          site_id: 6,
        };
        const res = await axiosAccount.post(GET_DRIFT_DATA, payload);
        if (res?.status && res?.data?.data?.script) {
          if (
            !!window?.drift?.load &&
            !!!window.location.pathname.startsWith("/slide-show")
          ) {
            window.drift.load(res.data.data.script);
          }
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    })();
  }, []);

  return (
    <>
      {!!get("mainToken") && window.location === window.parent.location && (
        <div className="bg-top-bar d-flex align-items-center justify-content-end p-3">
          <button
            className="btn bg-white text-top-bar d-flex align-items-center rounded-pill px-3 frame-close-btn shadow-lg "
            onClick={onClose}
          >
            <i className="fas fa-arrow-left me-2" />{" "}
            <span>Back To Dashboard</span>
          </button>
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnHover
        limit={3}
      />
      <Suspense fallback={<Loader />}>
        <Layout
          showHeader={!isSlideshowRoute}
          showFooter={!isSlideshowRoute}
          withContainer={!isSlideshowRoute}
        >
          <Switch>
            {PrivateRoute.map(item => (
              <Route
                path={item.path}
                key={item.path}
                exact
                render={props => {
                  return !!isUnauthorized ? (
                    <Error401 />
                  ) : !isAuth && item.checkAuth ? (
                    <Loader />
                  ) : (
                    <item.component {...props} />
                  );
                }}
              />
            ))}
            <Route path="*" component={Error404} />
          </Switch>
        </Layout>
      </Suspense>

      <script>
        {`        
        _linkedin_partner_id = "1573140";
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);
      
        (function(l) {
        if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
        window.lintrk.q=[]}
        var s = document.getElementsByTagName("script")[0];
        var b = document.createElement("script");
        b.type = "text/javascript";b.async = true;
        b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
        s.parentNode.insertBefore(b, s);})(window.lintrk);
      `}
      </script>

      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src="https://px.ads.linkedin.com/collect/?pid=1573140&fmt=gif"
        />
      </noscript>
    </>
  );
}

export default App;

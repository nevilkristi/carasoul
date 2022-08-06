import axios from "axios";
import store from "store";
import { setUnauthorized } from "store/actions";
import { get, set } from "./cookies";
import { LOG_OUT_USER } from "constants/urls.js";

// Uncomment this when deploy
const API_URL_ACCOUNT = `${process.env.REACT_APP_API_ACCOUNT_URL}/api/v1`;
const API_URL_ADMIN = `${process.env.REACT_APP_API_ADMIN_URL}/api/v1`;
// const API_URL_SLIDR = `${process.env.REACT_APP_API_SLIDR_URL}/api/v1`;
const API_URL_SLIDR = `http://192.168.1.79:5000/api/v1/`;

const axiosAdmin = axios.create({
  baseURL: API_URL_ADMIN,
});
const axiosAccount = axios.create({
  baseURL: API_URL_ACCOUNT,
});
const axiosSlidr = axios.create({
  baseURL: API_URL_SLIDR,
});

const non_auth_routes = [LOG_OUT_USER];

const requestMiddleware = req => {
  if (!non_auth_routes.includes(req.url)) {
    const token = get("token");
    if (!!token)
      req.headers.authorization = token.startsWith("Bearer ")
        ? token
        : "Bearer " + token;
  }
  return req;
};

const responseMiddleware = response => {
  if (response?.data?.data?.token) {
    set("token", response.data.data.token);
  }
  return response;
};

const handleError = err => {
  if (err.response.status === 401) {
    store.dispatch(setUnauthorized(true));
  }
  return Promise.reject(err);
};

axiosAdmin.interceptors.request.use(requestMiddleware);
axiosAccount.interceptors.request.use(requestMiddleware);
axiosSlidr.interceptors.request.use(requestMiddleware);

axiosAdmin.interceptors.response.use(responseMiddleware, handleError);
axiosAccount.interceptors.response.use(responseMiddleware, handleError);
axiosSlidr.interceptors.response.use(responseMiddleware, handleError);

export { axiosAdmin, axiosAccount, axiosSlidr };

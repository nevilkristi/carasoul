import Cookies from "js-cookie";

const config = {
  path: process.env.REACT_APP_COOKIE_PATH,
  domain: process.env.REACT_APP_COOKIE_DOMAIN,
  expires: +process.env.REACT_APP_COOKIE_EXPIRE,
};

export const get = key => {
  const value = Cookies.get(key);
  if (!!value) return JSON.parse(value);
  else return null;
};

export const set = (key, value) => {
  Cookies.set(key, JSON.stringify(value), config);
};

export const remove = key => {
  Cookies.remove(key, config);
};

export const clear = () => {
  ["token", "mainToken", "userId", "site"].forEach(key => {
    remove(key);
  });
};

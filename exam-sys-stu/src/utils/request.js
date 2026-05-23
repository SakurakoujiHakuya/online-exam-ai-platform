import axios from "axios";
import Cookies from "js-cookie";
import { message } from "antd";

const AUTH_ERROR_CODES = [400, 401, 403, 502, 50012, 50014];

let redirectingToLogin = false;

const isAuthErrorCode = (code) => AUTH_ERROR_CODES.includes(Number(code));

const redirectToLogin = () => {
  if (redirectingToLogin || window.location.hash.includes("/login")) {
    return;
  }
  redirectingToLogin = true;
  Cookies.remove("studentUserName");
  Cookies.remove("studentToken");
  window.location.replace("/#/login");
};

// Create axios instance
const service = axios.create({
  baseURL: "", // Proxy is handling /api
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor
service.interceptors.request.use(
  (config) => {
    // Check if token exists in cookies
    const token = Cookies.get("studentToken");
    if (token) {
      config.headers["token"] = token;
    }
    // Add request-ajax header to identify as ajax request
    config.headers["request-ajax"] = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    // If the custom code is not 1, it is judged as an error.
    if (res.code !== 1) {
      if (isAuthErrorCode(res.code)) {
        redirectToLogin();
        return Promise.reject(new Error(res.message || "登录状态已失效"));
      }
      message.error(res.message || "Error");
      return Promise.reject(new Error(res.message || "Error"));
    } else {
      return res;
    }
  },
  (error) => {
    const status = error?.response?.status;
    const responseCode = error?.response?.data?.code;
    if (isAuthErrorCode(responseCode) || status === 401 || status === 403) {
      redirectToLogin();
      return Promise.reject(error);
    }
    console.log("err" + error); // for debug
    message.error(error.message || "请求失败");
    return Promise.reject(error);
  },
);

const post = (url, data, config = {}) => {
  return service({
    method: "post",
    url: url,
    data: data,
    ...config,
  });
};

const postWithLoadTip = (url, data) => {
  return post(url, data);
};

const get = (url, data) => {
  return service({
    method: "get",
    url: url,
    params: data,
  });
};

export { post, postWithLoadTip, get };
export default service;

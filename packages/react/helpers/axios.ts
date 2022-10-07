import axios from "axios";
import logger from "./logger";

var axiosObject = axios.create();

if (process.env.NEXT_PUBLIC_API_URL !== undefined) {
  axiosObject.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
}

const accessToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhMzljYTJhMy1iODdmLTQwMTctYjM2Yi01M2M0ZDM5MTU4YWIiLCJqdGkiOiI5NGIyNTljNC0wNWIwLTQwMGQtOTFmOS1mYTlkYzE4YWEyMWUiLCJpYXQiOjE2NTY2NjI3NTcsImV4cCI6MTY1NjY2NjM1N30.EYSGT9aOto7-z9ejHP8ZVm7tvguhtvXUKUs2divTZ-Y";

axiosObject.defaults.headers.common = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

axiosObject.interceptors.request.use(
  async function (config) {
    logger(
      "Request:",
      `${config.method} - ${config.baseURL}${config.url}?${new URLSearchParams(
        config.params
      ).toString()}`
    );

    if (config !== undefined && config.headers !== undefined) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  function (error) {
    // logger("Request Interceptor Error", error);
    return Promise.reject(error);
  }
);

axiosObject.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // logger("Response interceptor error", error);
    if (
      error.response &&
      error.response.status &&
      error.response.status == 401
    ) {
    }
    return Promise.reject(error);
  }
);

export { axiosObject };

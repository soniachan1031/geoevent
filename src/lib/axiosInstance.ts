import axios, { AxiosInstance } from "axios";

/**
 * Creates an Axios instance with a base URL and enables sending cookies across requests.
 *
 * @return The created Axios instance.
 */
const axiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: `${window.location.origin}/`,
    withCredentials: true, // Enables sending cookies across requests
  });
};

export default axiosInstance;

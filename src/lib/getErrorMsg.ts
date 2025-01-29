const getErrorMsg = (error: any) => {
  if (error.response) {
    return error.response.data.message || "Server Error";
  } else {
    return "Network Error";
  }
};
export default getErrorMsg;

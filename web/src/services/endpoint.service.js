import urlJoin from "url-join";
const BASE_URL = window.location.origin;

const Endpoints = {
  GET_ALL_APPLICATIONS(){
    return urlJoin(BASE_URL, '/api/v1/applications')
  }
};

export default Endpoints;
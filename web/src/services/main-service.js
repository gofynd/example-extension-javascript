"use strict";

import URLS from './endpoint.service';
import { getCompany }  from '../helper/utils';

const MainService = {
    getAllApplications() {
        // `x-company-id` header is included to fetch the session at the extension backend
        // This header is necessary for authentication and session-related operations
        const headers = { 'x-company-id': getCompany() };
        return fetch(URLS.GET_ALL_APPLICATIONS(), { method: 'GET', headers: headers });
    },
}

export default MainService;
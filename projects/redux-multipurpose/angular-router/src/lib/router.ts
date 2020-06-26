import { Router } from '@angular/router';

import { store } from '@redux-multipurpose/core';

import { RouterService } from './service/router.service';

import { routerReducer } from './service/router.slice';

export const initializeRouter = (router: Router) => {
    store.addReducer("router", routerReducer);

    const routerService = new RouterService(router);
    routerService.init();
};
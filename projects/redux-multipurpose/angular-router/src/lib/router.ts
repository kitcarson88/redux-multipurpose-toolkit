import { Router } from '@angular/router';

import { RouterService } from './service/router.service';
import { routerReducer } from './service/router.slice';

export const configureRouterReducer = (key: string, router: Router) => {
    return { key, reducer: routerReducer, service: new RouterService(router)};
};
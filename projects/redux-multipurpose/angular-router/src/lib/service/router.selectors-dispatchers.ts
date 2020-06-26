import { Injectable } from '@angular/core';

import { dispatch } from '@redux-multipurpose/core';

import { goToUrl as dispatchGoToUrl } from './router.slice';

export const router = state => state.router;

@Injectable()
export class RouterActions
{
    @dispatch()
    goToUrl = (url: string) => {
        return dispatchGoToUrl(url);
    };
}
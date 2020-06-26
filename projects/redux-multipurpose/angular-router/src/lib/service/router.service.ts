import { Injectable } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { store, select } from '@redux-multipurpose/core';

import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { router } from './router.selectors-dispatchers';
import { updateUrl } from './router.slice';

export class RouterService
{
    @select(router)
    router$: Observable<string>;

    constructor(
        private router: Router
    ) {}

    init()
    {
        this.router.events.pipe(
            filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
        ).subscribe((navigationEndEvent: NavigationEnd) => {
            store.dispatch(updateUrl(navigationEndEvent.url));
        });

        this.router$.pipe(
            filter(url => url != null && url != undefined && this.router.url !== url)
        ).subscribe(url => {
            this.router.navigateByUrl(url);
        });
    }
}
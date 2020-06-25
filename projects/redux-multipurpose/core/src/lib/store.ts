import { Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { Selector, Action, createSelector, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { Store } from 'redux';
import { FluxStandardAction } from 'flux-standard-action';
import { createEpicMiddleware } from 'redux-observable-es6-compat';
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';

import { MultipurposeStoreOptions } from './entities/store-options';

const genericSelector = (paths: string[]) => {
    return createSelector(
        [state => {
            let nestedState: any = state;

            for (let path of paths)
                if (nestedState[path] != null && nestedState[path] != undefined)
                    nestedState = nestedState[path];
                else
                {
                    nestedState = null;
                    break;
                }

            return nestedState;
        }],
        items => items
    );
};

const initializeWithDefaultMiddleware = (options?) => {
    return options?
        [...getDefaultMiddleware(options)] :
        [...getDefaultMiddleware()];
};

//Store instance
var reduxStore: Store;
export const initializeStore = (options: MultipurposeStoreOptions) => {
    if (reduxStore)
        throw Error("A redux store is initialized yet. Cannot initialize another one");

    const {
        reducer,
        devTools,
        middlewares,
        enhancers,
        preloadedState,
        defaultMiddlewareOptions,
        sagas,
        epics,
        logLevel
    } = options;

    let middleware = [];
    let epicMiddleware;
    let sagaMiddleware;

    middleware = initializeWithDefaultMiddleware(defaultMiddlewareOptions);

    if (middleware)
        middleware = [...middleware, ...middlewares];

    if (epics)
    {
        epicMiddleware = createEpicMiddleware<FluxStandardAction<any, any>, FluxStandardAction<any, any>, any>();
        middleware = [...middleware, epicMiddleware];
    }

    if (sagas)
    {
        sagaMiddleware = createSagaMiddleware();
        middleware = [...middleware, sagaMiddleware];
    }

    if (logLevel)
    {
        const loggerMiddleware = createLogger({ level: logLevel });
        middleware = [...middleware, loggerMiddleware ];
    }

    const store = configureStore({
        reducer,
        devTools,
        preloadedState,
        middleware,
        enhancers
    });

    //Executing epics
    if (epicMiddleware)
        epicMiddleware.run(epics());

    //Executing sagas
    if (sagaMiddleware)
        sagaMiddleware.run(sagas);

    //Finally save store instance
    reduxStore = store;
};

export const store = {
    getState$: (): Observable<any> =>{
        return new Observable(function (observer) {
            observer.next(reduxStore.getState());
            
            const unsubscribe = reduxStore.subscribe(function () {
                observer.next(reduxStore.getState());
            });
            
            return unsubscribe;
        });
    },
    select: <R, T>(selector: Selector<R, T>):Observable<T> =>{
        return new Observable<T>(subscriber => {  
            const state$ = store.getState$();

            const unsubscribe = state$.pipe(
                map(state => selector(state)),
                distinctUntilChanged()
            ).subscribe(data => subscriber.next(data));

            return unsubscribe;
        })
    },
    selectSync : <R, T>(selector: Selector<R, T>) => {
        return selector(reduxStore.getState());
    },
    dispatch : (action: Action | any) => {
        reduxStore.dispatch(action);
    }
};

export const select = (selector) => {
    if (selector)
        return (target, key) => {
            Object.defineProperty(target, key, {
                get: () => selector instanceof Array ? store.select(genericSelector(selector)) : store.select(selector),
                enumerable: true,
                configurable: true,
            });
        }
};

export const get = (selector) => {
    if (selector)
        return (target, key) => {
            Object.defineProperty(target, key, {
                get: () => selector instanceof Array ? store.selectSync(genericSelector(selector)) : store.selectSync(selector),
                enumerable: true,
                configurable: true,
            });
        }
};

export const dispatch = () => {
    return (target, key, descriptor?) => {
        let originalMethod;
        const wrapped = (...args) => {
            const result = originalMethod.apply(this, args);

            if (result !== undefined && store)
                store.dispatch(result);

            return result;
        };

        descriptor = descriptor || Object.getOwnPropertyDescriptor(target, key);

        if (descriptor === undefined)
        {
            const dispatchDescriptor = {
                get: () => wrapped,
                set: setMethod => (originalMethod = setMethod),
            };
            Object.defineProperty(target, key, dispatchDescriptor);

            return dispatchDescriptor;
        }
        else
        {
            originalMethod = descriptor.value;
            descriptor.value = wrapped;
            return descriptor;
        }
    }
};
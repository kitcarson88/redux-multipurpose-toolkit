import { OnInit, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { Selector, Action, configureStore, createSelector, getDefaultMiddleware, combineReducers } from '@reduxjs/toolkit';
import { Store, Reducer, AnyAction } from 'redux';
import { FluxStandardAction } from 'flux-standard-action';
import { createEpicMiddleware, Epic, combineEpics } from 'redux-observable-es6-compat';
import createSagaMiddleware from 'redux-saga';
import { persistStore } from 'redux-persist';
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

var staticReducers = {};
var dynamicReducers = {};

var epicMiddleware;
var staticEpics;
var dynamicEpics = {};

export const initializeStore = (options: MultipurposeStoreOptions) => {
    if (reduxStore)
        throw Error("A redux store is initialized yet. Cannot initialize another one");

    const {
        reducers,
        devTools,
        middlewares,
        enhancers,
        preloadedState,
        defaultMiddlewareOptions,
        sagas,
        epics,
        enablePersistence,
        router,
        logLevel
    } = options;

    let middleware = [];
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

    /*let enhancer;
    if (!enhancers)
        enhancer = [];
    else
        enhancer = [...enhancers];*/

    staticReducers = reducers;

    const newStore = configureStore({
        reducer: combineReducers(reducers),
        devTools,
        preloadedState,
        middleware,
        enhancers
    });

    //Executing epics
    if (epicMiddleware)
    {
        staticEpics = epics;
        epicMiddleware.run(staticEpics());
    }

    //Executing sagas
    if (sagaMiddleware)
        sagaMiddleware.run(sagas);

    if (enablePersistence)
        persistStore(newStore);

    //Finally save store instance
    reduxStore = newStore;

    if (router)
    {
        store.addReducer(router.key, router.reducer);
        router.service.init();
    }
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
    selectSync: <R, T>(selector: Selector<R, T>) => {
        return selector(reduxStore.getState());
    },
    dispatch: (action: Action | any) => {
        reduxStore.dispatch(action);
    },
    addReducer: <S = any, A extends Action = AnyAction>(key: string, reducer: Reducer<S, A>) => {
        if (!key || dynamicReducers[key])
            throw (`A reducer with key '${key}' is already injected. Injection aborted`);
        
        dynamicReducers[key] = reducer;
        reduxStore.replaceReducer(combineReducers({ ...staticReducers, ...dynamicReducers }));
    },
    removeReducer: (key: string) => {
        if (!key || !dynamicReducers[key])
            throw (`No reducer with key '${key}' found. Remove aborted`);

        delete dynamicReducers[key];
        reduxStore.replaceReducer(combineReducers({ ...staticReducers, ...dynamicReducers }));
    },
    addEpic: <Input extends Action = any, Output extends Input = Input, State = any, Dependencies = any>(key: string, epic: Epic<Input, Output, State, Dependencies>) => {
        if (!key || dynamicEpics[key])
            throw (`An epic with key '${key}' is already injected. Injection aborted`);

        if (epicMiddleware)
        {
            dynamicEpics[key] = epic;
            
            let epicsArray = Object.values(dynamicEpics);
            epicMiddleware.run(combineEpics(
                staticEpics,
                combineEpics(epicsArray)
            ));
        }
        else
            throw ("The epics functionality was not enabled on the store.\nPlease pass 'epics' parameter to initializeStore with true boolean, or passing some combined epics");
    },
    removeEpic: (key: string) => {
        if (!key || dynamicEpics[key])
            throw (`No epic with key '${key}' found. Remove aborted`);

        if (epicMiddleware)
        {
            delete dynamicEpics[key];

            let epicsArray = Object.values(dynamicEpics);
            epicMiddleware.run(combineEpics(
                staticEpics,
                combineEpics(epicsArray)
            ));
        }
        else
            throw ("The epics functionality was not enabled on the store.\nPlease pass 'epics' parameter to initializeStore with true boolean, or passing some combined epics");
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

interface InjectorRequireOnInit extends OnInit {
}
interface IFunction { 
  new(...args: any[]): InjectorRequireOnInit;
}
interface DeallocatorRequireOnDestroy extends OnDestroy {
}
interface DFunction { 
  new(...args: any[]): DeallocatorRequireOnDestroy;
}

export function ReducerInjector(reducers: { key: string, reducer: Reducer }[]): <T extends IFunction>(constructor: T) => T {
    return function decorator<T extends IFunction>(constructor: T): T {
        return class extends constructor
        {
            ngOnInit(): void
            {
                for (let i = 0; i < reducers.length; ++i)
                {
                    try
                    {
                        store.addReducer(reducers[i].key, reducers[i].reducer);
                    }
                    catch (error) {
                        //No error, simply reducer was injected yet
                    }
                }

                super.ngOnInit();
            }
        };
    };
}

export function ReducerDeallocator(reducers: { key: string }[]): <T extends DFunction>(constructor: T) => T {
    return function decorator<T extends DFunction>(constructor: T): T {
        return class extends constructor
        {
            ngOnDestroy(): void
            {
                for (let i = 0; i < reducers.length; ++i)
                {
                    try
                    {
                        store.removeReducer(reducers[i].key);
                    }
                    catch (error) {
                        //No error, simply reducer was injected yet
                    }
                }

                super.ngOnDestroy();
            }
        };
    };
}

export function EpicInjector(epics: { key: string, epic: Epic }[]): <T extends IFunction>(constructor: T) => T {
    return function decorator<T extends IFunction>(constructor: T): T {
        return class extends constructor
        {
            ngOnInit(): void
            {
                for (let i = 0; i < epics.length; ++i)
                {
                    try
                    {
                        store.addEpic(epics[i].key, epics[i].epic);
                    }
                    catch (error) {
                        //Catch and relauch error only if epics were not enabled on store
                        if (error.contains("The epics functionality was not enabled"))
                            throw error;
                    }
                }

                super.ngOnInit();
            }
        };
    };
}

export function EpicDeallocator(epics: { key: string }[]): <T extends DFunction>(constructor: T) => T {
    return function decorator<T extends DFunction>(constructor: T): T {
        return class extends constructor
        {
            ngOnDestroy(): void
            {
                for (let i = 0; i < epics.length; ++i)
                {
                    try
                    {
                        store.removeEpic(epics[i].key);
                    }
                    catch (error) {
                        //Catch and relauch error only if epics were not enabled on store
                        if (error.contains("The epics functionality was not enabled"))
                        throw error;
                    }
                }

                super.ngOnDestroy();
            }
        };
    };
}
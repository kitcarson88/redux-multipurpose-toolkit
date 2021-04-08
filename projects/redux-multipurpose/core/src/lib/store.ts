import { Observable, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { Selector, Action, configureStore, createSelector, getDefaultMiddleware, combineReducers } from '@reduxjs/toolkit';
import { Store, Reducer, AnyAction } from 'redux';
import { FluxStandardAction } from 'flux-standard-action';
import { createEpicMiddleware, Epic } from 'redux-observable-es6-compat';
import createSagaMiddleware from 'redux-saga';
import {
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
} from 'redux-persist';
import { createResponsiveStateReducer, responsiveStateReducer, responsiveStoreEnhancer, calculateResponsiveState } from 'redux-responsive';
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

var epics$;

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
        enableResponsiveness,
        router,
        logLevel
    } = options;

    let enhancer = enhancers;
    let middleware = [];
    let sagaMiddleware;
    let epicMiddleware;

    let middlewareOptions = defaultMiddlewareOptions;
    if (enablePersistence)
    {
        if (!middlewareOptions)
            middlewareOptions = {};
        if (!middlewareOptions.serializableCheck || typeof middlewareOptions === 'boolean')
            middlewareOptions.serializableCheck = {};
        if (typeof middlewareOptions.serializableCheck === 'object')
        {
            if (!middlewareOptions.serializableCheck.ignoredActions)
                middlewareOptions.serializableCheck.ignoredActions = [];
            
            if (middlewareOptions.serializableCheck.ignoredActions.indexOf(FLUSH) < 0)
                middlewareOptions.serializableCheck.ignoredActions.push(FLUSH);
            if (middlewareOptions.serializableCheck.ignoredActions.indexOf(REHYDRATE) < 0)
                middlewareOptions.serializableCheck.ignoredActions.push(REHYDRATE);
            if (middlewareOptions.serializableCheck.ignoredActions.indexOf(PAUSE) < 0)
                middlewareOptions.serializableCheck.ignoredActions.push(PAUSE);
            if (middlewareOptions.serializableCheck.ignoredActions.indexOf(PERSIST) < 0)
                middlewareOptions.serializableCheck.ignoredActions.push(PERSIST);
            if (middlewareOptions.serializableCheck.ignoredActions.indexOf(PURGE) < 0)
                middlewareOptions.serializableCheck.ignoredActions.push(PURGE);
            if (middlewareOptions.serializableCheck.ignoredActions.indexOf(REGISTER) < 0)
                middlewareOptions.serializableCheck.ignoredActions.push(REGISTER);
        }
    }

    if (enableResponsiveness)
    {
        if (!middlewareOptions)
            middlewareOptions = {};
        if (!middlewareOptions.serializableCheck || typeof middlewareOptions === 'boolean')
            middlewareOptions.serializableCheck = {};
        if (typeof middlewareOptions.serializableCheck === 'object')
        {
            if (!middlewareOptions.serializableCheck.ignoredActions)
                middlewareOptions.serializableCheck.ignoredActions = [];
            
            if (middlewareOptions.serializableCheck.ignoredActions.indexOf("redux-responsive/CALCULATE_RESPONSIVE_STATE") < 0)
                middlewareOptions.serializableCheck.ignoredActions.push("redux-responsive/CALCULATE_RESPONSIVE_STATE");
        }
    }

    middleware = initializeWithDefaultMiddleware(middlewareOptions);

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

    if (enableResponsiveness)
    {
        let browserReducer;

        if (typeof enableResponsiveness === 'object' && enableResponsiveness.breakpoints)
            browserReducer = createResponsiveStateReducer(enableResponsiveness.breakpoints, enableResponsiveness.options);
        else
            browserReducer = responsiveStateReducer;
            
        if (!reducers['browser'])
            reducers['browser'] = browserReducer;
        else
            throw("A browser reducer already exists. Cannot enable redux-responsive module");

        if (!enhancer)
            enhancer = [ responsiveStoreEnhancer ];
        else
            enhancer = [ ...enhancer, responsiveStoreEnhancer ];
    }

    staticReducers = reducers;

    const newStore = configureStore({
        reducer: combineReducers(reducers),
        devTools,
        preloadedState,
        middleware,
        enhancers: enhancer
    });

    epics$ = new BehaviorSubject(epics);
    const hotReloadingEpics = (action$, state$, dependencies) =>
        epics$.pipe(
            switchMap((epic: Epic) => epic(action$, state$, dependencies))
        );

    //Executing epics
    if (epicMiddleware)
        epicMiddleware.run(hotReloadingEpics);

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

    if (enableResponsiveness)
        window.addEventListener('resize', () => store.dispatch(calculateResponsiveState(window)));
};

export const store = {
    getState$: (): Observable<any> => {
        return new Observable(function (observer) {
            observer.next(reduxStore.getState());
            
            const unsubscribe = reduxStore.subscribe(function () {
                observer.next(reduxStore.getState());
            });
            
            return unsubscribe;
        });
    },
    getState: () => {
        return reduxStore.getState();
    },
    select: <R, T>(selector: Selector<R, T>): Observable<T> =>{
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
    replaceEpics: (newRootEpic) => {
        epics$.next(newRootEpic);
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
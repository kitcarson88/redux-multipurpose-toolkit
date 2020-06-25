import { ConfigureEnhancersCallback, StoreEnhancer, DeepPartial, Reducer, Action, AnyAction, ReducersMapObject } from '@reduxjs/toolkit';

import { Epic } from 'redux-observable-es6-compat';

export interface MultipurposeStoreOptions<S = any, A extends Action = AnyAction> {
    reducer: Reducer<S, A> | ReducersMapObject<S, A>,
    middlewares: any[],
    devTools: boolean,
    preloadedState?: DeepPartial<S extends any ? S : S>,
    enhancers?: StoreEnhancer[] | ConfigureEnhancersCallback,
    defaultMiddlewareOptions?: {
        thunk: boolean,
        immutableCheck: boolean,
        serializableCheck: boolean
    },
    sagas?: any,
    epics?: any;
    logLevel?: string;
}
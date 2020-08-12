import {
    StoreEnhancer,
    DeepPartial,
    Reducer,
    Action,
    AnyAction,
    ReducersMapObject,
    ImmutableStateInvariantMiddlewareOptions,
    SerializableStateInvariantMiddlewareOptions
} from '@reduxjs/toolkit';
import { IResponsiveReducerOptions, IBreakPoints } from 'redux-responsive';

export interface ResponsivenessOptions {
    breakpoints: IBreakPoints,
    options?: IResponsiveReducerOptions<IBreakPoints, {}>
}

export interface MultipurposeStoreOptions<S = any, A extends Action = AnyAction> {
    reducers: ReducersMapObject<S, any>,
    middlewares: any[],
    devTools: boolean,
    preloadedState?: DeepPartial<S extends any ? S : S>,
    enhancers?: StoreEnhancer[],
    defaultMiddlewareOptions?: {
        thunk?: any,
        immutableCheck?: boolean | ImmutableStateInvariantMiddlewareOptions,
        serializableCheck?: boolean | SerializableStateInvariantMiddlewareOptions
    },
    sagas?: any,
    epics?: any,
    enablePersistence?: boolean,
    enableResponsiveness?: boolean | ResponsivenessOptions,
    router: { key: string; reducer: Reducer, service },
    logLevel?: string
}

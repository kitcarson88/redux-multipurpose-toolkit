import { ConfigureEnhancersCallback, StoreEnhancer, DeepPartial, Reducer, Action, AnyAction, ReducersMapObject } from '@reduxjs/toolkit';

export interface MultipurposeStoreOptions<S = any, A extends Action = AnyAction> {
    reducers: ReducersMapObject<S, any>,
    middlewares: any[],
    devTools: boolean,
    preloadedState?: DeepPartial<S extends any ? S : S>,
    enhancers?: StoreEnhancer[],
    defaultMiddlewareOptions?: {
        thunk: boolean,
        immutableCheck: boolean,
        serializableCheck: boolean
    },
    sagas?: any,
    epics?: any[],
    enablePersistence?: boolean,
    router: { key: string; reducer: Reducer, service }
    logLevel?: string
}

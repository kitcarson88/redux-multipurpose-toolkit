import { ConfigureStoreOptions } from '@reduxjs/toolkit';

import { Epic } from 'redux-observable-es6-compat';

export interface MultipurposeStoreOptions extends ConfigureStoreOptions {
    defaultMiddlewareOptions?: {
        thunk: boolean,
        immutableCheck: boolean,
        serializableCheck: boolean
    }
    rootSaga?: any,
    rootEpic?: Epic<any, any, any, any>;
    logLevel?: string;
}
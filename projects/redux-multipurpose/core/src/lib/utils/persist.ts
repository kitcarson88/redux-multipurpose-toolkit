import { Action, Reducer } from 'redux';
import { PersistConfig, persistReducer } from 'redux-persist';
import { encryptTransform } from 'redux-persist-transform-encrypt'

type StateReconciler<S> =
    (inboundState: any, state: S, reducedState: S, config: PersistConfig<S>) => S;

export const createStoredReducer = <S, A extends Action = Action>(key: string, storage: any, reducer: Reducer, stateReconciler?: false | StateReconciler<S>) => {
    return persistReducer<S, A>({ key, storage, stateReconciler }, reducer);
};

export const createSecureStoredReducer = <S, A extends Action = Action>(key: string, encryptKey: string, storage: any, reducer: Reducer, stateReconciler?: false | StateReconciler<S>) => {
    const encryptor = encryptTransform({
        secretKey: encryptKey,
        onError: (error) => {
            console.log("An error occured during secure data save: ", error);
        }
    });

    const secureStoragePersistConfig: PersistConfig<S>  = {
        key,
        storage,
        transforms: [ encryptor ],
        stateReconciler
    };
    return persistReducer<S, A>(secureStoragePersistConfig, reducer);
};
import { Reducer } from 'redux';
import { persistReducer } from 'redux-persist';
import { encryptTransform } from 'redux-persist-transform-encrypt';

export const createStoredReducer = (key: string, storage: any, reducer: Reducer) => {
    return persistReducer({ key, storage }, reducer);
};

export const createSecureStoredReducer = (key: string, encryptKey: string, storage: any, reducer: Reducer) => {
    const encryptor = encryptTransform({
        secretKey: encryptKey,
        onError: (error) => {
            console.log("An error occured during secure data save: ", error);
        }
    });

    const secureStoragePersistConfig = {
        key,
        storage,
        transforms: [ encryptor ]
    };
    return persistReducer(secureStoragePersistConfig, reducer);
};
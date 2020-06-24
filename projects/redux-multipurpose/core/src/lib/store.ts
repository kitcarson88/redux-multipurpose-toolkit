import { Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { Selector, Action, createSelector } from '@reduxjs/toolkit';
import { Store } from 'redux';

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

var reduxStore: Store;

export const initializeStore = (store) => {
    if (!reduxStore)
        reduxStore = store;
    else
        throw Error("A redux store is initialized yet. Cannot initialize another one");
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
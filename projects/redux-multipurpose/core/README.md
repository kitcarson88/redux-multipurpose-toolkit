# @redux-multipurpose/core

## Installation
Redux Multipurpose core is available as a package on NPM:

    npm install @redux-multipurpose/core

## Purpose
The Redux Multipurpose core package is intended to:
- ease the integration of a @reduxjs/toolkit based redux store
- ease the integration of some redux subpackages commonly used
- provide to the developer a @reduxjs/toolkit store, with some enhanced functionalities

The store can be initialized simply with an `initializeStore()`, and then imported and used including the instance `store`.
The initialization is based on [@reduxjs/toolkit](https://www.npmjs.com/package/@reduxjs/toolkit) `configureStore` method. Please refer to [its documentation](https://github.com/reduxjs/redux-toolkit) about reducers, enhancers, middlewares, preloaded state and dev tools configurations.

### Store
Redux Multipurpose store includes these APIs:
- `getState()`: provides a RxJs Observable with whole store state
- `select()`: that lets to retrieve a specific store substate as RxJs Observable
- `selectSync()`: similar to `select`, but returns the data directly, not as an Observable
- `dispatch()`: that lets to dispatch to the store an action
- `addReducer()`: that lets to add dynamically a new reducer to the store binding it with a string key
- `removeReducer()`: that lets to remove a dynamic reducer previously added; it can't remove reducers not dynamically added 

### Included redux packages:
Here the list of included redux packages. Please refer to their own documentations to customize their in app integration.

- [Redux saga](https://www.npmjs.com/package/redux-saga): it's an extension of redux actions triggering, to create sagas; it aims to make application side effects easier to manage, more efficient to execute, easy to test, and better at handling failures; a saga let complex actions management such as to launch an action at the arrive of another, to sync some parallel triggered actions, etc.
- [Redux observable](https://www.npmjs.com/package/redux-observable-es6-compat): it's a RxJS-based middleware for Redux; really similar to redux saga, it let to create epics; an epic is conceptually used to concatenate different actions of a same process; it's provided by redux-observable-es6-compat package due to angular project ES6 targeted compatibility
- [Redux persist](https://www.npmjs.com/package/redux-persist): it let to save the entire store state or some store substates datas using its internal storage built-in system based on localStorage or with custom storage implementations
- [Redux logger](https://www.npmjs.com/package/redux-logger): it logs every action and store state change to facilitate development

### Enhancements
Under this section will be described enhanced functionalities of Redux Multipurpose store

#### Decorators
Similar to some [@angular-redux/store](https://www.npmjs.com/package/@angular-redux/store) decorators, Redux multipurpose let the developer to use these decorators:
- `select`: that lets to bind a class variable to a store substate; in this way data can be accessed without calling select method directly on store
- `get`: similar to select, it wraps previously described selectSync method to directly retrieve store substate
- `dispatch`: binded to a class method, it lets to trigger an action dispatch; the method must return the action to be dispatched
- `ReducerInjector` (only on Angular): binded to a component, it lets to dynamically add a reducer; it needs a definition of Angular component OnInit callback

#### Router reducer
As @angular-redux, the `initializeStore` method lets to initialize a routing reducer to track navigation changes, and to dispatch a page change event.

The object to be passed to router variable of `initializeStore` needs these parameters:
- `key`: a string to identify the substate in the store (it will be mounted dynamically)
- `reducer`: the reducer to add that applies track navigation and page changes actions
- `service`: a service that must implement an `init` method, that applies page changes reflections on router substate changes.

For Angular applications, an implementation is provided with @redux-multipurpose/angular-router package.

#### Other utilities
The utils directory contains some store utilities that can be used on store common substates configurations.

`ws` utils let the developer to easily create and configure a web service wrapper substate. It provides these methods:
- `createWsInitialState`: that lets to create a tipical initial ws substate configuration for a specific data to retrieve from a web service, with `loading`, `error`, and `data` common state informations
- `prepareThunk`: that prepares for a subdata of ws substate, a specific redux thunk to retrieve datas.
- `prepareThunkActionReducers`: it creates the @reduxjs/toolkit slice for the specific subdata, to bind actions and the reducer with tipical state changes on web service call execution

`persist` utils let the developer to easily create a reducer relative to a substate that will be persisted by redux-persist. It provides:
- `createStoredReducer` to normally apply this persistence
- `createSecureStoredReducer` to persist the substate in a secure way, passing as input a dedicated encryption key

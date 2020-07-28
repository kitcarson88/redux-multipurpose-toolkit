# @redux-multipurpose/core

## Installation
Redux Multipurpose is available as a package on NPM:

    npm install @redux-multipurpose/core

## Purpose
The Redux Multipurpose core package is intended to:
- ease the integration of a @reduxjs/toolkit based redux store
- ease the integration of some redux subpackages commonly used
- 

By a simple `initializeStore()` api the developer can initialize all store base parts (such as reducers, middlewares, enhancers, and devTools), and all redux subpackages included into the software suite.

### Included redux packages:
Here the list of included redux packages. Please refer to their own documentations to customize their in app integration.

- [Redux saga](https://www.npmjs.com/package/redux-saga): it's an extension of redux actions triggering, to create sagas; it aims to make application side effects easier to manage, more efficient to execute, easy to test, and better at handling failures; a saga let complex actions management such as to launch an action at the arrive of another, to sync some parallel triggered actions, etc.
- [Redux observable](https://www.npmjs.com/package/redux-observable-es6-compat): it's a RxJS-based middleware for Redux; really similar to redux saga, it let to create epics; an epic is conceptually used to concatenate different actions of a same process; it's provided by redux-observable-es6-compat package due to angular project ES6 targeted compatibility
- [Redux persist](https://www.npmjs.com/package/redux-persist): it let to save the entire store state or some store substates datas using its internal storage built-in system based on localStorage or with custom storage implementations
- [Redux logger](https://www.npmjs.com/package/redux-logger): it logs every action and store state change to facilitate development


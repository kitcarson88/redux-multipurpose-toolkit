# @redux-multipurpose/core

## Installation
Redux Multipurpose is available as a package on NPM:

    npm install @redux-multipurpose/core

## Purpose
The Redux Multipurpose package is intended to ease the integration of a @reduxjs/toolkit based redux store and its subpackages.

By a simple `initializeStore()` api the developer can initialize all store base parts (such as reducers, middlewares, enhancers, and devTools), and all redux subpackages included into the software suite.

### Included redux packages:
- [Redux saga](https://www.npmjs.com/package/redux-saga): it's an extension of redux actions triggering, to create sagas; it aims to make application side effects easier to manage, more efficient to execute, easy to test, and better at handling failures; a saga let complex actions management such as to launch an action at the arrive of another, to sync some parallel triggered actions, etc.
- [Redux observable](https://www.npmjs.com/package/redux-observable-es6-compat): it's a RxJS-based middleware for Redux; really similar to redux saga, it let to create epics; an epic is conceptually used to concatenate different actions of a same process; it's provided by redux-observable-es6-compat package due to angular project ES6 targeted compatibility

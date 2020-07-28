# redux-multipurpose-toolkit
The repository is an Angular 2+ project that contains libraries of a suite of redux facilities called @redux-multipurpose.
Based on @reduxjs/toolkit, the purpose of this suite is to ease the developer during redux integration, including some of most popular redux packages commonly used.

## @Redux-multipurpose
The suite is composed from:
- @redux-multipurpose/core: in addition to common redux store functionalities such as operations of actions dispatching and state selection (both synchronously and asynchronously), it let the developer to easily initialize redux subpackages (such as redux-logger, redux-saga, redux-observable, etc.). It offers also some combinators to ease data selection operations and actions dispatching tipically used in @angular-redux/store (not provided in with this project).
- @redux-multipurpose/angular-router: the core package offers the possibility to integrate a navigation routing track providing during initialization a custom reducer. @redux-multipurpose/angular-router is an implementation that can be used in an Angular 2+ application.
- @redux-multipurpose/angular-cli: Redux Multipurpose command line tool to integrate redux-multipurpose in an Angular 2+ application. In addition to the create and integrate store functionalities, it let the developer to automate the creation and the integration of base files and lines of code to add new substates, epics, sagas and others redux stuff

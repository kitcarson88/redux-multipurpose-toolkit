import { EntityAdapter, createAsyncThunk } from '@reduxjs/toolkit';

////////////////// State utils
type WsSubstate = { data?: any; loading?: boolean; error?: any | null; };

const DEFAULT_INITIAL_SUBSTATE: WsSubstate = { data: null, loading: false, error: null };

export class WsState
{
    [key: string]: WsSubstate;
}

let initialState: WsState;

export const createWsInitialState = (substates: (WsState | string)[]) => {
    let state: WsState = {};

    for (let substate of substates)
    {
        if (typeof substate == 'string')
            state[substate] = DEFAULT_INITIAL_SUBSTATE;
        else
        {
            let key = Object.keys(substate)[0];
            state[key] = {
                ...substate[key],
                loading: substate[key].loading? substate[key].loading : false,
                data: substate[key].data? substate[key].data : null,
                error: substate[key].error? substate[key].error : null,
            };
        }
    }

    initialState = state;

    return state;
};

////////////////// Actions utils

//Thunk creator helper
export const prepareThunk = (state: string, id: string, callback: any) =>
{
    return createAsyncThunk(
        state + '/' + id,
        callback
    );
};

export const prepareThunkActionReducers = (thunksWithStates: { thunk: any, substate: string, adapter: EntityAdapter<any> }[]) => {
    let reducers = {};

    for (let storeInfos of thunksWithStates)
    {
        let { thunk, substate, adapter } = storeInfos;

        reducers = {
            ...reducers,
            [thunk.pending.toString()]: state => {
                return {
                    ...state,
                    [substate]: {
                        ...initialState[substate],
                        loading: true
                    }
                };
            },
            [thunk.fulfilled.toString()]: (state: WsState, action) => {
                state[substate].loading = false;

                if (adapter != null && adapter != undefined)
                    adapter.setAll(state[substate].data, action.payload);
                else
                    state[substate].data = action.payload;
            },
            [thunk.rejected.toString()]: (state, action) => {
                state[substate].loading = false;
                state[substate].error = action.error;
            }
        };
    }

    return reducers;
};
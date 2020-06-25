import { EntityAdapter } from '@reduxjs/toolkit';

type WsSubstate = { data?: any; loading?: boolean; error?: any | null; };

const DEFAULT_INITIAL_STATE: WsSubstate = { data: null, loading: false, error: null };

export class WsState
{
    [key: string]: WsSubstate;
}

export const createWsInitialState = (substates: (WsState | string)[]) => {
    let state: WsState = {};

    for (let substate of substates)
    {
        if (typeof substate == 'string')
            state[substate] = DEFAULT_INITIAL_STATE;
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

    return state;
};
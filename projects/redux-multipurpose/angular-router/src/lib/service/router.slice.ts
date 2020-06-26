import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RouterState, INITIAL_STATE_ROUTER } from './router.model';

const routerSlice = createSlice({
    name: 'router',
    initialState: INITIAL_STATE_ROUTER,
    reducers: {
        updateUrl(state: RouterState, action: PayloadAction<string>) {
            return action.payload;
        },
        goToUrl(state: RouterState, action: PayloadAction<string>) {
            return action.payload;
        }
    }
});

const { actions, reducer } = routerSlice;

export const routerReducer = reducer;
export const { goToUrl, updateUrl } = actions;
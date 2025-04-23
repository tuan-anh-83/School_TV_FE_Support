import { createSlice } from "@reduxjs/toolkit";

export const userLoginSlice = createSlice({
    name: "userData",
    initialState: {
        user: null,
    },
    reducers: {
        login: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null;
        },
    },
});

export const { login, logout } = userLoginSlice.actions;
export default userLoginSlice.reducer;
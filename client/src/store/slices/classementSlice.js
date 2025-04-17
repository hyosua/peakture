import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import axios from 'axios'



// Thunk pour récupérer les données du classement
export const fetchClassement = createAsyncThunk(

    'classement/fetchClassement',
    async(familyId, { rejectWithValue }) => {
            const API_URL = `${import.meta.env.VITE_API_URL}/api/classement/${familyId}/annuel`
        try{
            console.log("Sending fetchClassement request:", familyId)
            const response = await axios.get(API_URL);
            console.log("Response:", response.data)
            return response.data;
        } catch(error){
            return rejectWithValue(error.response.data);
        }
    }
)

const classementSlice = createSlice({
    name: 'classement',
    initialState: {
        rankings: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClassement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClassement.fulfilled, (state, action) => {
                state.loading = false;
                state.rankings = action.payload;
            })
            .addCase(fetchClassement.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default classementSlice.reducer;
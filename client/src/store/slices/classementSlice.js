import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import axios from 'axios'
import { useAuth } from '../../context/AuthContext'



// Thunk pour récupérer les données du classement
export const fetchClassement = createAsyncThunk(

    'classement/fetchClassement',
    async(_, { rejectWithValue }) => {
            const {currentFamily} = useAuth()
            const API_URL = `/api/${currentFamily}/classement`
        try{
            const response = await axios.get(API_URL);
            return response.data;
        } catch(error){
            return rejectWithValue(error.response.data);
        }
    }
)

const classementSlice = createSlice({
    name: 'classement',
    initialState: {
        classement: [],
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
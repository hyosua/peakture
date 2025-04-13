import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import axios from 'axios'



// Thunk pour récupérer les données du classement
export const fetchClassementAlbum = createAsyncThunk(

    'classement/fetchClassementAlbum',
    async(familyId, { rejectWithValue }) => {
            const API_URL = `http://localhost:5000/api/classement/${familyId}/album`
        try{
            console.log("Sending fetchClassementAlbum request:", familyId)
            const response = await axios.get(API_URL);
            return response.data;
        } catch(error){
            return rejectWithValue({
                status: error.response?.status,
                message: error.response?.data?.message || error.message
            });
        }
    }
)

const classementAlbumSlice = createSlice({
    name: 'classement-mensuel',
    initialState: {
        albumRankings: [],
        albumLoading: false,
        albumError: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClassementAlbum.pending, (state) => {
                state.albumLoading = true;
                state.albumError = null;
            })
            .addCase(fetchClassementAlbum.fulfilled, (state, action) => {
                state.albumLoading = false;
                state.albumRankings = action.payload;
            })
            .addCase(fetchClassementAlbum.rejected, (state, action) => {
                state.albumLoading = false;
                state.albumError = action.payload;
            });
    },
});

export default classementAlbumSlice.reducer;
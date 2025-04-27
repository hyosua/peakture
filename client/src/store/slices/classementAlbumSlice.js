import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import axios from 'axios'



// Thunk pour récupérer les données du classement
export const fetchClassementAlbum = createAsyncThunk(

    'classement/fetchClassementAlbum',
    async(familyId, { rejectWithValue }) => {
            const API_URL = `${import.meta.env.VITE_API_URL}/api/classement/${familyId}/album`
        try{
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
        albumInfo: null,
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
                state.albumRankings = action.payload.classement;
                state.albumInfo = action.payload.album;
            })
            .addCase(fetchClassementAlbum.rejected, (state, action) => {
                state.albumLoading = false;
                state.albumError = action.payload;
            });
    },
});

export default classementAlbumSlice.reducer;
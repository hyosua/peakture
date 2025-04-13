import { configureStore } from '@reduxjs/toolkit'
import classementReducer from './slices/classementSlice.js'
import classementAlbumReducer  from './slices/classementAlbumSlice.js'

export const store = configureStore({
    reducer: {
        classement: classementReducer,
        classementAlbum: classementAlbumReducer,
    }
})
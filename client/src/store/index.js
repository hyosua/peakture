import { configureStore } from '@reduxjs/toolkit'
import classementReducer from './slices/classementSlice.js'

export const store = configureStore({
    reducer: {
        classement: classementReducer,
    }
})
import { configureStore } from '@reduxjs/toolkit'
import appReducer from './slices/appSlice'
import userReducer from './slices/userSlice'
import enumItemReducer from './slices/enumItemSlice'
import tagsViewReducer from './slices/tagsViewSlice'
import subjectReducer from './slices/subjectSlice'
import groupReducer from './slices/groupSlice'

export const store = configureStore({
    reducer: {
        app: appReducer,
        user: userReducer,
        enumItem: enumItemReducer,
        tagsView: tagsViewReducer,
        subject: subjectReducer,
        group: groupReducer
    }
})

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Cookies from 'js-cookie'
import * as userApi from '@/api/user'

export const initUserInfo = createAsyncThunk(
    'user/initUserInfo',
    async () => {
        const response = await userApi.getCurrentUser()
        return response.response
    }
)

const initialState = {
    userName: Cookies.get('adminUserName'),
    userInfo: Cookies.get('adminUserInfo') ? JSON.parse(Cookies.get('adminUserInfo')) : null
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserName: (state, action) => {
            state.userName = action.payload
            Cookies.set('adminUserName', action.payload, { expires: 30 })
        },
        setUserInfo: (state, action) => {
            state.userInfo = action.payload
            Cookies.set('adminUserInfo', JSON.stringify(action.payload), { expires: 30 })
        },
        clearLogin: (state) => {
            state.userName = null
            state.userInfo = null
            Cookies.remove('adminUserName')
            Cookies.remove('adminUserInfo')
        }
    },
    extraReducers: (builder) => {
        builder.addCase(initUserInfo.fulfilled, (state, action) => {
            state.userInfo = action.payload
            Cookies.set('adminUserInfo', JSON.stringify(action.payload), { expires: 30 })
        })
    }
})

export const { setUserName, setUserInfo, clearLogin } = userSlice.actions
export default userSlice.reducer

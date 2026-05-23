import { createSlice } from '@reduxjs/toolkit'
import Cookies from 'js-cookie'

const INITIAL_STATE = {
    sidebar: {
        opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
        withoutAnimation: false
    },
    device: 'desktop',
    size: Cookies.get('size') || 'medium'
}

const appSlice = createSlice({
    name: 'app',
    initialState: INITIAL_STATE,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebar.opened = !state.sidebar.opened
            state.sidebar.withoutAnimation = false
            if (state.sidebar.opened) {
                Cookies.set('sidebarStatus', 1)
            } else {
                Cookies.set('sidebarStatus', 0)
            }
        },
        closeSidebar: (state, action) => {
            Cookies.set('sidebarStatus', 0)
            state.sidebar.opened = false
            state.sidebar.withoutAnimation = action.payload
        },
        toggleDevice: (state, action) => {
            state.device = action.payload
        },
        setSize: (state, action) => {
            state.size = action.payload
            Cookies.set('size', action.payload)
        }
    }
})

export const { toggleSidebar, closeSidebar, toggleDevice, setSize } = appSlice.actions
export default appSlice.reducer

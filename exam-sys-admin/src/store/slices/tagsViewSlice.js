import { createSlice } from '@reduxjs/toolkit'

const INITIAL_STATE = {
    visitedViews: [],
    cachedViews: []
}

const tagsViewSlice = createSlice({
    name: 'tagsView',
    initialState: INITIAL_STATE,
    reducers: {
        addVisitedView: (state, action) => {
            const view = action.payload
            if (state.visitedViews.some(v => v.path === view.path)) return
            state.visitedViews.push(
                Object.assign({}, view, {
                    title: view.title || 'no-name'
                })
            )
        },
        addCachedView: (state, action) => {
            const view = action.payload
            if (state.cachedViews.includes(view.name)) return
            if (!view.meta?.noCache) {
                state.cachedViews.push(view.name)
            }
        },
        delVisitedView: (state, action) => {
            const view = action.payload
            for (const [i, v] of state.visitedViews.entries()) {
                if (v.path === view.path) {
                    state.visitedViews.splice(i, 1)
                    break
                }
            }
        },
        delCachedView: (state, action) => {
            const view = action.payload
            const index = state.cachedViews.indexOf(view.name)
            index > -1 && state.cachedViews.splice(index, 1)
        },
        delOthersVisitedViews: (state, action) => {
            const view = action.payload
            state.visitedViews = state.visitedViews.filter(v => {
                return v.meta?.affix || v.path === view.path
            })
        },
        delOthersCachedViews: (state, action) => {
            const view = action.payload
            const index = state.cachedViews.indexOf(view.name)
            if (index > -1) {
                state.cachedViews = state.cachedViews.slice(index, index + 1)
            } else {
                state.cachedViews = []
            }
        },
        delAllVisitedViews: (state) => {
            const affixTags = state.visitedViews.filter(tag => tag.meta?.affix)
            state.visitedViews = affixTags
        },
        delAllCachedViews: (state) => {
            state.cachedViews = []
        },
        updateVisitedView: (state, action) => {
            const view = action.payload
            for (let v of state.visitedViews) {
                if (v.path === view.path) {
                    Object.assign(v, view)
                    break
                }
            }
        }
    }
})

export const {
    addVisitedView,
    addCachedView,
    delVisitedView,
    delCachedView,
    delOthersVisitedViews,
    delOthersCachedViews,
    delAllVisitedViews,
    delAllCachedViews,
    updateVisitedView
} = tagsViewSlice.actions

export default tagsViewSlice.reducer

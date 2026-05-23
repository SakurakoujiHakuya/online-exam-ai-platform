import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { listGroups } from '@/api/group'

const INITIAL_STATE = {
    groups: [],
    loading: false
}

export const fetchGroups = createAsyncThunk(
    'group/fetchGroups',
    async () => {
        const response = await listGroups()
        return response.response || []
    },
    {
        condition: (_, { getState }) => {
            const { group } = getState()
            if (group.loading || group.groups.length > 0) {
                return false
            }
        }
    }
)

const groupSlice = createSlice({
    name: 'group',
    initialState: INITIAL_STATE,
    reducers: {
        resetGroups: state => {
            state.groups = []
            state.loading = false
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchGroups.pending, state => {
                state.loading = true
            })
            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.loading = false
                state.groups = action.payload
            })
            .addCase(fetchGroups.rejected, state => {
                state.loading = false
            })
    }
})

export const { resetGroups } = groupSlice.actions

export default groupSlice.reducer

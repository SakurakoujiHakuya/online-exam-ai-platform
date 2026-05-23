import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { list } from '@/api/subject'

const INITIAL_STATE = {
    subjects: [],
    loading: false
}

export const fetchSubjects = createAsyncThunk(
    'subject/fetchSubjects',
    async () => {
        const response = await list()
        return response.response
    },
    {
        condition: (_, { getState }) => {
            const { subject } = getState()
            if (subject.loading || subject.subjects.length > 0) {
                return false
            }
        }
    }
)

const subjectSlice = createSlice({
    name: 'subject',
    initialState: INITIAL_STATE,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubjects.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchSubjects.fulfilled, (state, action) => {
                state.loading = false
                state.subjects = action.payload
            })
            .addCase(fetchSubjects.rejected, (state) => {
                state.loading = false
            })
    }
})

export default subjectSlice.reducer

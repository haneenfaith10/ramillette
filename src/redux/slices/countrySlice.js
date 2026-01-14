import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getActiveCountries } from '../../services/configApiService';

export const fetchCountries = createAsyncThunk('countries/fetchCountries', async (_, { rejectWithValue }) => {
  try {
    const res = await getActiveCountries();
    // If we get an empty array, still return it (don't reject)
    return res || [];
  } catch (error) {
    // Return empty array instead of rejecting to prevent app blocking
    console.error('Error in fetchCountries:', error);
    return rejectWithValue([]);
  }
});

const countrySlice = createSlice({
  name: 'countries',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default countrySlice.reducer;

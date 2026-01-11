import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getActiveCountries } from '../../services/configApiService';

export const fetchCountries = createAsyncThunk('countries/fetchCountries', async () => {
  const res = await getActiveCountries()
  return res;
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

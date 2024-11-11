import {createSlice} from '@reduxjs/toolkit';
interface IGeneral {
  countries: [];
}

const initialState: IGeneral = {
  countries: [],
};

export const general = createSlice({
  name: 'general',
  initialState,
  reducers: {
    getCountries: (state, action) => {
      state.countries = action.payload;
    },
  },
});

export const {getCountries} = general.actions;

export const countriesList = (state) => state.general.countries;
export default general.reducer;

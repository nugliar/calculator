import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: 0,
  operator: '',
  stack: []
}

const logicSlice = createSlice({
  name: 'logic',
  initialState,
  reducers: {

  }
})

export default logicSlice.reducer

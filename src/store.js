import { configureStore } from '@reduxjs/toolkit'

import logicReducer from './logicSlice'

export default configureStore({
  reducer: {
    logic: logicReducer
  }
})

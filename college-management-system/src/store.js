import { configureStore, combineReducers } from '@reduxjs/toolkit';

// Create a simple placeholder reducer
const placeholderReducer = (state = {}, _action) => state;

// Create a simple initial store with a placeholder reducer
const store = configureStore({
  reducer: {
    _placeholder: placeholderReducer
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Initialize async reducers
store.asyncReducers = {};

// Function to replace reducers
export const replaceReducers = () => {
  const combinedReducer = combineReducers({
    ...store.asyncReducers
  });

  store.replaceReducer(combinedReducer);
};

// Function to add reducers dynamically
export const injectReducer = (key, reducer) => {
  store.asyncReducers[key] = reducer;
  replaceReducers();
};

// Export the store
export { store };
export default store;

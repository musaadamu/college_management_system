import { createSelector } from '@reduxjs/toolkit';

// Base selector for state
const selectState = state => state || {};

// Memoized selector for auth state
export const selectAuth = createSelector(
  [selectState],
  (state) => state.auth || {}
);

// Memoized selector for user
export const selectUser = createSelector(
  [selectAuth],
  (auth) => auth.user || null
);

// Memoized selector for user role
export const selectUserRole = createSelector(
  [selectUser],
  (user) => user?.user?.role || null
);

// Memoized selector for auth loading state
export const selectAuthLoading = createSelector(
  [selectAuth],
  (auth) => auth.isLoading || false
);

// Memoized selector for auth error state
export const selectAuthError = createSelector(
  [selectAuth],
  (auth) => auth.isError || false
);

// Memoized selector for auth error message
export const selectAuthMessage = createSelector(
  [selectAuth],
  (auth) => auth.message || ''
);

// Memoized selector for auth success state
export const selectAuthSuccess = createSelector(
  [selectAuth],
  (auth) => auth.isSuccess || false
);

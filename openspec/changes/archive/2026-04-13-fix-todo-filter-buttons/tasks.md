## 1. Fix Button Styling

- [x] 1.1 Fix filter button active state: replace `bg-primary-600 text-white` with `bg-primary !text-on-primary hover-bg-primary-dark` in `src/pages/Todo/index.tsx` line 195
- [x] 1.2 Fix filter button inactive state: replace `bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600` with `bg-surface-muted text-secondary hover-bg-muted` in `src/pages/Todo/index.tsx` line 196
- [x] 1.3 Fix Add Task button: replace `bg-primary-600 hover:bg-primary-700 text-white` with `bg-primary hover-bg-primary-dark !text-on-primary` in `src/pages/Todo/index.tsx` line 173

## 2. Verification

- [x] 2.1 Run `yarn build` to verify no compilation errors

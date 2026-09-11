export default {
  '*.{ts,js,mjs,cjs}': ['eslint --fix --max-warnings=0'],
  '*.{ts,js,mjs,cjs,json,md,yml,yaml}': ['prettier --write'],
};

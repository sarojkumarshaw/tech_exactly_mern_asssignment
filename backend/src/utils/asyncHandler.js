/**
 * Higher-order function to eliminate try/catch repetition in controllers
 * Automatically forwards rejected promises to the global error middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

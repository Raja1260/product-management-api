// ============================================================
// utils/asyncHandler.js — Phase 4
// ============================================================
// A wrapper for async controller functions.
//
// The problem without asyncHandler:
//   Every async controller needs its own try-catch block.
//   If you forget try-catch, an async error crashes the server
//   instead of being caught by the global error middleware.
//
// The solution:
//   Wrap every controller with asyncHandler.
//   It catches any thrown error and passes it to next(error),
//   which hands it to the global error middleware in error.middleware.js.
//
// Before asyncHandler (verbose, repetitive):
//   createProduct = async (req, res, next) => {
//     try {
//       const product = await productService.createProduct(req.body);
//       res.json(product);
//     } catch (error) {
//       next(error);  // had to write this in every single controller
//     }
//   }
//
// After asyncHandler (clean):
//   createProduct = asyncHandler(async (req, res) => {
//     const product = await productService.createProduct(req.body);
//     res.json(product);
//   })
// ============================================================

const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Run the async function, and if it throws, pass the error to next()
    // next(error) triggers the global error middleware automatically
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;

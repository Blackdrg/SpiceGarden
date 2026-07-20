const origIncludes = Array.prototype.includes;
Array.prototype.includes = function (...args) {
  if (this === undefined || this === null) {
    console.error('INCLUDES-ON-UNDEFINED STACK:\n', new Error().stack);
    process.exit(7);
  }
  return origIncludes.apply(this, args);
};

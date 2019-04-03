const tailCallOptimize = (f) => {
  let value, active = false;
  const accumulated = [];
  return function accumulator(_this) {
    accumulated.push(arguments);
    if (!active) {
      active = true;
      while(accumulated.length) {
        value = f.apply(_this, accumulated.shift());
      }
      active = false;
      return value;
    }
  } 
}

module.exports = { tailCallOptimize }
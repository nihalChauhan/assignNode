//Function to get time
let now = function() {
  let date = new Date();
  return date.getTime();
};

module.exports = {
  now
};
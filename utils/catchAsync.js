// step 51, catching async error
module.exports = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};
  
export default class Handler {
  /**
   * Generate a request handler for a given method.
   * @param  {string} method Method to assign. Must exist on the class.
   * @return {function}      Request handler.
   * @private
   */
  handle(method) {
    if (!this[method]) throw new Error('Unknown method', method);
    return (req, res) => {
      this[method](args)
        .then((result, code) => {
          if (result) return res.json(code, result);
          return res.send(code, result);
        }).catch((err, code) => {
          return res.send(code, err);
        });
    };
  }
}

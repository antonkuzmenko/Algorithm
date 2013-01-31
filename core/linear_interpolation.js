var LinearInterpolation = Algorithm.extend({
  /**
   * Initialize required data.
   */
  init: function() {
    this.machineName = 'linear-interpolation';
    this.name = 'Linear interpolation';
    this.result = null;
    // parent init method
    this._super();
  },
  /**
   * Return field names.
   *
   * @param {String} formName
   * @param {Integer} rows Number of rows
   * @param {Integer} columns Number of columns
   *
   * @return {Array.<float>} Overridden by parents getFieldsList method
   */
  getFieldsList: function(formName, rows, columns) {
    if (formName == Algorithm.MATRIX_SIZE) {
      return this._super(Algorithm.MATRIX_SIZE, _.range(2), 1);
    }

    return this._super(this.machineName, _.range(columns), rows);
  },
  /**
   * Runs algorithm.
   *
   * @param formName
   * @param values Users values from the form
   */
  run: function(formName, values) {
    if (formName === Algorithm.MATRIX_SIZE) {
      this._super(formName, values);

      return;
    }

    this.result = values;
    
  },
  toConsole: function(result) {
    if (result) {
      console.log(result);
      return this;
    }

    console.log(this.result);

    return this;
  }
});

var gauss = new LinearInterpolation();
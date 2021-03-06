var Gauss = Algorithm.extend({
  /**
   * Initialize required data.
   */
  init: function() {
    this.machineName = 'gauss';
    this.name = 'Gaussian elimination';
    this.values = null;
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

    this.values = values;
	
	if (!this.isValidMatrix()) {
	  alert('No results');
	  return;
	}
	
    // Applying an algo to each row
    for (var i = 0; i < this.rowCount; i++) {
      i = this.performRow(i);
    }

    var result = this.getResult().reverse();
    // Prepare array to be called by alert function
    result.toString = function() {
      var str = '';
      _.each(this, function(v, k) {
        str += 'A' + k + ' = ' + v + '\n';
      });

      return str;
    };

    alert(result);
  },
  /**
   * Magical method.
   *
   * @param {Integer} iterator
   * @return {Integer} iterator
   *  Returns iterator / iterator - 1 / rowCount.
   *          Next row / Repeat row   / Break a cycle
   */
  performRow: function(iterator) {
    var i = 0;
    var tempRow = [];
    var multiplier = 0;
    var divider = 0;
    var currentRow = this.values[iterator];

    // Transform to "0"
    for (; i < iterator; i++) {
      if (currentRow[i] === 0) {
        continue;
      }

      tempRow = [];
      tempRow.push.apply(tempRow, this.values[i]);
      multiplier = currentRow[i];
      tempRow = _.map(tempRow, function(value) {
        return value * multiplier;
      });

      for (j = 0; j < this.columnCount; j++) {
        currentRow[j] -= tempRow[j];
      }
    }

    if (currentRow[iterator] === 1) {
      return iterator;
    }

    // Tries to swap row if the an 0 occur
    // 1  2  3
    // 0 |0| 4
    // 5 -1  3
    if (currentRow[iterator] === 0) {
      // Find suitable row to flip with
      var foundRow = _.find(this.values, function(arr) {
        return (arr[iterator] !== 0);
      });

      // If row isn't found
      if (foundRow == undefined) {
        alert('Error occur on A[' + iterator + '][' + iterator + ']');
        return this.rowCount;
      }

      // Swap with found
      var flip = [];
      flip.push.apply(tempRow, this.values[iterator]);
      var flap = this.values.splice(foundRow, 1, flip);
      this.values.splice(iterator, 0, flap);

      // Sets iterator to previous to perform current row again
      return iterator - 1;
    }

    // Transform to "1"
    divider = currentRow[iterator];
    this.values[iterator] = _.map(currentRow, function(value) {
      return value / divider;
    });

    return iterator;
  },
  isValidMatrix: function() {
	var firstDiagonal = 1;
	var secondDiagonal = 1;
	for (var i = 0; i < 3; i++) {
	  firstDiagonal *= this.values[i][i];
	}
	
	firstDiagonal += this.values[0][1] + this.values[1][2] + this.values[2][0];
	firstDiagonal += this.values[1][0] + this.values[2][1] + this.values[0][2];
	
	secondDiagonal *= this.values[0][2] * this.values[1][1] * this.values[2][0];
	secondDiagonal += this.values[0][1] + this.values[1][0] + this.values[2][2];
	secondDiagonal += this.values[1][2] + this.values[2][1] + this.values[0][0];
	
	return (firstDiagonal - secondDiagonal) !== 0;
  },
  /**
   * Сalculation of the results
   *
   * @return {Array.<float>}
   */
  getResult: function() {
    var result = [];
    result.push( _.last( this.values )[this.rowCount] );

    var i = this.values.length - 1;
    while (i--) {
      var val = this.values[i][this.rowCount];
      for (var j = i + 1; j < this.rowCount; j++) {
        val -= this.values[i][j] * result[this.rowCount - 1 - j];
      }
      result.push(val);
    }

    return this.fixFloat(result, 4);
  },
  toConsole: function(result) {
    if (result) {
      console.log(result);
      return this;
    }

    console.log(this.values);

    return this;
  }
});

var gauss = new Gauss();
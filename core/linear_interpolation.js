var LinearInterpolation = Algorithm.extend({
  /**
   * Initialize required data.
   */
  init: function() {
    this.machineName = 'linear-interpolation';
    this.name = 'Linear interpolation';
    this.values = null;
  	this.pointName = this.machineName + '-point';
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
    var interval = this.findInterval();
    if (interval === false) {
      alert('Point is out of range!');
      return;
    }

    if (!_.isArray(interval)) {
      this.viewResult(this.values[0][interval], this.values[1][interval]);
    }

    var k = this.values[1][ interval[1] ] - this.values[1][ interval[0] ];
    k /= this.values[0][ interval[1] ] - this.values[0][ interval[0] ];
    var l = this.values[1][ interval[1] ] - k * this.values[0][ interval[1] ];

    var f = this.fixFloat( (k * this.point + l), 2 )[0];
    this.viewResult(this.point, f, interval[1]);
    this.values = values;
  },
  /**
   * Find neighbors
   *
   * @return {Array.<Integer>|Boolean|Integer}
   */
  findInterval: function() {
    this.point = this.getFieldValue(this.pointName);
    var index = _.indexOf(this.values[0], this.point);

    if (index != -1) {
      return index;
    }

    // Find right edge
    var rightEdge = _.sortBy(this.values[0], function(num) {
      return num < this;
    }, this.point)[0];

    // Check if found edge is valid
    if (this.point > rightEdge || rightEdge === this.values[0][0]) {
      return false;
    }

    // Get edge index
    rightEdge = _.indexOf(this.values[0], rightEdge);
    var leftEdge = rightEdge - 1;

    return [leftEdge, rightEdge];
  },
  viewResult: function(x, f, position) {
    if (position) {
      this.values[0].splice(position, 0, x);
      this.values[1].splice(position, 0, f);
    }

    this.values.toString = function() {
      var result = '';
      result += this[0].join(' | ') + '\n';
      result += this[1].join(' | ');

      return result;
    };
	
	  alert(this.values);
  },
  fillForm: function(formName) {
    var form = this._super(formName);

    if (formName == this.machineName) {
      this.addPointToForm(form);
    }

    return form;
  },
  addPointToForm: function(form) {
    // create field
    elem = document.createElement('input');
    elem.setAttribute('type', 'text');
    elem.setAttribute('name', this.pointName);
    elem.setAttribute('id', this.pointName);
    elem.setAttribute('size', 4);

    form.insertBefore(elem, form.children[form.children.length - 1]);

    // create label
    var elem = document.createElement('label');
    elem.setAttribute('for', this.pointName);
    elem.innerHTML = 'Point';

    form.insertBefore(elem, form.children[form.children.length - 2]);

    elem = document.createElement('br');
    form.insertBefore(elem, form.children[form.children.length - 1]);
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

var interpolation = new LinearInterpolation();
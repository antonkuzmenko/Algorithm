var Lagrange = Algorithm.extend({
  /**
   * Initialize required data.
   */
  init: function() {
    this.machineName = 'lagrange';
    this.name = 'Lagrange';
    this.result = null;
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
  fillForm: function(formName) {
    var form = this._super(formName);
    if (formName === this.machineName) {
      this.addPointToForm(form);
    }

    return form;
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
    this.point = this.getFieldValue(this.pointName);
    var result = 0;

    var values = [];
    var currentValue = 1;
    var i = 0
    var j = 0;
    var n = this.result.length;

    for ( ; i < n; i++) {
      for (j = 0; j < n; j++) {
        if (i == j) continue;

        currentValue *= this.point - this.result[0][j];
        currentValue /= this.result[0][i] - this.result[0][j];
      }

      values.push(currentValue);
    }

    for (i = 0; i < n; i++) {
      result += this.result[1][i] * values[i];
    }

    this.viewResult( this.point, this.fixFloat(result, 4)[0] );
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
  viewResult: function(x, f) {
    this.result[0].push(x);
    this.result[0] = this.result[0].sort();
    var index = _.indexOf(this.result[0], x);
    this.result[1].splice(index, 0, f);

    this.result.toString = function() {
      var result = '';
      result += this[0].join(' | ') + '\n';
      result += this[1].join(' | ');

      return result;
    };

    alert(this.result);
  }
});

var lagrange = new Lagrange();
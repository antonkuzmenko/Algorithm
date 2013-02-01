var Numerical = Algorithm.extend({
  /**
   * Initialize required data.
   */
  init: function() {
    this.machineName = 'numerical-integration';
    this.name = 'Numerical integration';
    this.values = null;
    this.pure = 0;
    this.H = 0;
    this.interval = [];
    this.halfFXk = [];
    this.fXk = [];
    this.left = {name: 'левых прямоугольников'};
    this.middle = {name: 'средних прямоугольников'};
    this.right = {name: 'правых прямоугольников'};
    this.trapeze = {name: 'трапеций'};
    this.simpson = {name: 'Симпсона'};
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
      return this._super(Algorithm.MATRIX_SIZE, _.range(1), 1);
    }

    return this._super(this.machineName, _.range(columns), 1);
  },
  /**
   * Create a form for current algorithm.
   *
   * @return {Object} DOM Element
   */
  fillForm: function(formName) {
    var form = document.createElement('form');
    form.setAttribute('name', Algorithm.MATRIX_SIZE);
    form.setAttribute('id', Algorithm.MATRIX_SIZE);

    if (formName === Algorithm.MATRIX_SIZE) {
      var names = ['Arguments count'];
      for (var i = 0; i < this.rowCount; i++) {
        for (var j = 0; j < this.columnCount; j++) {
          var currentFieldName = this.fieldsList[i][j];
          this.createField(form, currentFieldName, 'input', 'text', names[j]);
        }
      }

      // Create button
      this.createField(form, 'matrix-submit', 'input', 'submit', 'Create form', false);
      document.body.appendChild(form);

      return form;
    }

    form = document.createElement('form');
    form.setAttribute('name', formName);
    form.setAttribute('id', formName);

    for (var i = 0; i < this.rowCount; i++) {
      for (var j = 0; j < this.columnCount; j++) {
        var currentFieldName = this.fieldsList[i][j];
        var label = '';
        if (j) {
          label = ' + X';
        }

        this.createField(form, currentFieldName, 'input', 'text', label);

        if (j > 1) {
          this.createSup(form, j);
        }
      }

      this.createSeparator(form);
    }

    // Create interval
    this.createField(form, this.machineName + '-A', 'input', 'text', 'A');
    this.createField(form, this.machineName + '-B', 'input', 'text', 'B');
    this.createSeparator(form);

    this.createField(form, this.machineName + '-N', 'input', 'text', 'N');
    this.createSeparator(form);

    this.createField(form, formName + '-submit', 'input', 'submit', 'Run', false);
    document.body.appendChild(form);

    return form;
  },
  createSup: function(form, value) {
    var elem = document.createElement('span');
    elem.innerHTML = '<sup><small>' + value + '</small></sup>';
    form.insertBefore(elem, form.children[form.children.length - 1]);
  },
  /**
   * Runs algorithm.
   *
   * @param formName
   * @param values Users values from the form
   */
  run: function(formName, values) {
    if (formName === Algorithm.MATRIX_SIZE) {
      this.fieldsList = this.getFieldsList(this.machineName, 1, values[0][0]);
      this.form.parentNode.removeChild(this.form);
      this.form = this.fillForm(this.machineName);
      this.formDefaultEvents();

      return;
    }

    var table = document.getElementsByTagName('table')[0];
    if (table) {
      table.parentNode.removeChild(table);
    }

    this.values = values[0];
    this.A = this.getFieldValue(this.machineName + '-A');
    this.B = this.getFieldValue(this.machineName + '-B');
    this.N = this.getFieldValue(this.machineName + '-N');
    this.H = this.fixFloat((this.B - this.A) / this.N, 4)[0];

    this.left.sum = 0;
    this.left.result = 0;
    this.middle.sum = 0;
    this.middle.result = 0;
    this.right.sum = 0;
    this.right.result = 0;
    this.trapeze.sum = 0;
    this.simpson.sum = 0;
    this.simpson.result = 0;

    this.integrate();

    var i = 0;
    var j = 0;

    var sum = this.A;
    this.interval = [];
    do {
      this.interval.push(sum);
      sum += this.H;
    } while(++i <= this.N);

    this.interval = this.fixFloat(this.interval, 4);

    this.halfFXk = [];
    for (i = 0; i < this.N; i++) {
      if (!this.interval[i + 1]) {
        this.halfFXk.push(undefined);
        break;
      }

      this.halfFXk.push( (this.interval[i] + this.interval[i + 1]) / 2 );
    }

    this.halfFXk = this.fixFloat(this.halfFXk, 4);

    var fXk = 0;
    this.fXk = [];
    for (i = 0; i < this.N; i++) {
      fXk = 0;
      for (j = 0; j < this.values.length; j++) {
        fXk += this.values[j] * Math.pow(this.interval[i], j);
      }
      this.fXk.push(fXk);
    }

    this.left.sum = _.chain(this.fXk)
       .initial()
       .reduce(function(memo, num) {
         return memo + num;
       }, 0)
       .value();

    this.left.result = this.left.sum * this.H;
    this.left.absError = Math.abs(this.pure - this.left.result);
    this.left.relativeError = this.left.absError / this.left.result * 100;

    this.right.sum = _.chain(this.fXk)
       .rest()
       .reduce(function(memo, num) {
         return memo + num;
       }, 0)
       .value();

    this.right.result = this.right.sum * this.H;
    this.right.absError = Math.abs(this.pure - this.right.result);
    this.right.relativeError = this.right.absError / this.right.result * 100;

    this.halfFXk = _.map(this.halfFXk, function(val) {
      return this.f(val);
    }, this);

    this.middle.sum = _.chain(this.halfFXk)
       .reduce(function(memo, num) {
         return memo + num;
       }, 0)
       .value();

    this.middle.result = this.middle.sum * this.H;
    this.middle.absError = Math.abs(this.pure - this.middle.result);
    this.middle.relativeError = this.middle.absError / this.middle.result * 100;

    this.trapeze.sum = _.chain(this.fXk)
       .initial()
       .rest()
       .reduce(function(memo, num) {
         return memo + num;
       }, 0)
       .value();

    this.trapeze.result = this.H * ( ((this.fXk[0] + this.fXk[this.fXk.length - 1]) / 2) + this.trapeze.sum );
    this.trapeze.absError = Math.abs(this.pure - this.trapeze.result);
    this.trapeze.relativeError = this.trapeze.absError / this.trapeze.result * 100;

    this.simpson.sum = this.left.sum + this.right.sum + 4 * this.middle.sum;
    this.simpson.result = this.simpson.sum * this.H / 6;
    this.simpson.absError = Math.abs(this.pure - this.simpson.result);
    this.simpson.relativeError = this.simpson.absError / this.simpson.result * 100;

    this.viewResult();
  },
  integrate: function() {
    this.pure = 0;
    _.each(this.values, function(v, k) {
      this.pure += v * Math.pow(this.B, k + 1) / (k + 1);
      this.pure -= v * Math.pow(this.A, k + 1) / (k + 1);
    }, this);

    this.pure = this.fixFloat(this.pure, 4)[0];

    return this.pure;
  },
  f: function(value) {
    var sum = 0;
    for (var i = 0; i < this.values.length; i++) {
      sum += this.values[i] * Math.pow(value, i);
    }

    return sum;
  },
  viewResult: function() {
    var table = document.createElement('table');
    table.setAttribute('id', 'table');

    var str = '<tr><th>Название</th><th>Результат</th>';
    str += '<th>Абсолютная погрешность</th><th>Относительная погрешность</th></tr>';

    var list = [
       'left', 'right', 'middle',
       'trapeze', 'simpson'
    ];

    var current = null;
    for (var i = 0; i < list.length; i++) {
      current = list[i];
      str += '<tr><td>Формулы ' + this[current].name + '</td>';
      str += '<td>' + this.fixFloat(this[current].result, 4) + '</td>';
      str += '<td>' + this.fixFloat(this[current].absError, 4) + '</td>';
      str += '<td>' + this.fixFloat(this[current].relativeError, 4) + '%</td></tr>';
    }

    table.innerHTML = str;
    document.body.appendChild(table);
  }

});

var numerical = new Numerical();
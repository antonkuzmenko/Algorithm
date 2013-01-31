/**
 * Base Algorithm.
 *
 * @type object Class
 */
var Algorithm = Class.extend({
  /**
   * Constructor method. Runs after object initialization
   */
  init: function() {
    Algorithm.MATRIX_SIZE = 'matrix-size';
    /**
     * Will be used in form creation
     *
     * @type {String}
     *
     * @see getFieldsList
     * @see fillForm
     */
    this.machineName = this.machineName || 'algorithm';

    /**
     * Page title
     *
     * @type {String}
     */
    this.name = 'Algorithm name';
    /**
     * List of values that user passed in
     *
     * @type {Array.<float>}
     */
    this.fieldsValues = [];
    /**
     * Count of matrix rows
     *
     * @type {Integer}
     */
    this.rowCount = null;
    /**
     * Count of matrix columns
     *
     * @type {Integer}
     */
    this.columnCount = null;
    /**
     * The list of the form fields names
     *
     * @type {Array.<string>}
     */
    this.fieldsList = this.getFieldsList(Algorithm.MATRIX_SIZE);
    /**
     * Form DOM element
     *
     * @type {Object}
     */
    this.form = this.fillForm(Algorithm.MATRIX_SIZE);

    this.formDefaultEvents();
  },
  /**
   * Return the list of the form fields names.
   * Alter field names. E.g x => algorithm-x
   *
   * @return {Array.<string>}
   */
  getFieldsList: function(formName, fields, rowCount) {
    var newFields = [];
    this.rowCount = rowCount;
    this.columnCount = fields.length;

    for (var i = 0; i < rowCount; i++) {
      var row = [];
      for (var j = 0; j < this.columnCount; j++) {
        row.push(formName + '-' + fields[j] + i);
      }
      newFields.push(row);
    }

    return newFields;
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
      var names = ['Row count', 'Column count'];
      for (var i = 0; i < this.rowCount; i++) {
        for (var j = 0; j < this.columnCount; j++) {
          var currentFieldName = this.fieldsList[i][j];
          this.createField(form, currentFieldName, 'input', 'text', names[j]);
          this.createSeparator(form);
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
        this.createField(form, currentFieldName, 'input', 'text', 'A[' + i + '][' + j + ']');
      }

      this.createSeparator(form);
    }

    this.createField(form, formName + '-submit', 'input', 'submit', 'Run', false);
    document.body.appendChild(form);
    
    return form;
  },
  /**
   * Get field value based on the field name passed in.
   *
   * @param  {String} fieldName
   *
   * @return {Number}
   */
  getFieldValue: function(fieldName) {
    if (!this.form[fieldName]) {
      return 'Invalid field name.';
    }

    var field = this.form[fieldName];
    if (field['type'] != 'text') {
      return 'Invalid field type. Type "text" expected';
    }

    var fieldValue = parseFloat( field.value.trim().replace(',', '') );

    return (!isNaN(fieldValue)) ? fieldValue : 0;
  },
  /**
   * Sets up default events to the current form.
   * E.g. run algorithm.
   */
  formDefaultEvents: function() {
    var self = this;

    this.form.onsubmit = function(e) {
      // fix for IE
      if(e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
      
      self.fieldsValues = [];

      // Fill matrix
      for (var i = 0; i < self.rowCount; i++) {
        var row = [];
        // Fill row
        for (var j = 0; j < self.columnCount; j++) {
          var fieldValue = self.getFieldValue(self.fieldsList[i][j]);
          row.push(fieldValue);
        }
        self.fieldsValues.push(row);
      }

      // Run algorithm
      self.run(this.name, self.fieldsValues);
    };
  },
  /**
   * Create form field.
   *
   * @param {Object} form DOM Element
   * @param {String} fieldName
   * @param {String} fieldTag
   * @param {String} fieldType
   * @param {String} labelText
   * @param {Boolean} isLabel Whether to create a label
   */
  createField: function(form, fieldName, fieldTag, fieldType, labelText, isLabel) {
    var elem = null;
    isLabel = (isLabel === false) ? isLabel : true;
    // Create label for a field
    if (isLabel) {
      elem = document.createElement('label');
      elem.setAttribute('for', fieldName);
      elem.innerHTML = labelText;
      form.appendChild(elem);
    }
    // Create a field
    elem = document.createElement(fieldTag);
    elem.setAttribute('name', fieldName);
    elem.setAttribute('id', fieldName);
    elem.setAttribute('type', fieldType);

    if (fieldType == 'text') {
      elem.setAttribute('size', 4);
      elem.className = 'form-field';
    } else if (fieldType == 'submit') {
      elem.className = 'form-button';
      elem.value = labelText;
    }

    form.appendChild(elem);
  },
  /**
   * Create and append <br> tag to the form.
   *
   * @param {Object} form DOM Element
   */
  createSeparator: function(form) {
    elem = document.createElement('br');
    form.appendChild(elem);
  },
  /**
   * Runs algorithm.
   *
   * @param formName
   * @param values Users values from the form
   */
  run: function(formName, values) {
    if (formName != Algorithm.MATRIX_SIZE) {
      return;
    }

    this.fieldsList = this.getFieldsList(this.machineName, values[0][0], values[0][1]);
    this.form.parentNode.removeChild(this.form);
    this.form = this.fillForm(this.machineName);

    this.formDefaultEvents();
  },
  /**
   * Prune float values to "count" after dot.
   *
   * @param {Array.<number>} value
   * @param {Integer} limit
   *
   * @return {Array.<float>}
   */
  fixFloat: function(value, limit) {
    if (!_.isArray(value)) {
      value = [value];
    }

    value = _.map(value, function(v) {
      if (v.toString().indexOf('.') != -1) {
        v = v.toFixed(limit);
      }

      return parseFloat(v);
    });

    return value;
  }
});
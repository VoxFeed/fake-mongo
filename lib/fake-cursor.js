'use strict';

class FakeCursor {
  constructor(data) {
    this.data = data;
    this.cursorIndex = -1;
  }

  _restartCursorIndex() {
    this.cursorIndex = -1;
  }

  _updateCursorIndex() {
    this.cursorIndex++;
  }

  getCursorIndex() {
    return this.cursorIndex;
  }

  _getDocumentOnCursorIndex() {
    var index = this.getCursorIndex();
    return this.data[index];
  }

  isLastIndex() {
    var index = this.getCursorIndex();
    return this.data.length === index;
  }

  count(callback) {
    callback(null, this.data.length);
  }

  toArray() {
    return this.data;
  }

  each(callback) {
    this._updateCursorIndex();
    var currentDocument = this._getDocumentOnCursorIndex();

    callback(null, currentDocument);

    if (this.isLastIndex()) {
      this._restartCursorIndex();
    } else {
      this.each(callback);
    }
  }
}

module.exports = FakeCursor;

'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.ref = ref;

var _mongoose = require('mongoose');

function ref(name, childPath) {
	return {
		type: _mongoose.Schema.ObjectId,
		ref: name,
		childPath: childPath
	};
}

;
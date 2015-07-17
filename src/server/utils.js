import {Schema} from 'mongoose';

export function ref(name, childPath) {
	return {
		type: Schema.ObjectId,
		ref: name,
		childPath
	};
};

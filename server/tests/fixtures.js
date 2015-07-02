import {ModelFactory} from '../Model';
import {mapValues} from 'lodash';

let schemas = {
  'Album': [{title: String, photos: [ref('Photo')]}],
  'Photo': [{url: String, album: ref('Album', 'photos')}]
}
export var models = ModelFactory(schemas);

export var config = {
  express: (app) => {},
}

export default {models}

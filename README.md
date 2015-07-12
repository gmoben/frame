# Phrame

**branch** | **status**
---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
master     | [![Build Status](https://travis-ci.org/gmoben/phrame.svg?branch=master)](https://travis-ci.org/gmoben/phrame) [![Coverage Status](https://coveralls.io/repos/gmoben/phrame/badge.svg?branch=dev&service=github)](https://coveralls.io/github/gmoben/phrame?branch=master)
dev        | [![Build Status](https://travis-ci.org/gmoben/phrame.svg?branch=dev)](https://travis-ci.org/gmoben/phrame) [![Coverage Status](https://coveralls.io/repos/gmoben/phrame/badge.svg?branch=dev&service=github)](https://coveralls.io/github/gmoben/phrame?branch=dev)

## Models
Write ES6 classes instead of redundant `mongoose` configurations.

```js
import {Model} from 'frame/server/core';

class User extends Model {
  constructor() {
    // Pass your schema and options directly to super.
    let schema = {...};
    super(schema, {virtuals: ['password']})
  }
  get password() { return this._password; }
  set password(password) {
    this._password = password;
    this.salt = crypto.randomBytes(16).toString('base64');
    this.hashedPassword = this.encryptPassword(password);
  }
}

export default new User();
```

Or instantiate a `Model` directly.

```js
import {ref} from 'frame/server/utils'

var Album = new Model({
  name: 'Album',
  schema: {title: String, photos: [ref('Photo')]}
});

var Photo = new Model({
  name: 'Photo',
  schema: {url: String, album: ref('Album', 'photos')}
});

let album = Album.create({title: 'Kittens'});
['gizmo.jpg', 'luna.png'].forEach(url => Photo.create({url, album}));
```

**Important**: Aside from the base configuration you provide, Frame handles all `mongoose` related details for you. If your application requires a `mongoose` reference, **DO NOT** install it as a dependency for your project as node will instantiate them separately. Instead, `import` it from `frame` directly.

```js
import mongoose from 'frame';
```

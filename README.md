# frame
Web apps without the work.

## Overview
### Models
Frame provides two types of models to use in your applications.

#### ServerModel

```
import ServerModel from 'frame/server';

class User extends ServerModel {
  constructor() {
    this.schema = {...}
    super({virtuals: ['password']})
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

Or pass options directly.

```
var Album = new ServerModel({
  name: 'Album',
  schema: {title: String, photos: [ref('Photo')]}
});

var Photo = new ServerModel({
  name: 'Photo',
  schema: {url: String, album: ref('Album', 'photos')}
});

var album = Album.create({title: 'Kittens'});
['gizmo.jpg', 'luna.png'].forEach(url => Photo.create({url, album}));
```

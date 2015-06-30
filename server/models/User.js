import Model from '../Model';
import ref from '../utils';
import crypto from 'crypto';
import {merge} from 'lodash';

class User extends Model {
  constructor() {
    let schema = {
      name: String,
      email: {type: String, lowercase: true},
      role: {
        type: String,
        default: 'user'
      },
      hashedPassword: String,
      provider: String,
      salt: String
    };
    super(merge({schema, virtuals: ['password', 'profile', 'token']}, args));
  }

  /**
   * Unencrypted password.
   * Password is encrypted internally and decrypted on access.
   *
   * @return {String}
   */
  get password() { return this._password; }
  set password(password) {
    this._password = password;
    this.salt = crypto.randomBytes(16).toString('base64');
    this.hashedPassword = this.encryptPassword(password);
  }

  /**
   * Profile information.
   * @return {object} {role, name}
   */
  get profile() { return {name: this.name, role: this.role}; }

  /**
   * Auth token.
   * @return {object} {_id, role}
   */
  get token() { return {_id: this._id, role: this.role}; }

  /**
   * Hash provided string and compare with hashed password.
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  }

  /**
   * Encrypt plaintext password.
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword(password) {
    if (!password || !this.salt) { return ''; }
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
}

export default new User();

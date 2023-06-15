const { assert } = require('chai');

const { getUserByEmail } = require('../helper.js');

const testUsers = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';

    assert.isObject(user, 'Returned value should be an object');
    assert.propertyVal(user, 'id', expectedUserID, 'User ID should match the expected value');
    assert.propertyVal(user, 'email', 'user@example.com', 'User email should match the provided email');
    assert.property(user, 'password', 'User should have a password property');
  });

  it('should return undefined for non-existent email', function () {
    const user = getUserByEmail('nonexistent@example.com', testUsers);
    assert.isUndefined(user, 'Returned value should be undefined');
  });
});

const JSONAPISerializer = require('jsonapi-serializer').Serializer
module.exports = new JSONAPISerializer('user', {
  attributes: [
    'token',
    'email',
    'fullName',
    'phoneNumber',
    'profileImage',
    'countryCode',
    'isoCode',
    'dob',
    'gender'
  ],
  pluralizeType: false,
  id: '_id',
  keyForAttribute: 'camelCase'
})

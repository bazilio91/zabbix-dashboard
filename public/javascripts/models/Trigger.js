/*global define*/

define(['backbone'], function (Backbone) {
  'use strict';

  /**
   * @class Trigger
   */
  var Trigger = Backbone.Model.extend({
    idAttribute: 'triggerid',

    getMessage: function () {
      console.log(this.attributes);
      return this.get('description');
    }
  });
  return Trigger;
});
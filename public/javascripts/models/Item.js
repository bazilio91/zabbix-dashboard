/*global define*/

define(['underscore', 'backbone'], function (_, Backbone) {
  'use strict';

  /**
   * @class Item
   */
  var Item = Backbone.Model.extend({
    idAttribute: 'itemid'
  });

  return Item;
});
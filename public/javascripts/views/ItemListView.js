/*global define*/

define([
  'marionette',
  './ItemItemView'
], function (Marionette, ItemItemView) {
  'use strict';
  /**
   * @class ItemListView
   */
  var ItemListView = Marionette.CollectionView.extend({
    childView: ItemItemView,
    className: 'b-item-item-list'
  });

  return ItemListView;
});
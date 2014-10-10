/*global define*/

define(['marionette', 'underscore', 'peity'], function (Marionette, _) {
  'use strict';

  function djb2(str) {
    var hash = 4823;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      /* hash * 33 + c */
    }
    return hash;
  }

  function hashStringToColor(str) {
    var hash = djb2(str);
    var r = (hash & 0xFF0000) >> 16;
    var g = (hash & 0x00FF00) >> 8;
    var b = hash & 0x0000FF;
    return [r, g, b];
  }

  function getHistory(data) {
    if (data.key_.indexOf('vfs.fs.size') === 0) {
      return Math.round(100 - data.historyItems.slice(-1)[0].value) + '/100'
    } else {
      return _.pluck(data.historyItems, 'value').join();
    }
  }

  /**
   * @class ItemItemView
   */
  var ItemItemView = Marionette.ItemView.extend({
    modelEvents: {
      'change:historyItems': 'onHistoryChange'
    },

    className: 'b-item-item',

    template: function (data) {
      return _.template('<span>' + getHistory(data) + '</span>');
    },

    onRender: function () {
      var graphOptions = {
        width: 50,
        height: 40
      };

      var chartType = 'line',
        rgb = hashStringToColor(this.model.get('key_'));

      if (this.model.attributes.key_.indexOf('vfs.fs.size') === 0) {
        chartType = 'pie';
        graphOptions.width = 40;
      }

      if (this.model.attributes.key_.indexOf('system.cpu.load[,avg') === 0) {
        graphOptions.max = 10;
      }

      if (chartType === 'line') {
        graphOptions.stroke = 'rgb(' + rgb + ')';
        graphOptions.fill = 'rgba(' + rgb + ', .2)';
      } else if (chartType === 'pie') {
        graphOptions.fill = [
            'rgb(' + rgb + ')',
            'rgba(' + rgb + ', .2)'
        ]
      }

      this.$el.attr('title', this.model.get('key_') + ' ' + this.model.get('historyItems')[this.model.get('historyItems').length - 1].value);
      if (this.model.get('data_type') === '0') {
        this.$el.find('span').peity(chartType, graphOptions);
      }
    },

    onHistoryChange: function () {
      this.model.attributes.historyItems = this.model.attributes.historyItems.slice(-30);
      this.$el.find('span').text(getHistory(this.model.attributes)).change();
    }
  });
  return ItemItemView;
});
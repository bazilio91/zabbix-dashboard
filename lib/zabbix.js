var Zabbix = require('zabbix'),
  _ = require('lodash'),
  async = require('async');


var ZabbixProxy = function (config, io) {
  "use strict";
  var zabbix = new Zabbix(config.url, config.user, config.password),
    tick, pollers = {}, data = {};

  function emitResult(name) {
    io.emit('data', {type: name, data: data[name]});
    console.log('emit');
  }

  io.on('connection', function (socket) {
    console.log('cn');
    _.each(data, function (result, name) {
      socket.emit('data', {type: name, data: result});
    });

    socket.on('items', function (params, fn) {
      if (!params.hostid) {
        fn(false);
        return;
      }

      getHostItems(params.hostid, fn)
    });

    socket.on('host', function (params, fn) {
      if (!params.hostids) {
        fn(false);
        return;
      }

      getHosts(params.hostids, fn);
    });

    socket.on('history', function (params, fn) {
      if (!params.itemid) {
        fn(false);
        return;
      }

      getHistory(fn, [params.itemid]);
    });

    socket.on('map', function (params, fn) {
      zabbix.call('map.get', {
        "output": [],
        "selectLinks": "extend",
        "selectSelements": "extend"
      }, function (err, resp, body) {
        if (err) {
          console.error('Error getting hosts');
          throw err;
        }

        fn(body.result);
      });
    });
  });

  function getHostItems(hostid, fn) {
    zabbix.call('item.get', {
      output: 'extend',
      monitored: true,
      hostids: [hostid]
    }, function (err, resp, body) {
      if (err) {
        console.error('Error getting host items');
        throw err;
      }

      fn(body.result);
    });
  }


  function getHosts(ids, cb) {
    var options = {
      output: ['id', 'name', 'status'],
      sortfield: "name",
      selectInterfaces: ['ip'],
      selectItems: 'shorten',
      selectGroups: 'extend',
      selectParentTemplates: 'extend',
      filter: {
        available: 1
      }
    };

    if (ids) {
      options.hostids = ids;
    }

    zabbix.call("host.get", options, function (err, resp, body) {
      if (err) {
        console.error('Error getting hosts');
        throw err;
      }

      if(!cb) {
        data['hosts'] = body.result;
      }
      async.series(
        [getTriggers, getItems],
        function () {
          if (cb) {
            cb(body.result)
          } else {
            emitResult('hosts');
          }
        });
    });
  }


  pollers['hosts'] = getHosts;

  function getTriggers(callback) {
    zabbix.call('trigger.get', {
      active: true,
      hostids: _.pluck(data['hosts'], 'hostid'),
      selectItems: ['itemid'],
      output: ['description', 'triggerid', 'hostid', 'priority'],
      'only_true': true,
      expandData: 'hostid'
    }, function (err, resp, body) {
      if (err) {
        console.error('Error getting triggers');
        throw err;
      }

      data.triggers = body.result;
      _.each(body.result, function (trigger) {
        var host = _.find(data['hosts'], {hostid: trigger.hostid});
        if (!host.triggers) {
          host.triggers = [];
        }

        host.triggers.push(trigger);
      });

      callback();
    });
  }

  function getItems(callback) {
    zabbix.call('item.get', {
      output: 'extend',
      monitored: true,
      filter: {
        'itemid': _.pluck(_.flatten([].concat(_.pluck(data.triggers, 'items'))), 'itemid'),
        'key_': ['system.cpu.load[,avg1]', 'vfs.fs.size[/,pfree]']
      },
      searchByAny: true
    }, function (err, resp, body) {
      if (err) {
        console.error('Error getting items');
        throw err;
      }


      data.items = body.result;

      getHistory(function (history) {
        _.each(history, function (row) {
          var item = _.find(data.items, {itemid: row.itemid});

          if (!item.historyItems) {
            item.historyItems = [];
          }

          item.historyItems.push(row);

          var host = _.find(data.hosts, {hostid: item.hostid});


          if (!host.items) {
            host.items = [];
          }

          if (host.items.indexOf(item) === -1) {
            host.items.push(item);
          }
        });
        callback();
      }, _.pluck(data.items, 'itemid'));
    });
  }

  function getHistory(callback, itemids) {
    var date = new Date();
    date.setMinutes(date.getMinutes() - 16);
    var time = Math.round(date.getTime() / 1000);

    zabbix.call('history.get', {
      output: 'extend',
      history: 0,
      'sortfield': 'clock',
      'sortorder': 'ASC',
      time_from: time,
      time_till: Date.now(),
      itemids: itemids,
      limit: 100
    }, function (err, resp, body) {
      if (err) {
        console.error('Error getting history');
        throw err;
      }

      console.log('history');

      callback(body.result);
    });
  }

  function getGroups() {
    zabbix.call("hostgroup.get",
      {
        output: 'extend'
      }, function (err, resp, body) {
        if (err) {
          console.error('Error getting groups');
          throw err;
        }

        data['groups'] = body.result;


        emitResult('groups');
      });
  }


  pollers['groups'] = getGroups;

  return {
    start: function () {
      var self = this;
      zabbix.getApiVersion(function (err, resp, body) {
        if (!err) {
          console.log("Unauthenticated API version request, and the version is: " + body.result)
        }
      });

      zabbix.authenticate(function (err, resp, body) {
        if (!err) {
          console.log('Authenticated');

          tick = setInterval(_.bind(self.poll, self), 10000);
          self.poll();
        }
      });

      zabbix.getApiVersion(function (err, resp, body) {
        console.log("Zabbix API version is: " + body.result);
      });

    },
    poll: function () {
      _.each(pollers, function (poll) {
        poll();
      })
    },
    getData: function () {
      return data;
    }
  }
};

module.exports = ZabbixProxy;


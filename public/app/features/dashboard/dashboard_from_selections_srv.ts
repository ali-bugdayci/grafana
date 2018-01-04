///<reference path="../../headers/common.d.ts" />

import _ from 'lodash';
import coreModule from 'app/core/core_module';
import appEvents from 'app/core/app_events';

export class DashboardFromSelectionsSrv {
  hash: {};

  constructor() {
    appEvents.on('add-selection', options => this.addSelection(options.field, options.value));
  }

  init() {
    this.hash = {};
  }

  addSelection(key, newSelection) {

    if (!this.hash[key]) {
      this.hash[key] = [];
    }

    var list = this.hash[key];

    if (!_.includes(list,newSelection)) {
      list.push(newSelection);
    }

    appEvents.emit('show-modal', {
      src: 'public/app/features/dashboard/partials/selectionsModal.html',
      model: { selections: this.hash}
    });

    return(newSelection);
  }

  clear(selection) {
    delete this.hash[selection];
  }

  clearAll() {
    this.hash = {};
  }

}

coreModule.service('dashboardFromSelectionsSrv', DashboardFromSelectionsSrv);

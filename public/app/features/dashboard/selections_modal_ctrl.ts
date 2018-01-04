import _ from 'lodash';
import coreModule from 'app/core/core_module';


export class SelectionsModalCtrl {
  results: any;
  selected_dashboard: string;

  /** @ngInject */
  constructor(private $scope, private $location, private $window, backendSrv) {
    var ctrl = this;

    backendSrv.search({}).then((results) => {
      ctrl.results = _.map(results, function(dash) {
        dash.url = 'dashboard/' + dash.uri;
        return dash;
      });
    });
  }

  removeSelectionAt (list, index, selections, field) {
    list.splice(index,1);

    if (!list.length) {
      delete selections[field];
    }
  }

  hasAnySelections () {
    var selections = this.$scope.model.selections;
    return Object.keys(selections).length !== 0;
  }

  openDashboard () {
    var queries = [];

    var location = this.$location.search();
    if (location.orgId) {
      queries.push("orgId=" + location.orgId);
    }


    _.transform(this.$scope.model.selections,
        (result, values, key) => {
          var keytransformed = key;

          if (key.startsWith("@")) {
            keytransformed = key.substr(1);
          }

          keytransformed = "var-" + keytransformed;

          _.forEach(values,(value) => result.push(keytransformed + "=" + value) );

        }, queries);

    var search = _.join(queries, "&");
    var url = "dashboard/" + this.selected_dashboard + "?"+ search;
    this.$window.open(url, '_blank');
  }

}

coreModule.controller('SelectionsModalCtrl', SelectionsModalCtrl);


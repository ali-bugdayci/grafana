///<reference path="../../../headers/common.d.ts" />

import './graph';
import './legend';
import './series_overrides_ctrl';
import './thresholds_form';

import template from './template';
import _ from 'lodash';
import config from 'app/core/config';
import {MetricsPanelCtrl, alertTab} from 'app/plugins/sdk';
import {DataProcessor} from './data_processor';
import {axesEditorComponent} from './axes_editor';

class GraphCtrl extends MetricsPanelCtrl {
  static template = template;

  hiddenSeries: any = {};
  seriesList: any = [];
  dataList: any = [];
  annotations: any = [];
  alertState: any;

  annotationsPromise: any;
  dataWarning: any;
  colors: any = [];
  subTabIndex: number;
  processor: DataProcessor;

  sortingOrder: any = [];
  couplingMetrics: any = [];

  panelDefaults = {
    // datasource name, null = default datasource
    datasource: null,
    // sets client side (flot) or native graphite png renderer (png)
    renderer: 'flot',
    yaxes: [
      {
        label: null,
        show: true,
        logBase: 1,
        min: null,
        max: null,
        format: 'short'
      },
      {
        label: null,
        show: true,
        logBase: 1,
        min: null,
        max: null,
        format: 'short'
      }
    ],
    xaxis: {
      show: true,
      mode: 'time',
      name: null,
      values: [],
      buckets: null
    },
    // show/hide lines
    lines         : true,
    // fill factor
    fill          : 1,
    // line width in pixels
    linewidth     : 1,
    // show/hide dashed line
    dashes        : false,
    // length of a dash
    dashLength    : 10,
    // length of space between two dashes
    spaceLength   : 10,
    // show hide points
    points        : false,
    // point radius in pixels
    pointradius   : 5,
    // show hide bars
    bars          : false,
    // enable/disable stacking
    stack         : false,
    // stack percentage mode
    percentage    : false,
    /**
     * @detangleEdit start
     * @author Ural
     */
    // Detangle Options
    detangle: {
      coupling      : false,
      sortingOrder  : 'desc',
      limit         : null,
      metric        : 'coupling'
    },
    /**
     * @detangleEdit end
     * @author Ural
     */
    // legend options
    legend: {
      show: true, // disable/enable legend
      values: false, // disable/enable legend values
      min: false,
      max: false,
      current: false,
      total: false,
      avg: false
    },
    // how null points should be handled
    nullPointMode : 'null',
    // staircase line mode
    steppedLine: false,
    // tooltip options
    tooltip       : {
      value_type: 'individual',
      shared: true,
      sort: 0,
    },
    // time overrides
    timeFrom: null,
    timeShift: null,
    // metric queries
    targets: [{}],
    // series color overrides
    aliasColors: {},
    // other style overrides
    seriesOverrides: [],
    thresholds: [],
  };

  /** @ngInject */
  constructor($scope, $injector, private annotationsSrv) {
    super($scope, $injector);

    _.defaults(this.panel, this.panelDefaults);
    _.defaults(this.panel.tooltip, this.panelDefaults.tooltip);
    _.defaults(this.panel.legend, this.panelDefaults.legend);
    _.defaults(this.panel.xaxis, this.panelDefaults.xaxis);

    this.processor = new DataProcessor(this.panel);

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataSnapshotLoad.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('init-panel-actions', this.onInitPanelActions.bind(this));

    /**
     * @detangleEdit start
     * @author Ural
     */
    this.sortingOrder = [
      {text: 'Ascending', value: 'asc'},
      {text: 'Descending', value: 'desc'},
    ];

    this.couplingMetrics = [
      {text: 'Coupling Value', value: 'coupling'},
      {text: 'Num. of Couples', value: 'couplecounts'},
    ];
    /**
     * @detangleEdit end
     * @author Ural
     */
  }

  onInitEditMode() {
    this.addEditorTab('Axes', axesEditorComponent, 2);
    this.addEditorTab('Legend', 'public/app/plugins/panel/graph/tab_legend.html', 3);
    this.addEditorTab('Display', 'public/app/plugins/panel/graph/tab_display.html', 4);
    this.addEditorTab('Detangle', 'public/app/plugins/panel/graph/detangle.html', 5);


    if (config.alertingEnabled) {
      this.addEditorTab('Alert', alertTab, 6);
    }

    this.subTabIndex = 0;
  }

  onInitPanelActions(actions) {
    actions.push({text: 'Export CSV', click: 'ctrl.exportCsv()'});
    actions.push({text: 'Toggle legend', click: 'ctrl.toggleLegend()'});
  }

  issueQueries(datasource) {
    this.annotationsPromise = this.annotationsSrv.getAnnotations({
      dashboard: this.dashboard,
      panel: this.panel,
      range: this.range,
    });
    return super.issueQueries(datasource);
  }

  zoomOut(evt) {
    this.publishAppEvent('zoom-out', 2);
  }

  onDataSnapshotLoad(snapshotData) {
    this.annotationsPromise = this.annotationsSrv.getAnnotations({
      dashboard: this.dashboard,
      panel: this.panel,
      range: this.range,
    });
    this.onDataReceived(snapshotData);
  }

  onDataError(err) {
    this.seriesList = [];
    this.annotations = [];
    this.render([]);
  }

  onDataReceived(dataList) {
    /**
     * @detangleEdit start
     * @author Ural
     */
    // if (this.panel.coupling) {
    //   let fileArray = _.uniq(_.map(dataList, (x) => { return x.props['@nodePath.keyword'];}));
    //   let issueArray = _.uniq(_.map(dataList, (x) => { return x.props['@issue_id'];}));
    //
    //   let fileObjectArray = [];
    //   _.each(fileArray, (file) => {
    //     let tempFileObject = {
    //       file: file,
    //       issues: []
    //     };
    //     tempFileObject.issues = _.map(_.filter(dataList, (y) => { return y.props['@nodePath.keyword'] === file;}),
    //       (x) => {
    //         return { issueId: x.props['@issue_id'], value: x.datapoints[0][0], couplings: [] };
    //       });
    //     _.each(tempFileObject.issues, (issueSource) => {
    //       _.each(tempFileObject.issues, (issueTarget) => {
    //         if (issueSource.issueId !== issueTarget.issueId) {
    //           let tempCoupling = {
    //             issueId: issueTarget.issueId,
    //             sourceSquare: Math.sqrt(issueSource.value),
    //             targetSquare: Math.sqrt(issueTarget.value),
    //             sourceTargetProduct: issueTarget.value * issueSource.value,
    //             couplingValue: (issueTarget.value * issueSource.value) / (Math.sqrt(issueTarget.value) * Math.sqrt(issueSource.value))
    //           };
    //           issueSource.couplings.push(tempCoupling);
    //         }
    //       });
    //     });
    //     fileObjectArray.push(tempFileObject);
    //
    //   });
    //   let issueObjectArray = [];
    //   _.each(issueArray, (issue) => {
    //     let tempIssueObject = {
    //       issueId: issue,
    //       couplingValue: 0,
    //       couplings: []
    //     };
    //     let sourceSquare = 0;
    //     let targetSquare = 0;
    //     let sourceTargetProduct = 0;
    //     _.each(_.filter(fileObjectArray, {issues: [{issueId: issue}]}), (fileWithIssue) => {
    //       let issueWithValues = _.find(fileWithIssue.issues, {issueId: issue});
    //       _.each(issueWithValues.couplings, (issuesCouples) => {
    //         let tempIssueSourceTargetCoupling = _.find(tempIssueObject.couplings, {issueId: issuesCouples.issueId});
    //         if (_.isUndefined(tempIssueSourceTargetCoupling)) {
    //           tempIssueSourceTargetCoupling = {
    //             issueId: issuesCouples.issueId,
    //             sourceSquare: 0,
    //             targetSquare: 0,
    //             sourceTargetProduct: 0,
    //           };
    //           tempIssueObject.couplings.push(tempIssueSourceTargetCoupling);
    //         }
    //         tempIssueSourceTargetCoupling.sourceSquare += issuesCouples.sourceSquare;
    //         tempIssueSourceTargetCoupling.targetSquare += issuesCouples.targetSquare;
    //         tempIssueSourceTargetCoupling.sourceTargetProduct += issuesCouples.sourceTargetProduct;
    //         sourceSquare += issuesCouples.sourceSquare;
    //         targetSquare += issuesCouples.targetSquare;
    //         sourceTargetProduct += issuesCouples.sourceTargetProduct;
    //       });
    //     });
    //     _.map(tempIssueObject.couplings, (coupling) => {
    //       coupling.couplingValue = coupling.sourceTargetProduct / ((coupling.sourceSquare * coupling.targetSquare) + 1);
    //     });
    //     tempIssueObject.couplingValue = sourceTargetProduct / ((sourceSquare * targetSquare) + 1);
    //     issueObjectArray.push(tempIssueObject);
    //   });
    // }

    if (this.panel.detangle.coupling) {
      console.log(dataList[0]);
      let rows = dataList[0].rows;
      let issueIdIndex = _.findIndex(dataList[0].columns, {text: '@issue_id'});
      let filePathIndex = _.findIndex(dataList[0].columns, {text: '@nodePath.keyword'});
      let timestampIndex = _.findIndex(dataList[0].columns, {text: '@timestamp'});
      let valueIndex = dataList[0].columns.length - 1;

      let issueArray = _.uniq(_.map(rows, (x) => { return x[issueIdIndex];}));
      let issueObjectArray = [];
      _.each(issueArray, (item) => {
        let tempIssueObject = {
          issueId: item,
          couplingValue: 0,
          timestamps: [],
          couplings: []
        };
        issueObjectArray.push(tempIssueObject);
      });
      _.each(rows, (issue) => {
        let tempIssueObject = _.find(issueObjectArray, {issueId: issue[issueIdIndex]});
        tempIssueObject.timestamps.push(new Date(issue[timestampIndex]).getTime());
        // let coupledIssues  = _.map (_.filter(rows, (row) => { return _.includes(_.uniq(_.map(_.filter(rows, (x) => {
        //   return x[issueIdIndex] === issue[issueIdIndex] ;}), filePathIndex)),
        //     row[filePathIndex]) && row[issueIdIndex] !== issue[issueIdIndex]; }),
        //   issueIdIndex);
        _.each(_.filter(rows, (x) => { return x[issueIdIndex] !== issue[issueIdIndex] &&
          x[filePathIndex] === issue[filePathIndex]; }), (issueRow) => {
          let tempCoupledIssue = {
            issueId: issueRow[issueIdIndex],
            couplingValue: 0,
            sourceSquare: 0,
            targetSquare: 0,
            sourceTargetProduct: 0
          };
          tempCoupledIssue.sourceSquare += Math.sqrt(issue[valueIndex]);
          tempCoupledIssue.targetSquare += Math.sqrt(issueRow[valueIndex]);
          tempCoupledIssue.sourceTargetProduct += issue[valueIndex] * issueRow[valueIndex];
          tempCoupledIssue.couplingValue = tempCoupledIssue.sourceTargetProduct /
            ((tempCoupledIssue.sourceSquare * tempCoupledIssue.targetSquare) + 1);
          tempIssueObject.couplings.push(tempCoupledIssue);
        });
        // tempIssueObject.couplingValue = _.sumBy(tempIssueObject.couplings, 'sourceTargetProduct') /
        //   ((_.sumBy(tempIssueObject.couplings, 'sourceSquare') * _.sumBy(tempIssueObject.couplings, 'targetSquare')) + 1);
        //issueObjectArray.push(tempIssueObject);
      });
      issueObjectArray = _.map(issueObjectArray, (issueObject) => {
        return _.extend({}, issueObject, {
          couplingValue: _.sumBy(issueObject.couplings, 'sourceTargetProduct') /
             ((_.sumBy(issueObject.couplings, 'sourceSquare') * _.sumBy(issueObject.couplings, 'targetSquare')) + 1),
          numOfIssues: issueObject.couplings.length
        });
      });
      let metric = '';
      switch (this.panel.detangle.metric) {
        case 'couplecounts': {
          metric = 'numOfIssues';
          break;
        }
        case 'coupling':
        default: {
          metric = 'couplingValue';
          break;
        }
      }
      dataList = _.map(_.take(_.orderBy(_.filter(issueObjectArray, (o) => { return o.couplingValue >0; }),
        metric, this.panel.detangle.sortingOrder),
        (this.panel.detangle.limit === null ? issueObjectArray.length : this.panel.detangle.limit)), (issueObject) => {
        return  {
          metric: "sum",
          props: { "@issue_id": issueObject.issueId},
          target: issueObject.issueId,
          field: "$metric",
          datapoints: [ { 0: issueObject[metric], 1: issueObject.timestamps[0]}]
        };
      });
    }
    /**
     * @detangleEdit end
     * @author Ural
     */
    this.dataList = dataList;
    this.seriesList = this.processor.getSeriesList({dataList: dataList, range: this.range});

    this.dataWarning = null;
    const datapointsCount = this.seriesList.reduce((prev, series) => {
      return prev + series.datapoints.length;
    }, 0);

    if (datapointsCount === 0) {
      this.dataWarning = {
        title: 'No data points',
        tip: 'No datapoints returned from data query'
      };
    } else {

      for (let series of this.seriesList) {
        if (series.isOutsideRange) {
          this.dataWarning = {
            title: 'Data points outside time range',
            tip: 'Can be caused by timezone mismatch or missing time filter in query',
          };
          break;
        }
      }
    }

    this.annotationsPromise.then(result => {
      this.loading = false;
      this.alertState = result.alertState;
      this.annotations = result.annotations;
      this.render(this.seriesList);
    }, () => {
      this.loading = false;
      this.render(this.seriesList);
    });
  }
  onRender() {
    if (!this.seriesList) { return; }

    for (let series of this.seriesList) {
      series.applySeriesOverrides(this.panel.seriesOverrides);

      if (series.unit) {
        this.panel.yaxes[series.yaxis-1].format = series.unit;
      }
    }
  }

  changeSeriesColor(series, color) {
    series.color = color;
    this.panel.aliasColors[series.alias] = series.color;
    this.render();
  }

  toggleSeries(serie, event) {
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      if (this.hiddenSeries[serie.alias]) {
        delete this.hiddenSeries[serie.alias];
      } else {
        this.hiddenSeries[serie.alias] = true;
      }
    } else {
      this.toggleSeriesExclusiveMode(serie);
    }
    this.render();
  }

  toggleSeriesExclusiveMode (serie) {
    var hidden = this.hiddenSeries;

    if (hidden[serie.alias]) {
      delete hidden[serie.alias];
    }

    // check if every other series is hidden
    var alreadyExclusive = _.every(this.seriesList, value => {
      if (value.alias === serie.alias) {
        return true;
      }

      return hidden[value.alias];
    });

    if (alreadyExclusive) {
      // remove all hidden series
      _.each(this.seriesList, value => {
        delete this.hiddenSeries[value.alias];
      });
    } else {
      // hide all but this serie
      _.each(this.seriesList, value => {
        if (value.alias === serie.alias) {
          return;
        }

        this.hiddenSeries[value.alias] = true;
      });
    }
  }

  toggleAxis(info) {
    var override = _.find(this.panel.seriesOverrides, {alias: info.alias});
    if (!override) {
      override = { alias: info.alias };
      this.panel.seriesOverrides.push(override);
    }
    info.yaxis = override.yaxis = info.yaxis === 2 ? 1 : 2;
    this.render();
  }

  addSeriesOverride(override) {
    this.panel.seriesOverrides.push(override || {});
  }

  removeSeriesOverride(override) {
    this.panel.seriesOverrides = _.without(this.panel.seriesOverrides, override);
    this.render();
  }

  toggleLegend() {
    this.panel.legend.show = !this.panel.legend.show;
    this.refresh();
  }

  legendValuesOptionChanged() {
    var legend = this.panel.legend;
    legend.values = legend.min || legend.max || legend.avg || legend.current || legend.total;
    this.render();
  }

  exportCsv() {
    var scope = this.$scope.$new(true);
    scope.seriesList = this.seriesList;
    this.publishAppEvent('show-modal', {
      templateHtml: '<export-data-modal data="seriesList"></export-data-modal>',
      scope,
      modalClass: 'modal--narrow'
    });
  }
}

export {GraphCtrl, GraphCtrl as PanelCtrl};

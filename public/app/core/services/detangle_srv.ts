///<reference path="../../headers/common.d.ts" />

import _ from 'lodash';
import coreModule from 'app/core/core_module';

export class DetangleSrv {

  /** @ngInject */
  constructor() {
  }

  dataConvertor(dataList, config) {
    let rows = dataList[0].rows;
    let issueIdIndex = _.findIndex(dataList[0].columns, {text: '@issue_id'});
    let issueTypeIndex = _.findIndex(dataList[0].columns, {text: '@issue_type'});
    let filePathIndex = _.findIndex(dataList[0].columns, {text: '@nodePath.keyword'});
    let timestampIndex = _.findIndex(dataList[0].columns, {text: '@timestamp'});
    let valueIndex = dataList[0].columns.length - 1;
    let checkIssueSourceType = false;
    let issueTypeArray = [];
    if (issueTypeIndex > 0 && config.sourceTypeData !== 'All') {
      checkIssueSourceType = true;
      issueTypeArray = _.split(config.sourceTypeData, ' + ');
    }
    let checkIssueTargetType = false;
    let targetIssueTypeArray = [];
    if (issueTypeIndex > 0 && config.targetTypeData !== 'All') {
      checkIssueTargetType = true;
      targetIssueTypeArray = _.split(config.targetTypeData, ' + ');
    }
    let issueArray = _.uniq(_.map(_.filter(rows, (o) => {
      return (checkIssueSourceType ? _.includes(issueTypeArray, o[issueTypeIndex]): true);
    }), (x) => { return x[issueIdIndex];}));
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
      if (tempIssueObject === undefined) { return; }
      tempIssueObject.timestamps.push(new Date(issue[timestampIndex]).getTime());
      // let coupledIssues  = _.map (_.filter(rows, (row) => { return _.includes(_.uniq(_.map(_.filter(rows, (x) => {
      //   return x[issueIdIndex] === issue[issueIdIndex] ;}), filePathIndex)),
      //     row[filePathIndex]) && row[issueIdIndex] !== issue[issueIdIndex]; }),
      //   issueIdIndex);
      _.each(_.filter(rows, (x) => { return x[issueIdIndex] !== issue[issueIdIndex] &&
        x[filePathIndex] === issue[filePathIndex] && (checkIssueTargetType ?
          _.includes(targetIssueTypeArray, x[issueTypeIndex]): true); }), (issueRow) => {
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
    switch (config.metric) {
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

    dataList = _.map(_.take(_.orderBy(_.filter(issueObjectArray, (o) => {
      return o.couplingValue > 0;
    }),
      metric, config.sortingOrder),
      (config.limit === null ? issueObjectArray.length : config.limit)), (issueObject) => {
      return  {
        metric: "sum",
        props: { "@issue_id": issueObject.issueId},
        target: issueObject.issueId,
        field: "$metric",
        datapoints: [ { 0: issueObject[metric], 1: issueObject.timestamps[0]}]
      };
    });
    return dataList;
  }
}

coreModule.service('detangleSrv', DetangleSrv);

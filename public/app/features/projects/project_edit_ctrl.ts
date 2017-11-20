///<reference path="../../headers/common.d.ts" />

import angular from 'angular';
import _ from 'lodash';

import config from 'app/core/config';
import {coreModule, appEvents} from 'app/core/core';

const fieldHtmlClass = "gf-form-input max-width-20";
const labelHtmlClass = "gf-form-label width-20";
const formHtmlClass = "gf-form";
const formGroupHtmlClass = "gf-form-group";

export class ProjectEditCtrl {
  isNew: boolean;
  model: any;
  navModel: any;
  schema: any;
  forms: any[];
  sections: any[];
  detangleConfig: any;

  /** @ngInject */
  constructor(private $scope,
              private navModelSrv,
              private WizardHandler) {

    this.navModel = navModelSrv.getDatasourceNav(0);
    this.isNew = true;
    this.initNewDatasourceModel();
    this.detangleConfig = {
      "sections": [
        {
          "name": "Project",
          "isOptional": false,
          "options": [
            {
              "name": "Name",
              "valueType": "str",
              "isOptional": false,
              "isMultiple": false,
              "isExtended": false,
              "description": "Name of the project"
            }
          ]
        },
        {
          "name": "Repository",
          "isOptional": false,
          "options": [
            {
              "name": "Type",
              "valueType": "SectionRef",
              "isOptional": false,
              "enumeration": [
                "git",
                "svn"
              ],
              "isMultiple": false,
              "isExtended": false,
              "description": "Type of VCS"
            },
            {
              "name": "URL",
              "valueType": "str",
              "isOptional": false,
              "isMultiple": false,
              "isExtended": false,
              "pattern": "http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+"
            }
          ]
        },
        {
          "name": "RepositoryFilter",
          "isOptional": false,
          "options": [
            {
              "name": "SubPath",
              "valueType": "str",
              "isOptional": true,
              "isMultiple": false,
              "isExtended": false
            },
            {
              "name": "FilenameIncludeRegex",
              "valueType": "str",
              "isOptional": true,
              "isMultiple": false,
              "isExtended": false,
              "mutuallyExclusiveGroup": "FilenameInclude"
            },
            {
              "name": "FilenameExcludeRegex",
              "valueType": "str",
              "isOptional": true,
              "isMultiple": false,
              "isExtended": false,
              "mutuallyExclusiveGroup": "FilenameExclude"
            },
            {
              "name": "FilenameIncludeGlob",
              "valueType": "str",
              "isOptional": true,
              "isMultiple": false,
              "isExtended": false,
              "mutuallyExclusiveGroup": "FilenameInclude"
            },
            {
              "name": "FilenameExcludeGlob",
              "valueType": "str",
              "isOptional": true,
              "isMultiple": false,
              "isExtended": false,
              "mutuallyExclusiveGroup": "FilenameExclude"
            },
            {
              "name": "DirectoryIncludeRegex",
              "valueType": "str",
              "isOptional": true,
              "isMultiple": false,
              "isExtended": false,
              "mutuallyExclusiveGroup": "DirectoryInclude"
            },
            {
              "name": "DirectoryExcludeRegex",
              "valueType": "str",
              "isOptional": true,
              "isMultiple": false,
              "isExtended": false,
              "mutuallyExclusiveGroup": "DirectoryExclude"
            },
            {
              "name": "DirectoryIncludeGlob",
              "valueType": "str",
              "isOptional": true,
              "isMultiple": false,
              "isExtended": false,
              "mutuallyExclusiveGroup": "DirectoryInclude"
            },
            {
              "name": "DirectoryExcludeGlob",
              "valueType": "str",
              "isOptional": true,
              "isMultiple": false,
              "isExtended": false,
              "mutuallyExclusiveGroup": "DirectoryExclude"
            }
          ]
        },
        {
          "name": "git",
          "isOptional": true,
          "options": [
            {
              "name": "RevRanges",
              "valueType": "str",
              "isOptional": false,
              "isMultiple": false,
              "isExtended": false
            },
            {
              "name": "SinceDate",
              "valueType": "datetime",
              "isOptional": true,
              "isMultiple": false,
              "isExtended": false
            },
            {
              "name": "UntilDate",
              "valueType": "datetime",
              "isOptional": true,
              "isMultiple": false,
              "isExtended": false
            }
          ]
        },
        {
          "name": "svn",
          "isOptional": true,
          "options": [
            {
              "name": "RevRanges",
              "valueType": "str",
              "isOptional": false,
              "isMultiple": false,
              "isExtended": false
            },
            {
              "name": "SinceDate",
              "valueType": "datetime",
              "isOptional": true,
              "isMultiple": false,
              "isExtended": false
            },
            {
              "name": "UntilDate",
              "valueType": "datetime",
              "isOptional": true,
              "isMultiple": false,
              "isExtended": false
            }
          ]
        },
        {
          "name": "Issues",
          "isOptional": false,
          "options": [
            {
              "name": "IssueTracker",
              "valueType": "SectionRef",
              "isOptional": false,
              "enumeration": [
                "JIRA",
                "Redmine",
                "TFS"
              ],
              "isMultiple": false,
              "isExtended": false
            },
            {
              "name": "IssueURL",
              "valueType": "str",
              "isOptional": false,
              "isMultiple": false,
              "isExtended": false
            },
            {
              "name": "CommitIssueFilter",
              "valueType": "SectionRef",
              "isOptional": false,
              "sectionType": "issue-filter",
              "isMultiple": true,
              "isExtended": false
            }
          ]
        },
        {
          "name": "JIRA",
          "isOptional": true,
          "options": [
            {
              "name": "JQLFilter",
              "valueType": "str",
              "isOptional": false,
              "isMultiple": false,
              "isExtended": false
            }
          ]
        },
        {
          "isOptional": true,
          "sectionType": "issue-filter",
          "options": [
            {
              "name": "Pattern",
              "valueType": "str",
              "isOptional": false,
              "isMultiple": false,
              "isExtended": false
            },
            {
              "name": "StartLine",
              "valueType": "int",
              "isOptional": false,
              "isMultiple": false,
              "isExtended": false,
              "minValue": 5,
              "maxValue": 30
            },
            {
              "name": "EndLine",
              "valueType": "int",
              "isOptional": false,
              "isMultiple": false,
              "isExtended": false
            },
            {
              "name": "AggregateIssueLinks",
              "valueType": "str",
              "isOptional": false,
              "enumeration": [
                "Is Part Of",
                "Is Story Of"
              ],
              "isMultiple": false,
              "isExtended": false
            }
          ]
        },
        {
          "name": "Processing",
          "isOptional": false,
          "sectionGroup": "Advanced",
          "options": [
            {
              "name": "DirectoryRenameDetectionTimeout",
              "valueType": "int",
              "isOptional": true,
              "default": 30,
              "isMultiple": false,
              "isExtended": false
            },
            {
              "name": "CompletionPeriod",
              "valueType": "int",
              "isOptional": false,
              "isMultiple": false,
              "isExtended": false
            }
          ]
        },
        {
          "name": "Misc",
          "isOptional": false,
          "sectionGroup": "Advanced",
          "options": [
            {
              "name": "Encoding",
              "valueType": "str",
              "isOptional": false,
              "isMultiple": false,
              "isExtended": false
            }
          ]
        }
      ]
    };

    this.sections =  _.filter(this.detangleConfig.sections, function (o) { return o.name; });
    this.schema = {};
    this.schema.type = "object";
    this.schema.properties = {};
    console.log(this.detangleConfig);
    _.forEach(this.sections, (section) => {
      if (section.isOptional) { return; }
      this.schema.properties[section.name] = {};
      //this.schema.properties[section.name].type = "object";
      _.map(section.options, (option) => {
        return this.formatFieldData(this.schema.properties[section.name], option);
      });
    });
    this.forms = [];
    _.forEach(_.groupBy(this.sections, 'sectionGroup'),(sectionGroup, key) => {
      if (key === 'undefined'){
        _.forEach(sectionGroup, (sectionGroupItem) => {
          if (!sectionGroupItem.name) { return; }
          let tempFormList = [];
          tempFormList.push(this.formatForm(sectionGroupItem, key));
          this.forms.push(tempFormList);
        });
      }else{
        let tempFormList = [];
        _.forEach(sectionGroup, (sectionGroupItem) => {
          tempFormList.push(this.formatForm(sectionGroupItem, key));
        });
        this.forms.push(tempFormList);
      }
    });
    console.log(this.schema);
    console.log(this.forms);
  }

  initNewDatasourceModel() {
    this.model = { Issues: {CommitIssueFilter: [{Pattern: "a"}, {Pattern: "b"}]}};
  }

  formatFieldData(parent, fieldData) {
    if (parent.properties === undefined){
      parent.properties = {};
      parent.type = "object";
      parent.required = [];
    }
    if (!fieldData.isOptional) { parent.required.push(fieldData.name); }
    if (fieldData.valueType === "str" || fieldData.valueType === "int" || fieldData.valueType === "datetime"){
      parent.properties[fieldData.name] = { title: fieldData.name};
      if (fieldData.minValue){
        parent.properties[fieldData.name].minimum = fieldData.minValue;
      }
      if (fieldData.maxValue){
        parent.properties[fieldData.name].maximum = fieldData.maxValue;
      }
      switch (fieldData.valueType) {
        case "str": {
          parent.properties[fieldData.name].type = "string";
          if (fieldData.enumeration){
            parent.properties[fieldData.name].enum = fieldData.enumeration;
          }
          if (fieldData.pattern){
            parent.properties[fieldData.name].pattern = fieldData.pattern;
          }
          break;
        }
        case "int": {
          parent.properties[fieldData.name].type = "integer";
          break;
        }
        case "float": {
          parent.properties[fieldData.name].type = "number";
          break;
        }
        case "datetime": {
          parent.properties[fieldData.name].type = "string";
          parent.properties[fieldData.name].format = "date";
          break;
        }
      }
    }else if (fieldData.valueType === 'SectionRef' && !fieldData.isMultiple) {
      parent.properties[fieldData.name] = { title: fieldData.name, type: 'string', enum: fieldData.enumeration};
      _.forEach(fieldData.enumeration, (enumData) => {
        let tempSec = _.find(this.sections, (o) => { return o.name === enumData; });
        if (tempSec === undefined) { return; }
        this.schema.properties[tempSec.name] = {};
        //this.schema.properties[tempSec.name].type = "object";
        _.map(tempSec.options, (option) => { return this.formatFieldData(this.schema.properties[tempSec.name], option);
        });
      });
    }else if (fieldData.valueType === 'SectionRef' && fieldData.isMultiple) {
      let tempSec = _.find(this.detangleConfig.sections, function (o) { return o.sectionType === fieldData.sectionType; });
      if (tempSec === undefined) { return; }
      parent.properties[fieldData.name] = {};
      parent.properties[fieldData.name].type = "array";
      parent.properties[fieldData.name].title = "{{ 'Filter '+ ($index+1) }}";

        parent.properties[fieldData.name].items = {};
      _.map(tempSec.options, (option) => { return this.formatFieldData(parent.properties[fieldData.name].items, option);
      });
    }
  }

  formatFormData(form, fieldData){
    let key = form.key + (form.startEmpty !== undefined ? '[].' : '.') + fieldData.name;
    if ((fieldData.valueType === "SectionRef" && !fieldData.isMultiple) ||
      (fieldData.enumeration && fieldData.valueType === 'str')){
      form.items.push({
        "key": key,
        "style": {
          "selected": "btn btn-warning",
          "unselected": "btn btn-inverse"
        },
        "type": "radiobuttons",
        "htmlClass": formHtmlClass,
        "fieldHtmlClass": fieldHtmlClass,
        "labelHtmlClass": labelHtmlClass,
        "descriptionInfo": fieldData.description
      });
    } else if (fieldData.valueType === "SectionRef" && fieldData.isMultiple){
      let tempForm = {};
      //tempForm['title'] = fieldData.name;
      tempForm['htmlClass'] = formGroupHtmlClass;
      tempForm['type'] = 'tabarray';
      tempForm['tabType'] = 'top';
      tempForm['remove'] = 'Delete';
      tempForm['key'] = key;
      tempForm['startEmpty'] = false;
      tempForm['add'] = 'New ' + fieldData.name;
      tempForm['style'] = {"add": "btn btn-primary", "remove": "btn btn-danger"};
      tempForm['items'] = [];
      tempForm['title'] = "{{'" + fieldData.name + " ' + ($index + 1)}}";
      let tempSec = _.find(this.detangleConfig.sections, function (o) { return o.sectionType === fieldData.sectionType; });
      _.map(tempSec.options, (option) => {
        return this.formatFormData(tempForm, option);
      });
      form.items.push(tempForm);
    }else {
      if (fieldData.mutuallyExclusiveGroup){
        let conditionString = this.generateMutuallyExclusiveGroupsCondition(form.key, fieldData);
        form.items.push({
          "key": key,
          "htmlClass": formHtmlClass,
          "fieldHtmlClass": fieldHtmlClass,
          "labelHtmlClass": labelHtmlClass,
          "descriptionInfo": fieldData.description,
          "readonly": "true",
          "condition": conditionString
        });
        form.items.push({
          "key": key,
          "htmlClass": formHtmlClass,
          "fieldHtmlClass": fieldHtmlClass,
          "labelHtmlClass": labelHtmlClass,
          "descriptionInfo": fieldData.description,
          "condition": "!(" + conditionString + ")"
        });
      } else {
        form.items.push({
          "key": key,
          "htmlClass": formHtmlClass,
          "fieldHtmlClass": fieldHtmlClass,
          "descriptionInfo": fieldData.description,
          "labelHtmlClass": labelHtmlClass
        });
      }
    }
  }

  generateMutuallyExclusiveGroupsCondition(sectionName, fieldData){
    let tempSec = _.find(this.detangleConfig.sections, function (o) { return o.name === sectionName; });
    if (!tempSec) { return; }
    let exclusiveGroupList = _.filter(tempSec.options, (option) => {
      return option.mutuallyExclusiveGroup === fieldData.mutuallyExclusiveGroup && option.name !== fieldData.name; });
    let conditionString = "";
    _.forEach(exclusiveGroupList, (exclusiveGroup, index) => {
      conditionString += "(ctrl.model." + tempSec.name + "." + exclusiveGroup.name + "  || '') !== ''";
      if (exclusiveGroupList.length - 1 !== index){
        conditionString += " || ";
      }
    });
    return conditionString;
  }

  formatForm(section, key){
    let tempForm = {};
    tempForm['title'] = section.name;
    tempForm['htmlClass'] = formGroupHtmlClass;
    if (key !== 'undefined'){
      tempForm['sectionGroup'] = key;
    }
    tempForm['key'] = section.name;
    tempForm['items'] = [];
    if (section.isOptional) {
      let tempSection = _.find(this.sections, _.flow(
        _.property('options'),
        _.partialRight(_.some, function(property){ return property.valueType === "SectionRef" &&
          _.includes(property.enumeration, section.name) ;})));
      let conditionParam = _.find(tempSection.options, function(property){ return property.valueType === "SectionRef" &&
        _.includes(property.enumeration, section.name) ;} );
      // section referans'ı yoksa return yap
      tempForm['condition'] = "ctrl.model." + tempSection.name + "." + conditionParam.name + " === '" + section.name + "'";
    }
    _.map(section.options, (option) => {
      return this.formatFormData(tempForm, option);
    });
    return tempForm;
  }

  saveChanges() {
    this.$scope.$broadcast('schemaFormValidate');
    console.log(this.model);
  }

  exitValidation() {
    let currentStep = this.WizardHandler.wizard().currentStep();
    this.$scope.$broadcast('schemaFormValidate', currentStep.title);
    if (currentStep.$$childTail.$$childTail.formCtrl.$valid){
      this.WizardHandler.wizard().next();
    }
  }
}

coreModule.controller('ProjectEditCtrl', ProjectEditCtrl);

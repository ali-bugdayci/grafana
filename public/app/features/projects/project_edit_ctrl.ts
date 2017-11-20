///<reference path="../../headers/common.d.ts" />

import angular from 'angular';
import _ from 'lodash';

import config from 'app/core/config';
import {coreModule, appEvents} from 'app/core/core';

var datasourceTypes = [];

var defaults = {
  name: '',
  type: 'graphite',
  url: '',
  access: 'proxy',
  jsonData: {},
  secureJsonFields: {},
};

var datasourceCreated = false;

export class ProjectEditCtrl {
  isNew: boolean;
  datasources: any[];
  model: any;
  types: any;
  testing: any;
  datasourceMeta: any;
  tabIndex: number;
  hasDashboards: boolean;
  editForm: any;
  gettingStarted: boolean;
  navModel: any;
  schema: any;
  form: any;
  forms: any[];
  sections: any[];
  detangleConfig: any;

  /** @ngInject */
  constructor(private $scope,
              private $q,
              private backendSrv,
              private $routeParams,
              private $location,
              private $timeout,
              private datasourceSrv,
              private navModelSrv,
              private WizardHandler,
              private schemaForm) {

    this.navModel = navModelSrv.getDatasourceNav(0);
    this.isNew = true;
    this.datasources = [];
    this.tabIndex = 0;
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
    // this.schema = {
    //   "type": "object",
    //   "title": "Configuration",
    //   "required": ["url", "vcs", "issues"],
    //   "properties": {
    //     "repository": {
    //       "type": "object",
    //       "properties": {
    //         "url": {
    //           "title": "Repo Url",
    //           "type": "string"
    //         },
    //         "vcs": {
    //           "title": "VCS Type",
    //           "type": "string",
    //           "enum": [
    //             "git",
    //             "svn"
    //           ]
    //         },
    //         "filter": {
    //           "type": "object",
    //           "properties": {
    //             "subPath": {
    //               "title": "Sub Path",
    //               "type": "string"
    //             },
    //             "filenameIncludeRegex": {
    //               "title": "Filename Include Regex",
    //               "type": "string"
    //             },
    //             "filenameExcludeRegex": {
    //               "title": "Filename Exclude Regex",
    //               "type": "string"
    //             },
    //             "filenameIncludeGlob": {
    //               "title": "Global Filename Include",
    //               "type": "string"
    //             },
    //             "filenameExcludeGlob": {
    //               "title": "Global Filename Exclude",
    //               "type": "string"
    //             },
    //             "dirIncludeRegex": {
    //               "title": "Dir Include Regex",
    //               "type": "string"
    //             },
    //             "dirExcludeRegex": {
    //               "title": "Dir Exclude Regex",
    //               "type": "string"
    //             },
    //             "dirIncludeGlob": {
    //               "title": "Global Dir Include",
    //               "type": "string"
    //             },
    //             "dirExcludeGlob": {
    //               "title": "Global Dir Exclude",
    //               "type": "string"
    //             }
    //           }
    //         }
    //       }
    //     },
    //     "git": {
    //       "type": "object",
    //       "title": "Git",
    //       "required": [],
    //       "properties": {
    //         "revRanges": {
    //           "type": "string",
    //           "title": "Rev Ranges"
    //         },
    //         "sinceDate": {
    //           "type": "string",
    //           "format": "date",
    //           "title": "Since"
    //         },
    //         "untilDate": {
    //           "type": "string",
    //           "format": "date",
    //           "title": "Until"
    //         },
    //         "dirRenameDetectionTimeout": {
    //           "type": "integer",
    //           "title": "Dir Rename Detection Timeout",
    //           "placeholder": "30"
    //         }
    //       }
    //     },
    //     "svn": {
    //       "type": "object",
    //       "required": [],
    //       "properties": {}
    //     },
    //     "issues": {
    //       "type": "object",
    //       "default": {},
    //       "required": [
    //         "filteredIssues"
    //       ],
    //       "properties": {
    //         "issueTracker": {
    //           "type": "string",
    //           "title": "Issue Tracker",
    //           "enum": [
    //             "trac",
    //             "jira",
    //             "redmine",
    //             "tfs"
    //           ]
    //         },
    //         "issueUrl": {
    //           "type": "string",
    //           "title": "Issue URL"
    //         },
    //         "filteredIssues": {
    //           "title": "Filtered Issues",
    //           "type": "array",
    //           // "default": [],
    //           "items": {
    //             "type": "object",
    //             "properties": {
    //               "pattern": {
    //                 "type": "string",
    //                 "title": "Pattern"
    //               },
    //               "startLine": {
    //                 "type": "integer",
    //                 "title": "Start Line"
    //               },
    //               "endLine": {
    //                 "type": "string",
    //                 "title": "End Line"
    //               },
    //               "aggregateIssueLinks": {
    //                 "title": "Aggragate Issue Links",
    //                 "type": "string",
    //                 "enum": [
    //                   "is part of",
    //                   "is story of"
    //                 ]
    //               }
    //             }
    //           }
    //         }
    //       }
    //     },
    //     "jira": {
    //       "type": "object",
    //       "properties": {
    //         "jiraJqlFilter": {
    //           "type": "string",
    //           "title": "Jql Filter"
    //         }
    //       }
    //     },
    //     "processing": {
    //       "type": "object",
    //       "properties": {
    //         "completionPeriod": {
    //           "type": "integer",
    //           "title": "Completion Period"
    //         },
    //         "encodings": {
    //           "type": "string",
    //           "title": "Encodings"
    //         }
    //       }
    //     }
    //   }
    // };
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
    // _.forEach(this.sections, (section) => {
    //   if (!section.name || section.sectionGroup) { return; }
    //   let tempFormList = [];
    //   let tempForm = {};
    //   tempForm['title'] = section.name;
    //   tempForm['htmlClass'] = 'gf-form-group';
    //   tempForm['key'] = section.name;
    //   tempForm['items'] = [];
    //   if (section.isOptional) {
    //     let tempSection = _.find(this.sections, _.flow(
    //       _.property('options'),
    //       _.partialRight(_.some, function(property){ return property.valueType === "SectionRef" &&
    //         _.includes(property.enumeration, section.name) ;})));
    //     let conditionParam = _.find(tempSection.options, function(property){ return property.valueType === "SectionRef" &&
    //       _.includes(property.enumeration, section.name) ;} );
    //     tempForm['condition'] = "ctrl.current." + tempSection.name + "." + conditionParam.name + " === '" + section.name + "'";
    //   }
    //   _.map(section.options, (option) => {
    //     return this.formatFormData(tempForm, option);
    //   });
    //   tempFormList.push(tempForm);
    //   this.forms.push(tempFormList);
    // });
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
    //this.forms = [];
    // this.forms.push([
    //   {
    //     "title": "Repository",
    //     "key": "repository",
    //     "htmlClass": "gf-form-group",
    //     "items": [
    //
    //       {
    //         "key": "repository.url",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20",
    //         "placeholder": "http://repo.url"
    //       },
    //       {
    //         "key": "repository.vcs",
    //         "style": {
    //           "selected": "btn btn-warning",
    //           "unselected": "btn btn-inverse"
    //         },
    //         "type": "radiobuttons",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20"
    //       },
    //       {
    //         "key": "repository.filter.filenameIncludeRegex",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20"
    //       },
    //       {
    //         "key": "repository.filter.filenameExcludeRegex",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20"
    //       },
    //       {
    //         "key": "repository.filter.filenameIncludeGlob",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20"
    //       },
    //       {
    //         "key": "repository.filter.filenameExcludeGlob",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20"
    //       },
    //       {
    //         "key": "repository.filter.dirIncludeRegex",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20"
    //       },
    //       {
    //         "key": "repository.filter.dirExcludeRegex",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20"
    //       },
    //       {
    //         "key": "repository.filter.dirIncludeGlob",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20"
    //       },
    //       {
    //         "key": "repository.filter.dirExcludeGlob",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20"
    //       }
    //     ]
    //   }]);
    // this.forms.push([{
    //   "title": "Git",
    //   "key": "git",
    //   "condition": "ctrl.current.repository.vcs === 'git'",
    //   "htmlClass": "gf-form-group",
    //   "items": [
    //     {
    //       "key": "git.revRanges",
    //       "htmlClass": "gf-form",
    //       "fieldHtmlClass": "gf-form-input max-width-20",
    //       "labelHtmlClass": "gf-form-label width-20"
    //     },
    //     {
    //       "key": "git.sinceDate",
    //       "htmlClass": "gf-form",
    //       "fieldHtmlClass": "gf-form-input max-width-20",
    //       "labelHtmlClass": "gf-form-label width-20"
    //     },
    //     {
    //       "key": "git.untilDate",
    //       "htmlClass": "gf-form",
    //       "fieldHtmlClass": "gf-form-input max-width-20",
    //       "labelHtmlClass": "gf-form-label width-20"
    //     },
    //     {
    //       "key": "git.dirRenameDetectionTimeout",
    //       "htmlClass": "gf-form-inline gf-form",
    //       "fieldHtmlClass": "gf-form-input max-width-20",
    //       "labelHtmlClass": "gf-form-label width-20"
    //     }
    //   ]
    // }]);
    // this.forms.push([
    //   {
    //     "title": "Svn",
    //     "key": "svn",
    //     "condition": "ctrl.current.repository.vcs === 'svn'",
    //     "htmlClass": "gf-form-group",
    //     "items": []
    //   }
    // ]);
    // this.forms.push([
    //   {
    //     "title": "Issues",
    //     "key": "issues",
    //     "htmlClass": "gf-form-group",
    //     "items": [
    //       {
    //         "key": "issues.issueTracker",
    //         "style": {
    //           "selected": "btn btn-warning",
    //           "unselected": "btn btn-inverse"
    //         },
    //         "type": "radiobuttons",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20"
    //       },
    //       {
    //         "key": "issues.issueUrl",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20",
    //         "placeholder": "http://issuetracker.url"
    //       },
    //       {
    //         "key": "issues.filteredIssues",
    //         "startEmpty": true,
    //         "add": "New Issue Filter",
    //         "style": {
    //           "add": "btn btn-primary"
    //         },
    //         "items": [
    //           {
    //             "key": "issues.filteredIssues[].pattern",
    //             "htmlClass": "gf-form",
    //             "fieldHtmlClass": "gf-form-input max-width-20",
    //             "labelHtmlClass": "gf-form-label width-20"
    //           },
    //           {
    //             "key": "issues.filteredIssues[].startLine",
    //             "htmlClass": "gf-form",
    //             "fieldHtmlClass": "gf-form-input max-width-20",
    //             "labelHtmlClass": "gf-form-label width-20"
    //           },
    //           {
    //             "key": "issues.filteredIssues[].endLine",
    //             "htmlClass": "gf-form",
    //             "fieldHtmlClass": "gf-form-input max-width-20",
    //             "labelHtmlClass": "gf-form-label width-20"
    //           },
    //           {
    //             "key": "issues.filteredIssues[].aggregateIssueLinks",
    //             "style": {
    //               "selected": "btn btn-warning",
    //               "unselected": "btn btn-inverse"
    //             },
    //             "type": "radiobuttons",
    //             "htmlClass": "gf-form",
    //             "fieldHtmlClass": "gf-form-input max-width-20",
    //             "labelHtmlClass": "gf-form-label width-20"
    //           }
    //         ]
    //       }
    //     ]
    //   }
    // ]);
    // this.forms.push([
    //   {
    //     "title": "Jira",
    //     "key": "jira",
    //     "condition": "ctrl.current.issues.issueTracker === 'jira'",
    //     "htmlClass": "gf-form-group",
    //     "items": [
    //       {
    //         "key": "jira.jiraJqlFilter",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20"
    //       }
    //     ]
    //   }
    // ]);
    // this.forms.push([
    //   {
    //     "title": "Processing",
    //     "key": "processing",
    //     "htmlClass": "gf-form-group",
    //     "items": [
    //       {
    //         "key": "processing.completionPeriod",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20"
    //       },
    //       {
    //         "key": "processing.encodings",
    //         "htmlClass": "gf-form",
    //         "fieldHtmlClass": "gf-form-input max-width-20",
    //         "labelHtmlClass": "gf-form-label width-20"
    //       }
    //     ]
    //   },
    //   {
    //     "htmlClass": "gf-form-button-row",
    //     "type": "button",
    //     "style": "btn btn-success",
    //     "title": "Add",
    //     "onClick": "ctrl.saveChanges()"
    //   }
    // ]);
    // this.forms = [
    //   "*",
    //   {
    //     type: "button",
    //     onClick: "ctrl.saveChanges()",
    //     title: "Save"
    //   }
    // ];
    this.form = [];
  }

  initNewDatasourceModel() {
    // this.current = _.cloneDeep(defaults);
    //
    // // We are coming from getting started
    // if (this.$location.search().gettingstarted) {
    //   this.gettingStarted = true;
    //   this.current.isDefault = true;
    // }
    this.model = { Issues: {CommitIssueFilter: [{Pattern: "a"}, {Pattern: "b"}]}};
    //this.typeChanged();
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
        "htmlClass": "gf-form",
        "fieldHtmlClass": "gf-form-input max-width-20",
        "labelHtmlClass": "gf-form-label width-20",
        "descriptionInfo": fieldData.description
      });
    } else if (fieldData.valueType === "SectionRef" && fieldData.isMultiple){
      let tempForm = {};
      //tempForm['title'] = fieldData.name;
      tempForm['htmlClass'] = 'gf-form-group';
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
          "htmlClass": "gf-form",
          "fieldHtmlClass": "gf-form-input max-width-20",
          "labelHtmlClass": "gf-form-label width-20",
          "descriptionInfo": fieldData.description,
          "readonly": "true",
          "condition": conditionString
        });
        form.items.push({
          "key": key,
          "htmlClass": "gf-form",
          "fieldHtmlClass": "gf-form-input max-width-20",
          "labelHtmlClass": "gf-form-label width-20",
          "descriptionInfo": fieldData.description,
          "condition": "!(" + conditionString + ")"
        });
      } else {
        form.items.push({
          "key": key,
          "htmlClass": "gf-form",
          "fieldHtmlClass": "gf-form-input max-width-20",
          "descriptionInfo": fieldData.description,
          "labelHtmlClass": "gf-form-label width-20"
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
    tempForm['htmlClass'] = 'gf-form-group';
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
    // if (!this.editForm.$valid) {
    //   return;
    // }
    //
    // if (this.current.id) {
    //   return this.backendSrv.put('/api/datasources/' + this.current.id, this.current).then(() => {
    //     this.updateFrontendSettings().then(() => {
    //       this.testDatasource();
    //     });
    //   });
    // } else {
    //   return this.backendSrv.post('/api/datasources', this.current).then(result => {
    //     this.updateFrontendSettings();
    //
    //     datasourceCreated = true;
    //     this.$location.path('datasources/edit/' + result.id);
    //   });
    // }
  }

  exitValidation() {
    let currentStep = this.WizardHandler.wizard().currentStep();
    this.$scope.$broadcast('schemaFormValidate', currentStep.title);
    if (currentStep.$$childTail.$$childTail.formCtrl.$valid){
      this.WizardHandler.wizard().next();
    }
    // let isValid = true;
    // let currentStep = this.WizardHandler.wizard().currentStep();
    // if (_.isUndefined(currentStep)) { return isValid; }
    // let objectNames = _.map(form,'title');
    // if (!(_.includes(objectNames, currentStep.title) || currentStep.title === form[0].sectionGroup)){
    //   return isValid;
    // }
    // console.log(currentStep.$$childTail);
    // // _.forEach(currentStep.$$childTail.deneme, (value, key) => {
    // //   console.log(key);
    // //   if (typeof value === 'object' && value.hasOwnProperty('$modelValue')){
    // //     currentStep.$$childTail.deneme[key].$setDirty();
    // //   }
    // // });
    // let toBeValidatedObjects = {};
    // _.forEach(objectNames, (objectName) => {
    //   toBeValidatedObjects[objectName] = this.schema.properties[objectName].required;
    // });
    // _.forOwn(toBeValidatedObjects, (requiredFields, objectName)  => {
    //   _.forEach(requiredFields,(requiredField) => {
    //     let fieldName = objectName + "." + requiredField;
    //     if (!_.isObject(this.model[objectName]) || _.isEmpty(this.model[objectName][requiredField])){
    //     console.log(requiredField);
    //     // console.log(currentStep.$$childTail.$$childTail.formCtrl.$invalid);
    //     // if (_.isUndefined(currentStep.$$childTail.$$childTail.formCtrl[requiredField].$modelValue)){
    //
    //       console.log(this.model);
    //       // this.$scope.$broadcast('schemaForm.error.' + fieldName,'usernameAlreadyTaken','The username is already taken');
    //       console.log('also here');
    //       isValid = false;
    //     }else{
    //       // console.log(currentStep.$$childTail.deneme[requiredField]);
    //       // currentStep.$$childTail.deneme[requiredField].$setValidity("required", true);
    //     }
    //   });
    // });
    //return isValid;
  }
}

coreModule.controller('ProjectEditCtrl', ProjectEditCtrl);

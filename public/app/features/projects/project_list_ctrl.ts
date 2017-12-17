///<reference path="../../headers/common.d.ts" />

import coreModule from '../../core/core_module';

export class ProjectsCtrl {
  projects: any;
  navModel: any;

  /** @ngInject */
  constructor(
    private backendSrv,
    private navModelSrv
  ) {

    this.navModel = this.navModelSrv.getDatasourceNav(0);

    backendSrv.get('http://192.168.1.106:8080/api/config/projects').then(result => {
      console.log(result);
      this.projects = result.projects;
    });
  }



}

coreModule.controller('ProjectsCtrl', ProjectsCtrl);

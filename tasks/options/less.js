module.exports = function(config) {
  'use strict';

  return {
    src:{
      options: {
        paths: ["<%= srcDir %>"],
        yuicompress: true
      },
      files: {
        "<%= genDir %>/css/angular-wizard.min.css": "<%= srcDir %>/vendor/angular-wizard/dist/angular-wizard.less"

      }
    }
  };
};

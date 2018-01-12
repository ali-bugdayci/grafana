///<reference path="../../headers/common.d.ts" />

import angular from 'angular';
import $ from 'jquery';
import appEvents from 'app/core/app_events';


var module = angular.module('grafana.directives');


/**
 * @detangleEdit
 * @author Ali
 */
module.directive('panelContainer', function() {
  return {
    restrict: 'C',
    link: function(scope, elem) {
      var ctrl = scope.ctrl;

      function findDataFromPosition(field, event) {
        var x = event.clientX;
        var y = event.clientY;

        var htmlElement = document.elementFromPoint(x, y);
        var ele = $(htmlElement);
        var width = ele.width();

        var leftCaptionWidth = 26; //px
        width = width - leftCaptionWidth;

        var shownElements = ctrl.seriesList.length;

        var stickCount = shownElements+2;
        var gapCount = shownElements-1;
        var totalSticksToLook = stickCount + gapCount/2.5;

        var stickWidth = width/totalSticksToLook;
        width = width - 2*stickWidth; // Remove left and right offsets
        width = width + stickWidth/2.5; //Add the right gap

        var elementTotalWidth = width/shownElements;
        var clickPositionOnElement = x - ele.offset().left - leftCaptionWidth - stickWidth;

        var clickedAt = Math.floor(clickPositionOnElement / elementTotalWidth);

        if (clickedAt < 0 || clickedAt > shownElements) {
          return;
        }

        event.stopPropagation();

        emit(field, ctrl.dataList[clickedAt].props[field]);

      }

      function emit(field, value) {
        appEvents.emit('add-selection', {
          field: field,
          value: value
        });
      }

      function findDataFromTooltip(field,event, className, splitBy) {
        var highlighted = $("." + className);

        var text;
        if (highlighted.length) {
          text = highlighted.text();
        } else {
          var whole = $(".grafana-tooltip");
          text = whole.text().trim();
        }

        if (!text) {
          return;
        } else {
          if (splitBy) {
            var index = text.lastIndexOf(splitBy);

            if (index !== -1) {
              text = text.substr(0,index);
            }
          }

          text = text.trim();
        }

        event.stopPropagation();

        emit(field, text);
      }

      function shiftClick(event) {
        if (!event.shiftKey) {
          return;
        }

        var buckets = ctrl.panel.targets[0].bucketAggs;

        var bucketLength = buckets.length;
        var field = buckets[0].field;
        var timeType = buckets[bucketLength-1].type;

        if (bucketLength > 2 && timeType === "date_histogram") {
          findDataFromPosition(field,event);
        } else {
          var splitBy = ":";
          var className = "graph-tooltip-time";

          switch (ctrl.pluginId) {

            case "graph":
              className = "graph-tooltip-list-item--highlight";
              break;

            case "savantly-heatmap-panel":
              className = "d3plus_tooltip_title";
              break;
          }

          findDataFromTooltip(field, event, className, splitBy);
        }
      }

      elem.on('click', shiftClick);

      scope.$on('$destroy', function() {
        elem.off();
      });
    }
  };
});


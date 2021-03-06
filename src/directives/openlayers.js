// import { defaults as controlDefaults } from 'ol/control';
// import { defaults as interactionDefaults } from 'ol/interaction';
// import Map from 'ol/Map';
// import { transform } from 'ol/proj';

import {control, interaction, Map, proj} from 'ol-prebuilt';

export default angular.module('openlayers-directive', ['ngSanitize']).directive('openlayers', 
["$log", "$q", "$compile", "olHelpers", "olMapDefaults", "olData", function($log, $q, $compile, olHelpers, olMapDefaults, olData) {
        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                center: '=olCenter',
                defaults: '=olDefaults',
                view: '=olView',
                events: '=olEvents'
            },
            template: '<div class="angular-openlayers-map" ng-transclude></div>',
            controller: ["$scope", function($scope) {
                var _map = $q.defer();
                $scope.getMap = function() {
                    return _map.promise;
                };

                $scope.setMap = function(map) {
                    _map.resolve(map);
                };

                this.getOpenlayersScope = function() {
                    return $scope;
                };
            }],
            link: function(scope, element, attrs) {
                var isDefined = olHelpers.isDefined;
                var createLayer = olHelpers.createLayer;
                var setMapEvents = olHelpers.setMapEvents;
                var setViewEvents = olHelpers.setViewEvents;
                var createView = olHelpers.createView;
                var defaults = olMapDefaults.setDefaults(scope);

                // Set width and height if they are defined
                if (isDefined(attrs.width)) {
                    if (isNaN(attrs.width)) {
                        element.css('width', attrs.width);
                    } else {
                        element.css('width', attrs.width + 'px');
                    }
                }

                if (isDefined(attrs.height)) {
                    if (isNaN(attrs.height)) {
                        element.css('height', attrs.height);
                    } else {
                        element.css('height', attrs.height + 'px');
                    }
                }

                if (isDefined(attrs.lat)) {
                    defaults.center.lat = parseFloat(attrs.lat);
                }

                if (isDefined(attrs.lon)) {
                    defaults.center.lon = parseFloat(attrs.lon);
                }

                if (isDefined(attrs.zoom)) {
                    defaults.center.zoom = parseFloat(attrs.zoom);
                }

                var controls = control.defaults(defaults.controls);
                var interactions = interaction.defaults(defaults.interactions);
                var view = createView(defaults.view);

                // Create the Openlayers Map Object with the options
                var map = new Map({
                    target: element[0],
                    controls: controls,
                    interactions: interactions,
                    renderer: defaults.renderer,
                    view: view,
                    loadTilesWhileAnimating: defaults.loadTilesWhileAnimating,
                    loadTilesWhileInteracting: defaults.loadTilesWhileInteracting
                });

                scope.$on('$destroy', function() {
                    olData.resetMap(attrs.id);
                    map.setTarget(null);
                    map = null;
                });

                // If no layer is defined, set the default tileLayer
                if (!attrs.customLayers) {
                    var l = {
                        type: 'Tile',
                        source: {
                            type: 'OSM'
                        }
                    };
                    var layer = createLayer(l, view.getProjection(), 'default');
                    map.addLayer(layer);
                    map.set('default', true);
                }

                if (!isDefined(attrs.olCenter)) {
                    var c = proj.transform([defaults.center.lon,
                            defaults.center.lat
                        ],
                        defaults.center.projection, view.getProjection()
                    );
                    view.setCenter(c);
                    view.setZoom(defaults.center.zoom);
                }

                // Set the Default events for the map
                setMapEvents(defaults.events, map, scope);

                //Set the Default events for the map view
                setViewEvents(defaults.events, map, scope);

                // Resolve the map object to the promises
                scope.setMap(map);
                olData.setMap(map, attrs.id);

            }
        };
    }]);

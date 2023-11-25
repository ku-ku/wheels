<template>
    <div class="ar-map">
        <div class="ar-map__map"></div>
        <v-btn v-if="coords.length > 0"
               class="a-b"
               position="absolute"
               icon
               size="small"
               :color="(ab) ? ('A'==ab) ? 'red-accent-4' : ('B'==ab) ? 'green-darken-2' : 'orange-darken-4' : undefined"
               v-on:click.stop.prevent="gomap">
            <v-icon v-show="!ab">mdi-target</v-icon>
            <v-icon v-show="'V'===ab">mdi-truck-outline</v-icon>
            {{ ( !!ab && 'V'!==ab) ? ab : null }}
        </v-btn>
    </div>    
</template>
<script>
import 'ol/ol.css';
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import LineString from 'ol/geom/LineString';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {Circle as CircleStyle, Fill, Stroke, Style, Icon, Text, RegularShape} from 'ol/style';
import * as olExtent from 'ol/extent';
import { geo } from "app-ext/composables/geo";
import * as turf from '@turf/turf';

const _MAP_ICONS = {
        STARTING:'/map-images/map-a.png',
        ENDING:  '/map-images/map-b.png',
        TRUCK:   '/map-images/truck.png',
        loaded: false
};

const _routeStyle = feature => {
    const props = feature.getProperties();
    const { color, itsmy } = props;
    
    //line
    const styles = [
        new Style({
            stroke: new Stroke({
                color: color,
                lineJoin: "bevel",
                width: itsmy ? 3 : 4
            })
        })
    ];
    if (!itsmy){
        styles.push(
            new Style({
                        geometry: new Point(feature.getGeometry().getFirstCoordinate()),
                        image: new Icon({
                            src: _MAP_ICONS.STARTING,
                            scale: [0.3, 0.3],
                            anchorOrigin: 'bottom-left',
                            anchorXUnits: 'pixels',
                            anchorYUnits: 'pixels',
                            anchor: [20, 12],
                            rotateWithView: true
                        })
                    })
        );
        styles.push(
            new Style({
                        geometry: new Point(feature.getGeometry().getLastCoordinate()),
                        image: new Icon({
                            src: _MAP_ICONS.ENDING,
                            scale: [0.3, 0.3],
                            anchorOrigin: 'bottom-left',
                            anchorXUnits: 'pixels',
                            anchorYUnits: 'pixels',
                            anchor: [20, 12],
                            rotateWithView: true
                        })
                    })
        );
    }
    return styles;
};  //_routeStyle

const _truckStyle = feature => {
    if (!geo.coords.error){
        return new Style({
            geometry: new Point([geo.coords.longitude, geo.coords.latitude]),
            image: new Icon({
                        src: _MAP_ICONS.TRUCK,
                        scale: [0.6, 0.6],
                        rotateWithView: false
                    })
        });
    }
    return undefined;
};


export default {
    name: "ArMap",
    props: {
        route: {
            type: Object,
            required: true,
            default: null
        }
    },
    emits: ['distance'],
    setup(){
        if (_MAP_ICONS.loaded){
            return;
        }
        const config = useRuntimeConfig();
        if (config.app.baseURL.length > 1){
            Object.keys(_MAP_ICONS).forEach( async k => {
                try {
                    // @vite-ignore 
                    _MAP_ICONS[k] = config.app.baseURL + _MAP_ICONS[k];
                } catch(e) {
                    console.log('ERR(image load)', e);
                }
            });
        }
        _MAP_ICONS.loaded = true;
    },
    data(){
        return {
            map: null,
            ab: null
        };
    },
    mounted(){
        this.$nextTick(()=>{ 
            this.initMap(); 
        });
    },
    computed: {
        coords(){
            if (this?.route?.geometry){
                return this.route.geometry.coordinates;
            } else {
                return [];
            }
        }
    },
    methods: {
        initMap(){
            const node = $(this.$el).find(".ar-map__map");
            const map = new Map({
                target: node.get(0),
                layers: [
                  new TileLayer({
                    source: new OSM()
                  })
                ],
                controls: [],
                view: new View({
                    projection: 'EPSG:4326',
                    center: [39, 45],
                    zoom: 9,
                    enableRotation: false,
                    constrainResolution: true
                })
            });
            
            map.on('error', e => {
                console.log('ERR (map init)', e);
            });
            
            map.on('click', e => {
                e.stopPropagation();
                e.originalEvent.stopPropagation();
                e.preventDefault();
                e.originalEvent.preventDefault();
                return false;
            });
            
            this.map = map;
            
            this.drawRoute();
        },
        _routeStyle(feature){
            const props = feature.getProperties();
            const { color } = props;
            //line
            const styles = [
                new Style({
                    stroke: new Stroke({
                        color: color,
                        lineJoin: "bevel",
                        width: 8
                    })
                })
            ];
            
            return styles;
        },  //_routeStyle
        _getLayer(name){
            let layer = null;
            this.map?.getLayers().forEach( l => {
                if ( name === l.get('name') ){
                    layer = l;
                }
            });
            if ( !layer ){
                layer = new VectorLayer();
                layer.set('name', name);
                this.map.addLayer(layer);
            }
            return layer;
        },  //_getLayer
        _fit(source){
            const bounds = source.getExtent();
            if ( !olExtent.isEmpty(bounds) ){
                const view = this.map.getView();
                view.setCenter(olExtent.getCenter(bounds));
                view.fit(bounds, {padding: [12, 12, 12, 12]});
            }
        },
        drawRoute(){
            if (this.coords.length < 1){
                console.log('map: no coords for route', this.route);
                return;
            }
            let line = this._getLayer("route-layer");
            let source = line.getSource();
            if ( source ){
                source.clear();
            } else {
                source = new VectorSource();
                line.setSource(source);
            }
            source.addFeature(
                    new Feature({   
                                geometry: new LineString(this.coords),
                                color: "#8BC34A"
                    })
            );
            line.setStyle( _routeStyle );
            this._fit( source );
                    
            if ( geo.coords.timestamp > 0 ){
                let truck = this._getLayer("truck-layer");
                source = truck.getSource();
                if (!source){
                    source = new VectorSource();
                    truck.setSource(source);
                }
                source.addFeature(
                        new Feature({   
                                    geometry: new Point([geo.coords.longitude, geo.coords.latitude]),
                        })
                );
                truck.setStyle( _truckStyle );
                this._drawMy();
            }
        },   //drawRoute
        _drawMy(){
            let at = this.coords.at(0);
            const url = `${ location.protocol }//router.project-osrm.org/route/v1/route/${ geo.coords.longitude },${ geo.coords.latitude };${ at[0] },${ at[1] }?overview=full&geometries=geojson`;
            $.ajax({url, crossDomain: true}).then( res =>{
                let route= res.routes.at(0);
                let geom = route?.geometry;
                if ( !(geom?.coordinates?.length > 0) ){
                    return;
                }
                this.$emit("distance", Math.trunc(route.distance/1000));
                geom = turf.simplify(geom, {tolerance: 0.0001, highQuality: false});
                let line = this._getLayer("route-layer");
                let source = line.getSource();
                source.addFeature(
                    new Feature({   
                                    geometry: new LineString(geom.coordinates),
                                    color: '#FFC107',
                                    itsmy: true
                    })
                );
                this._fit( source );
            });
        },
        gomap(){
            let point;
            if (!this.ab){
                this.ab = 'A';
                point = this.coords[0];
            } else if ('A'===this.ab){
                this.ab = 'B';
                point = this.coords[this.coords.length - 1];
            } else if (('B' === this.ab) && (geo.coords.timestamp>0)){
                this.ab = 'V';
                point = [geo.coords.longitude, geo.coords.latitude];
            } else {
                this.ab = null
            }
            const view = this.map.getView();
            if (point){
                view.animate({zoom: 17, center: point, duration: 600});
            } else {
                const layer = this._getLayer("route-layer");
                const source = layer.getSource();
                const bounds = source?.getExtent();
                if ( !olExtent.isEmpty(bounds) ){
                    view.fit(bounds, {
                        padding: [20, 20, 20, 20],
                        callback: ()=>{
                            view.setCenter(olExtent.getCenter(bounds));
                        }
                    });
                }
            }
        }   //gomap
    }
};
</script>
<style lang="scss" scoped>
    .ar-map{
        height: 100%;
        position: relative;
        &__map{
            height: 100%;
        }
        & .a-b{
            z-index: 1001;
            right: 1rem;
            bottom: 1.5rem;
            font-size: 1rem;
        }
        & canvas, & img {
            image-rendering: optimizeQuality;
            image-rendering: -moz-crisp-edges;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: optimize-contrast;
            -ms-interpolation-mode: nearest-neighbor;
        }        
    }
</style>
<style lang="scss">
    div#cafe-map-container {
        position: absolute;
        top: 50px;
        left: 0px;
        right: 0px;
        bottom: 50px;

        div#cafe-map {
            position: absolute;
            top: 0px;
            left: 0px;
            right: 0px;
            bottom: 0px;
        }
    }
    
</style>

<template>
    <div id="cafe-map-container">
        <div id="cafe-map">

        </div>
        <cafe-map-filter></cafe-map-filter>
    </div>
</template>

<script>
    import {ROAST_CONFIG} from '../../config.js';
    import CafeMapFilter from './CafeMapFilter.vue';
    import EventBus from '../../event-bus.js';
    import { CafeIsRoasterFilter } from '../../mixins/filters/CafeIsRoasterFilter.js';
    import { CafeBrewMethodsFilter } from '../../mixins/filters/CafeBrewMethodsFilter.js';
    import { CafeTextFilter } from '../../mixins/filters/CafeTextFilter.js';
  export default {
      components:{
          CafeMapFilter
      },
      mixins: [
        CafeIsRoasterFilter,
        CafeBrewMethodsFilter,
        CafeTextFilter
    ],
    props: {
        'latitude': {  // 经度
            type: Number,
            default: function () {
                return 120.21
            }
        },
        'longitude': {  // 纬度
            type: Number,
            default: function () {
                return 30.29
            }
        },
        'zoom': {   // 缩放级别
            type: Number,
            default: function () {
                return 20
            }
        }
    },
    data() {
        return {
            markers:[],
            infoWindows: []
        }
    },
    mounted() {
        this.map = new AMap.Map('cafe-map', {
            center: [this.latitude, this.longitude],
            zoom: this.zoom
        });
        this.clearMarkers();
        this.buildMarkers();

        // 监听 filters-updated 事件过滤点标记
        EventBus.$on('filters-updated', function (filters) {
            this.processFilters(filters);
        }.bind(this));
    },
    computed: {
        cafes(){
            return this.$store.getters.getCafes;
        }
    },
    methods:{
        buildMarkers() {
            // 初始化点标记数组
            this.markers = [];

            // 自定义点标记图标
            var image = ROAST_CONFIG.APP_URL + '/storage/img/coffee-marker.png';
            var icon = new AMap.Icon({
                image: image,  // 图像 URL
                imageSize: new AMap.Size(19, 33)  // 设置图标尺寸
            });

            // 遍历所有咖啡店创建点标记
            for (var i = 0; i < this.cafes.length; i++) {

                // 为每个咖啡店创建点标记并设置经纬度
                var marker = new AMap.Marker({
                        position: new AMap.LngLat(parseFloat(this.cafes[i].latitude), parseFloat(this.cafes[i].longitude)),
                        title: this.cafes[i].location_name,
                        icon: icon,
                        extData: { 
                            'cafe': this.cafes[i]
                        }
                });
                // 为每个咖啡店创建信息窗体
                var infoWindow = new AMap.InfoWindow({
                    content: this.cafes[i].name
                });
                this.infoWindows.push(infoWindow);
                // 绑定点击事件到点标记对象，点击打开上面创建的信息窗体
                marker.on('click', function () {
                    infoWindow.open(this.getMap(), this.getPosition());
                });
                // 将点标记放到数组中
                this.markers.push(marker);
            }

            // 将所有点标记显示到地图上
            this.map.add(this.markers);
        },
        clearMarkers() {
    // 遍历所有点标记并将其设置为 null 从而从地图上将其清除
            for (var i = 0; i < this.markers.length; i++) {
                this.markers[i].setMap(null);
            }
        },
        processFilters(filters) {
            for (var i = 0; i < this.markers.length; i++) {
                if (filters.text === ''
                    && filters.roaster === false
                    && filters.brew_methods.length === 0) {
                    this.markers[i].setMap(this.map);
                } else {
                    var textPassed = false;
                    var brewMethodsPassed = false;
                    var roasterPassed = false;

                    if (filters.roaster && this.processCafeIsRoasterFilter(this.markers[i].getExtData().cafe)) {
                        roasterPassed = true;
                    } else if (!filters.roaster) {
                        roasterPassed = true;
                    }

                    if (filters.text !== '' && this.processCafeTextFilter(this.markers[i].getExtData().cafe, filters.text)) {
                        textPassed = true;
                    } else if (filters.text === '') {
                        textPassed = true;
                    }

                    if (filters.brew_methods.length !== 0 && this.processCafeBrewMethodsFilter(this.markers[i].getExtData().cafe, filters.brew_methods)) {
                        brewMethodsPassed = true;
                    } else if (filters.brew_methods.length === 0) {
                        brewMethodsPassed = true;
                    }

                    if (roasterPassed && textPassed && brewMethodsPassed) {
                        this.markers[i].setMap(this.map);
                    } else {
                        this.markers[i].setMap(null);
                    }
                }
            }
        },
    },
    watch: {
    // 一旦 cafes 有更新立即重构地图点标记
        cafes () {
            this.clearMarkers();
            this.buildMarkers();
        }
    }
  }
</script>
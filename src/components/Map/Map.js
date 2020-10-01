import $ from 'jquery';
import { Loader, LoaderOptions } from 'google-maps';

const Map1 = {
  settings: {
    target: '.map',
    mapa: '.map__section'
  },

  init(args) {
    this.settings = $.extend(true, this.settings, args);
    if ($(this.settings.target).length > 0) {
      this.catchDOM(this.settings);
      this.createMap();
    }
  },
  catchDOM(settings) {
    const target = $(settings.target);
    this.$target = {
      root: target,
      form: target.find(settings.mapa)
    };
  },
  createMap() {
    const options = { libraries: ['places', 'directions'] };
    const loader = new Loader(
      'AIzaSyB2QMtNLSZeRvzwLz-B6x-4Fbtd9REkDmg',
      options
    );
    loader.load().then(function(google) {
      const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 53.7833, lng: 20.5 },
        zoom: 8
      });
      const contentString =
        '<div class="map__content">' +
        '<div class="map__info">' +
        '</div>' +
        '<h1 class="map__titleInfo">Soft-Fusion</h1>' +
        '<p> informacja o miejscu</p>' +
        '</div>';

      const infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      const marker = new google.maps.Marker({
        position: { lat: 53.7638, lng: 20.5207 },
        map: map,
        draggable: true,
        animation: google.maps.Animation.BOUNCE,
        icon: './assets/images/Map/soft.png',
        title: 'first marker'
      });
      marker.addListener('click', () => {
        infowindow.open(map, marker);
      });
      const marker2 = new google.maps.Marker({
        position: { lat: 53.711, lng: 20.433 },
        map: map,
        icon: './assets/images/Map/marker.png',
        title: 'second marker'
      });
      const input = $('.map__search');
      const searchBox = new google.maps.places.SearchBox(input[0]);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input[0]);
      map.addListener('bounds_changed', () => {
        searchBox.setBounds(map.getBounds());
      });
      let markers = [];
      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }
        markers.forEach(marker => {
          marker.setMap(null);
        });
        markers = [];
        const bounds = new google.maps.LatLngBounds();
        places.forEach(place => {
          if (!place.geometry) {
            console.log('Returned place contains no geometry');
            return;
          }
          const icon = {
            url: './assets/images/Map/null.png',
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(40, 40)
          };
          markers.push(
            new google.maps.Marker({
              map,
              icon,
              title: place.name,
              position: place.geometry.location
            })
          );
          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        map.fitBounds(bounds);
        let directionsRenderer = new google.maps.DirectionsRenderer();
        let directionsService = new google.maps.DirectionsService();
        directionsRenderer.setMap(map);
        const selectedMode = 'DRIVING';
        directionsService.route(
          {
            origin: markers[0].position,
            destination: { lat: 53.744, lng: 20.4564 },
            travelMode: google.maps.TravelMode[selectedMode]
          },
          (response, status) => {
            if (status == 'OK') {
              response.request.origin.img = './assets/images/Map/marker.png';
              directionsRenderer.setDirections(response);
            } else {
              window.alert('Directions request failed due to ' + status);
            }
          }
        );
      });
    });
  }
};

export default Map1;

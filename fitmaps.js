;(function(window, undefined) {

  'use strict';
  var document = window.document;

  var fitmap = function (target, options) {
    console.log(target);
    console.log(options);

    options = options || {};

    this.target = target || options.target || null;
    this.options = options;
    this.mapUrl;
    this.wrapper;
    this.mapContainer = '.map-container';

    this.init();

    return this;
  };

  fitmap.prototype = {

    init: function() {
      var options = this.options;
      var coordinates = options.coord;
      var latlong;
      var div = document.createElement('div');

      if (!coordinates.latitude || !coordinates.longitude) { return; }

      latlong = coordinates.latitude + ',' + coordinates.longitude;
      div.classList.add('fitmap-wrapper');
      this.wrapper = div;

      var isValidLatLong = (function(coord) {
        return /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/.test(coord);
      })(latlong);

      if (!isValidLatLong) { return; }

      this.setMapUrl(latlong, options.zoom || '12');

      if (this.mapUrl && this.mapUrl.length > 0) {
        this.renderMap(this.mapUrl);
      }
    },

    setMapUrl: function(val, zoom) {
      var rootMapUrl = 'https://www.google.com/maps?f=q&amp;source=s_q&amp;hl=en&amp;q=@{0}&amp;z={1}&amp;iwloc=A&amp;output=embed';

      this.mapUrl = rootMapUrl.replace('{0}', val).replace('{1}', zoom);

      return this;
    },

    renderMap: function(url) {

      var appendStyles = (function() {
        if(!document.getElementById('fit-vids-style')) {
          var head = document.head || document.getElementsByTagName('head')[0];
          var css = '.fitmap-wrapper{width:100%;position:relative;padding:0;}.fitmap-wrapper iframe,.fitmap-wrapper,.fitmap-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';

          var div = document.createElement("div");
          div.innerHTML = '<p>x</p><style id="fitmaps-style">' + css + '</style>';
          head.appendChild(div.childNodes[1]);
        }
      })();
      this.wrapper.innerHTML = '<iframe width="980" height="650" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="' + url + '"></iframe>'
      this.target.appendChild(this.wrapper);
    }

  };

  window.fitmap = fitmap;

})(this);
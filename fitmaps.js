;(function() {

'use strict';

var hasEventListeners = !!window.addEventListener;
var document = window.document;

var addEvent = function(el, evt, callback, capture) {
  if (hasEventListeners) {
    el.addEventListener(evt, callback, !!capture);
  }
  else {
    el.attachEvent('on' + e, callback);
  }
};

var removeEvent = function(el, evt, callback, capture) {
  if (hasEventListeners) {
    el.removeEventListener(evt, callback, !!capture);
  }
  else {
    el.detachEvent('on' + evt, callback);
  }
};

var fireEvent = function(el, eventName, data) {
  var ev;

  if (document.createEvent) {
    ev = document.createEvent('HTMLEvents');
    ev.initEvent(eventName, true, false);
    ev = extend(ev, data);
    el.dispatchEvent(ev);
  }
  else if (document.createEventObject) {
    ev = document.createEventObject();
    ev = extend(ev, data);
    el.fireEvent('on' + eventName, ev);
  }
};

var hasClass = function(el, className) {
  return (' ' + el.className + ' ').indexOf(' ' + className + ' ') !== -1;
};

var addClass = function(el, className) {
  if (!hasClass(el, className)) {
    el.className = (el.className === '') ? className : el.className + ' ' + className;
  }
};

var removeClass = function(el, className) {
  el.className = trim((' ' + el.className + ' ').replace(' ' + className + ' ', ' '));
};

var isArray = function(obj) {
  return (/Array/).test(Object.prototype.toString.call(obj));
};

var extend = function(to, from, overwrite) {
  var prop, hasProp;
  for (prop in from) {
    hasProp = to[prop] !== undefined;
    if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
        if (isArray(from[prop])) {
            if (overwrite) {
                to[prop] = from[prop].slice(0);
            }
        } else {
            to[prop] = extend({}, from[prop], overwrite);
        }
    } else if (overwrite || !hasProp) {
        to[prop] = from[prop];
    }
  }
  return to;
};

var defaults = {
  target: '.map',
  wrapperClass: '.fitmap-wrapper',
  mapUrl: 'https://www.google.com/maps?f=q&amp;source=s_q&amp;hl=en&amp;q=@{0}&amp;z={1}&amp;iwloc=A&amp;output=embed',
  coord: {
    latitude: 0,
    longitude: 0
  },
  zoom: 12,
  appendStyles: true
};

var renderStyles = function(selector) {
  if(!document.getElementById('fit-vids-style')) {
    var head = document.head || document.getElementsByTagName('head')[0];
    var css = '.{$SEL$}{width:100%;position:relative;padding:0;}.{$SEL$} iframe,{$SEL$},.{$SEL$} embed {position:absolute;top:0;left:0;width:100%;height:100%;}'.replace('$SEL$', selector);
    var div = document.createElement("div");

    div.innerHTML = '<p>x</p><style id="fitmaps-style">' + css + '</style>';

    head.appendChild(div.childNodes[1]);
  }
};

var renderMap = function(url, opts, dest) {
  var div = document.createElement('div');

  div.classList.add(opts.wrapper);
  div.innerHTML = '<iframe width="980" height="650" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="$URL$"></iframe>'.replace('$URL$', url);

  dest.appendChild(div);
};

var isValidLatitudeLongitude = function(lat, lng) {
  var latlong = lat + ',' + lng;
  return /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/.test(latlong);
};

var FitMap = function (options) {
  var self = this;
  var opts = this.configure(options);
};

FitMap.prototype = {

  configure: function(options) {
    if (!this._o) {
      this._o = extend({}, defaults, true);
    }

    var opts = extend(this._o, options, true);

    return opts;
  },

  render: function(target) {
    var opts = this._o;
    var coords = opts.coord;
    var dest = target || opts.target;
    var clientWidth = document.body.clientWidth;

    if (!coords || (!coords.latitude || !coords.longitude))
      return;

    if (!isValidLatitudeLongitude(coords.latitude, coords.longitude))
      return;

    renderMap(this.getMapUrl(), opts, dest);

    if (opts.renderStyles)
      renderStyles(opts.wrapperClass);
  },

  setMapUrl: function(url) {
    this._o.mapUrl = url;
  },

  getMapUrl: function() {
    var opts = this._o;
    var coords = opts.coord;
    var latlng = coords.latitude + ',' + coords.longitude;

    return opts.mapUrl.replace('{0}', latlng).replace('{1}', opts.zoom);
  }

};

if (typeof window !== 'undefined') {
  window.FitMap = FitMap;
}

if (typeof exports === 'object') {
  module.exports = FitMap;
}

return FitMap;

}());
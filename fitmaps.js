( function() {

'use strict';

var hasEventListeners = !!window.addEventListener;
var document = window.document;
var clientWidth = document.body ? document.body.clientWidth : null;

/**
 * [messages description]
 *
 * @type {Object}
 */
var messages = {
  invalidTarget: ' is not a DOM node or is not a valid selector that results in a DOM node',
  notEnoughData: 'You did not provide enough location data to render a map'
};

/**
 * [addEvent description]
 *
 * @param {[type]}   el       [description]
 * @param {[type]}   evt      [description]
 * @param {Function} callback [description]
 * @param {[type]}   capture  [description]
 */
var addEvent = function( el, evt, callback, capture ) {
  if ( hasEventListeners ) {
    el.addEventListener( evt, callback, !!capture );
  } else {
    el.attachEvent( 'on' + e, callback );
  }
};

/**
 * [removeEvent description]
 *
 * @param {[type]}   el       [description]
 * @param {[type]}   evt      [description]
 * @param {Function} callback [description]
 * @param {[type]}   capture  [description]
 *
 * @return {[type]}
 */
var removeEvent = function( el, evt, callback, capture ) {
  if ( hasEventListeners ) {
    el.removeEventListener( evt, callback, !!capture );
  } else {
    el.detachEvent( 'on' + evt, callback );
  }
};

/**
 * [fireEvent description]
 *
 * @param {[type]} el        [description]
 * @param {[type]} eventName [description]
 * @param {[type]} data      [description]
 *
 * @return {[type]}
 */
var fireEvent = function( el, eventName, data ) {
  var ev;

  if ( document.createEvent ) {
    ev = document.createEvent( 'HTMLEvents' );
    ev.initEvent( eventName, true, false );
    ev = extend( ev, data );
    el.dispatchEvent( ev );
  } else if ( document.createEventObject ) {
    ev = document.createEventObject();
    ev = extend( ev, data );
    el.fireEvent( 'on' + eventName, ev );
  }
};

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @param {[type]} func      [description]
 * @param {[type]} wait      [description]
 * @param {[type]} immediate [description]
 *
 * @return {[type]}
 * @credit http://davidwalsh.name/javascript-debounce-function
 */
var debounce = function( func, wait, immediate ) {
  var timeout;
  return function() {
    var context = this;
    var args = arguments;
    var callNow;

    var later = function() {
      timeout = null;
      if ( !immediate ) {
        func.apply( context, args );
      }
    };

    callNow = immediate && !timeout;
    clearTimeout( timeout );
    timeout = setTimeout( later, wait );
    if ( callNow ) {
      func.apply( context, args );
    }
  };
};

/**
 * [hasClass description]
 *
 * @param {[type]} el        [description]
 * @param {[type]} className [description]
 *
 * @return {Boolean}
 */
var hasClass = function( el, className ) {
  return ( ' ' + el.className + ' ' ).indexOf( ' ' + className + ' ' ) !== -1;
};

/**
 * [addClass description]
 *
 * @param {[type]} el        [description]
 * @param {[type]} className [description]
 */
var addClass = function( el, className ) {
  if ( !hasClass( el, className ) ) {
    el.className = ( el.className === '' ) ? className : el.className + ' ' + className;
  }
};

/**
 * [removeClass description]
 *
 * @param {[type]} el        [description]
 * @param {[type]} className [description]
 *
 * @return {[type]}
 */
var removeClass = function( el, className ) {
  el.className = trim( ( ' ' + el.className + ' ' ).replace( ' ' + className + ' ', ' ' ) );
};

/**
 * [isArray description]
 * check native isArray first
 * @param {[type]} obj [description]
 *
 * @return {Boolean}
 */
var isArray = Array.isArray || function( value ) {
    return toString.call( value ) === '[object Array]';
};

/**
 * [isObject description]
 *
 * @param {[type]} obj [description]
 *
 * @return {Boolean}
 */
var isObject = function( obj ) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
};

/**
 * [isNumber description]
 *
 * @param {[type]} obj [description]
 *
 * @return {Boolean}
 */
var isNumber = function( obj ) {
  return !isArray( obj ) && ( obj - parseFloat( obj ) + 1 ) >= 0;
};

/**
 * [isDomNode description]
 *
 * @param {[type]} obj [description]
 *
 * @return {Boolean}
 */
var isDomNode = function( obj ) {
  return isObject( obj ) && obj.nodeType > 0;
};

/**
 * [isValidLatitudeLongitude description]
 *
 * @param {[type]} lat [description]
 * @param {[type]} lng [description]
 *
 * @return {Boolean}
 */
var isValidLatitudeLongitude = function( lat, lng ) {
  return /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/.test( lat + ',' + lng );
};

/**
 * [stripUnit description]
 *
 * @param {[type]} val [description]
 *
 * @return {[type]}
 */
var stripUnit = function( val ) {
  return parseFloat( val );
};

/**
 * [extend description]
 *
 * @param {[type]} to        [description]
 * @param {[type]} from      [description]
 * @param {[type]} overwrite [description]
 *
 * @return {[type]}
 */
var extend = function( obj, newObj ) {
  var name;

  if ( obj === newObj ) {
    return obj;
  }

  for ( name in newObj ) {
    obj[name] = newObj[name];
  }

  return obj;
};

function geocodeAddress() {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode( { 'address': address }, function( results, status ) {
    if ( status == google.maps.GeocoderStatus.OK ) {
      map.setCenter( results[0].geometry.location );
      var marker = new google.maps.Marker( {
        map: map,
        position: results[0].geometry.location
      } );
    }
  } );
}

/**
 * [defaults description]
 *
 * @type {Object}
 */
var defaults = {
  target: '.map',
  wrapperClass: 'fitmap-container',
  mapLinkClass: 'fitmap-link',
  staticImgClass: 'fitmap-static',
  mapUrl: null,
  address: null,
  lat: null,
  lng: null,
  mapType: 'm',
  label: null,
  size: [ 980, 560 ],
  zoom: 12,
  lang: 'en',
  includeStyles: true,
  breakpoint: 550,
  onRender: null
};

/**
 * [formatAddress description]
 *
 * @param {[type]} addr [description]
 *
 * @return {[type]}
 */
var formatAddress = function( addr ) {
  var address = '';

  if ( addr.street ) {
    address = addr.street;
  }

  if ( addr.city ) {
    address = address + ', ' + addr.city;
  }

  if ( addr.state ) {
    address = address + ', ' + addr.state;
  }

  if ( addr.postalCode ) {
    address = address + ', ' + addr.postalCode
  }

  return address.replace( / /g, '+' );
};

/**
 * [formatCoordinates description]
 *
 * @param {[type]} coordinates [description]
 *
 * @return {[type]}
 */
var formatCoordinates = function( coordinates ) {
  return coordinates.latitude + ',' + coordinates.longitude;
};

/**
 * [renderStyles description]
 *
 * @param {[type]} selector [description]
 *
 * @return {[type]}
 */
var renderStyles = function( opts ) {
  var head = document.head || document.getElementsByTagName( 'head' )[0];
  var css = 'iframe {max-width:100%;}' +
            '.' + opts.staticImgClass + ' {display:block;height:auto;max-width:100%;' +
            '.__SEL__ {width:100%;margin:0 auto;height:0;padding:0;padding-top:38%;position:relative;} ' +
            '.__SEL__ iframe, .__SEL__ embed ' +
            '{position:absolute;bottom:0;left:0;right:0;top:0;width:100%;height:100%;}';

  css = css.split( '__SEL__' ).join( opts.wrapperClass );
  var div = document.createElement( 'div' );

  div.innerHTML = '<p>x</p><style id="fitmap-style">' + css + '</style>';

  head.appendChild( div.childNodes[1] );
};

/**
 * [renderFrame description]
 *
 * @param {[type]} url  [description]
 * @param {[type]} opts [description]
 *
 * @return {[type]}
 */
var renderFrame = function( opts ) {
  var attr = [];
  var iframeEl;
  var iframeStart = '<iframe frameborder="0" scrolling="no" marginheight="0" marginwidth="0"';
  var iframeEnd = '></iframe>';

  if ( opts.size && opts.size.length > 0 ) {
    attr.push( 'width=' + opts.size[0] );
    attr.push( 'height=' + opts.size[1] );
  }

  attr.push( 'src=' + opts.mapUrl );

  return iframeStart + attr.join( ' ' ) + iframeEnd;
};

/**
 * [renderStaticMapUrl description]
 *
 * @param {[type]} opts [description]
 *
 * @return {[type]}
 */
var renderStaticMapUrl = function( options ) {
  var opts = options;
  var parameters = [];
  var data;
  var staticRoot = ( location.protocol === 'file:' ? 'http:' : location.protocol ) + '//maps.googleapis.com/maps/api/staticmap';

  // if ( opts.mapUrl ) {
  //   staticRoot = opts.mapUrl;
  // }

  staticRoot += '?';

  var markers = opts.markers;
  delete opts.markers;

  if ( !markers && opts.marker ) {
    markers = [ opts.marker ];
    delete opts.marker;
  }

  if ( opts.center ) {
    parameters.push( 'center=' + opts.center );
    delete opts.center;
  } else if ( opts.address ) {
    parameters.push( 'center=' + opts.address );
    delete opts.address;
  } else if ( opts.lat ) {
    parameters.push( [ 'center=', opts.lat, ',', opts.lng ].join( '' ) );
    delete opts.lat;
    delete opts.lng;
  }

  var size = opts.size;

  if ( size ) {
    if ( size.join ) {
      size = size.join( 'x' );
    }
    delete opts.size;
  } else {
    size = '630x300';
  }

  parameters.push( 'size=' + size );

  if ( opts.zoom && opts.zoom !== false ) {
    parameters.push( 'zoom=' + opts.zoom );
  }

  var sensor = opts.hasOwnProperty( 'sensor' ) ? !!opts.sensor : true;
  delete opts.sensor;
  parameters.push( 'sensor=' + sensor );

  if ( markers ) {
    var marker;
    var loc;

    for ( var i = 0; data = markers[i]; i++ ) {
      marker = [];

      if ( data.size && data.size !== 'normal' ) {
        marker.push( 'size:' + data.size );
        delete data.size;
      } else if ( data.icon ) {
        marker.push ( 'icon:' + encodeURI( data.icon ) );
        delete data.icon;
      }

      if ( data.color ) {
        marker.push( 'color:' + data.color.replace( '#', '0x' ) );
        delete data.color;
      }

      if ( data.label ) {
        marker.push( 'label:' + data.label[0].toUpperCase() );
        delete data.label;
      }

      loc = ( data.address ? data.address : data.lat + ',' + data.lng );
      delete data.address;
      delete data.lat;
      delete data.lng;

      for ( var param in data ) {
        if ( data.hasOwnProperty( param ) ) {
          marker.push( param + ':' + data[param] );
        }
      }

      if ( marker.length || i === 0 ) {
        marker.push( loc );
        marker = marker.join( '|' );
        parameters.push( 'markers=' + encodeURI( marker ) );
      } else {
        marker = parameters.pop() + encodeURI( '|' + loc );
        parameters.push( marker );
      }
    }
  }

  var dpi = window.devicePixelRatio || 1;
  parameters.push( 'scale=' + dpi );

  parameters = parameters.join( '&' );
  return staticRoot + parameters;
};

/**
 * [renderMapUrl description]
 *
 * @param {[type]} opts [description]
 *
 * @return {[type]}
 *
 * @example https://maps.google.com/?q={name of the place you want to
 * query}&ll={latitude},{longtitude}&t={map type}&z={zoom level}
 */
var renderEmbeddedMapUrl = function( opts ) {
  var urlRoot;
  var params = [];
  var loc = null;
  var latlng = null;
  var label = null;

  if ( opts.apiKey ) {
    urlRoot = '//www.google.com/maps/embed/v1/place';
  } else {
    urlRoot = '//maps.google.com/maps';
  }

  urlRoot += '?';

  if ( opts.address ) {
    loc = opts.address;
  } else if ( opts.lat ) {
    loc = opts.lat + ',' + opts.lng;
  }

  if ( loc === null ) {
    return null;
  }

  if ( opts.label ) {
    loc += '+(' + opts.label.replace( / /g, '+' ) + ')';
  }

  params.push( 'q=' + loc );

  if ( opts.lang ) {
    params.push( 'hl=' + opts.lang );
  }

  if ( opts.zoom  && opts.zoom !== false ) {
    params.push( 'zoom=' + opts.zoom );
  }

  if ( opts.mapType ) {
    params.push( 'type=' + opts.mapType );
  }

  if ( !opts.apiKey ) {
    params.push( 'output=embed' );
  }

  params = params.join( '&' );
  return urlRoot + params;

};

/**
 * [renderMap description]
 *
 * @param {[type]} opts [description]
 * @param {[type]} dest [description]
 *
 * @return {[type]}
 */
var renderEmbeddedMap = function( opts ) {
  var dest = isDomNode( opts.target ) ? opts.target : document.querySelector( opts.target );
  var mapHtml;

  if ( !isDomNode( dest ) ) {
    window.console && console.log( dest + messages.invalidTarget );
    return;
  }

  mapHtml = '<div class="' + opts.wrapperClass + '">';
  mapHtml += renderFrame( opts );
  mapHtml += '</div>';

  dest.innerHTML = mapHtml;
};

/**
 * [renderStaticMap description]
 *
 * @param {[type]} opts [description]
 *
 * @return {[type]}
 */
var renderStaticMap = function( options ) {
  var opts = extend( {}, options );
  var dest = isDomNode( opts.target ) ? opts.target : document.querySelector( opts.target );
  var mapHtml;
  var mapUrl;

  if ( !isDomNode( dest ) ) {
    window.console && console.log( dest + messages.invalidTarget );
    return;
  }

  mapUrl = renderStaticMapUrl( opts );

  mapHtml = '<a class="' + opts.mapLinkClass + '" href="' + mapUrl + '">';
  mapHtml += '<img class="' + opts.staticImgClass + '" ';
  mapHtml += 'src="' + mapUrl + '" />';
  mapHtml += '</a>';

  dest.innerHTML = mapHtml;
};

/**
 * [FitMap description]
 *
 * @param {[type]} options [description]
 */
var FitMap = function( options ) {
  var self = this;
  this._options = this.configure( options );
  this.bindResize();
};

/**
 * [prototype description]
 *
 * @type {Object}
 */
FitMap.prototype = {

  /**
   * [configure description]
   *
   * @param {[type]} options [description]
   *
   * @return {[type]}
   */
  configure: function( options ) {
    var opts;

    if ( !this._options ) {
      opts = extend( defaults, options );
    }

    if ( !opts.address || ( !opts.lat && !opts.lng ) ) {
      window.console && console.log( messages.notEnoughData );
      return;
    }

    //opts = extend( this._options, options, true );

    opts.address = opts.address ? formatAddress( opts.address ) : null;
    opts.size = opts.size || defaults.size;
    opts.zoom = isNumber( opts.zoom ) ? opts.zoom : defaults.zoom;
    opts.lat = opts.lat || defaults.lat;
    opts.lng = opts.lng || defaults.lng;
    opts.mapUrl = opts.mapUrl ? opts.mapUrl : renderEmbeddedMapUrl( opts );
    opts.breakpoint = isNumber( opts.breakpoint ) ? opts.breakpoint : defaults.breakpoint;

    return opts;
  },

  /**
   * [bindResize description]
   *
   * @return {[type]}
   */
  bindResize: function() {
    var self = this;

    var throttledResize = debounce( function() {
      clientWidth = document.body.clientWidth;
      self.render();
    }, 250 );

    addEvent( window, 'resize', throttledResize );
  },

  /**
   * [render description]
   *
   * @param {[type]} target [description]
   *
   * @return {[type]}
   */
  render: function( target ) {
    var opts = this._options;
    var mapWrapper = document.querySelector( opts.wrapperClass );
    var mapLink = document.querySelector( opts.mapLink );

    opts.target = target || opts.target;

    clientWidth = clientWidth || document.body.clientWidth;

    if ( clientWidth > opts.breakpoint ) {
      if ( !mapWrapper ) {
        renderEmbeddedMap( opts );
      }
    } else {
      if ( !mapLink ) {
        renderStaticMap( opts );
      }
    }

    if ( opts.includeStyles && !document.getElementById( 'fitmap-style' ) ) {
      renderStyles( opts );
    }

    opts.onRender && opts.onRender();
  },

  /**
   * [setMapUrl description]
   *
   * @param {[type]} url [description]
   */
  setMapUrl: function( url ) {
    this._options.mapUrl = url;
  },

  /**
   * [getMapUrl description]
   *
   * @return {[type]}
   */
  getMapUrl: function() {
    return this._options.mapUrl;
  }

};

if ( typeof window !== 'undefined' ) {
  window.FitMap = FitMap;
}

if ( typeof exports === 'object' ) {
  module.exports = FitMap;
}

return FitMap;

}() );

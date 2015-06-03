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
var extend = function( to, from, overwrite ) {
  var prop, hasProp;
  for ( prop in from ) {
    hasProp = to[prop] !== undefined;
    if ( hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined ) {
        if ( isArray( from[prop] ) ) {
          if ( overwrite ) {
              to[prop] = from[prop].slice( 0 );
          }
        } else {
            to[prop] = extend( {}, from[prop], overwrite );
        }
    } else if ( overwrite || !hasProp ) {
        to[prop] = from[prop];
    }
  }
  return to;
};

/**
 * [defaults description]
 *
 * @type {Object}
 */
var defaults = {
  target: '.map',
  wrapperClass: '.fitmap-embed',
  staticWrapperClass: '.fitmap-static',
  mapUrl: null,
  mapType: 'm', // normal (k - satellite, h - hybrid, p - terrain)
  coord: null,
  address: null,
  label: '',
  width: 980,
  height: 560,
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
  var css = '.{$SEL$}{width:100%;position:relative;padding:0;}.{$SEL$}' +
            ' iframe,{$SEL$},.{$SEL$} embed {position:absolute;top:0;' +
            'left:0;width:100%;height:100%;}'.replace( '$SEL$', opts.wrapperClass );
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
  var iframe = '<iframe width="' + opts.width + '" height="' + opts.height +
    '" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"' +
    ' src="' +   opts.mapUrl + '"></iframe>';

  return iframe;
};

/**
 * [renderStaticMapUrl description]
 *
 * @param {[type]} opts [description]
 *
 * @return {[type]}
 */
var renderStaticMapUrl = function( opts ) {
  return 'http://maps.google.com/maps/api/staticmap?center=00,-00,17z&zoom=13&markers=00,-00&size=640x320&sensor=true';
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
  var embedUrl;
  var address = null;
  var latlng = null;
  var label = null;

  if ( !opts.address && !opts.coord ) {
    window.console && console.log( messages.notEnoughData );
    return;
  }

  if ( opts.apiKey ) {
    embedUrl = 'https://www.google.com/maps/embed/v1/place?q=$LOC$';
  } else {
    embedUrl = '//maps.google.com/maps?q=$LOC$&amp;hl=$LANG$&amp;' +
              't=$TYPE$&amp;z=$ZOOM$&amp;Iwloc=A&amp;iwd=1&amp;' +
              'll=$LATLONG$&amp;output=embed';
  }

  if ( opts.address ) {
    address = opts.address;
  }
  if ( opts.coord ) {
    latlng = formatCoordinates( opts.coord, opts.label );
  }

  if ( opts.label ) {
    label = '(' + opts.label.replace( / /g, '+' ) + ')';
  }

  return embedUrl
          .replace( '$LOC$', ( label ? label : '' ) + ( address || 'loc:' + latlng ) )
          .replace( '$LANG$', opts.lang )
          .replace( '$TYPE$', opts.mapType )
          .replace( '$ZOOM$', opts.zoom )
          .replace( '$LATLONG$', latlng || '' );

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
var renderStaticMap = function( opts ) {
  var dest = isDomNode( opts.target ) ? opts.target : document.querySelector( opts.target );
  var mapHtml;

  if ( !isDomNode( dest ) ) {
    window.console && console.log( dest + messages.invalidTarget );
    return;
  }

  mapHtml = '<div class="' + opts.staticWrapperClass + '">';
  mapHtml += '<img src="' + renderStaticMapUrl( opts ) + '" />';
  mapHtml += '</div>';

  dest.innerHTML = mapHtml;
};

/**
 * [FitMap description]
 *
 * @param {[type]} options [description]
 */
var FitMap = function( options ) {
  var self = this;
  var opts = this.configure( options );

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
    if ( !this._options ) {
      this._options = extend( {}, defaults, true );
    }

    var opts = extend( this._options, options, true );

    opts.address = opts.address ? formatAddress( opts.address ) : null;

    opts.height = isNumber( opts.height ) ? opts.height : isNumber( stripUnit( opts.height ) ) ? stripUnit( opts.height ) : defaults.height;

    opts.width = isNumber( opts.width ) ? opts.width : isNumber( stripUnit( opts.width ) ) ? stripUnit( opts.width ) : defaults.width;

    opts.zoom = isNumber( opts.zoom ) ? opts.zoom : defaults.zoom;

    if ( isObject( opts.coord ) ) {

      opts.coord.latitude = isNumber( opts.coord.latitude ) ? opts.coord.latitude : null;

      opts.coord.longitude = isNumber( opts.coord.longitude ) ? opts.coord.longitude : null;
    }

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
    var coords = opts.coord;
    var mapWrapper = document.querySelector( opts.wrapperClass );
    var staticMapWrapper = document.querySelector( opts.staticWrapperClass );

    opts.target = target || opts.target;

    clientWidth = clientWidth || document.body.clientWidth;

    if ( !opts.address && !opts.coord ) {
      window.console && console.log( messages.notEnoughData );
      return;
    }

    if ( clientWidth > opts.breakpoint ) {
      if ( !mapWrapper ) {
        renderEmbeddedMap( opts );
      }
    } else {
      if ( !staticMapWrapper ) {
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

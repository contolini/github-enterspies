var Promise = require('es6-promise').Promise,
    get = require('browser-get'),
    GHE = {};

// Scrape a totally random GHE page to determine if they're using GHE.
var _init = get('/settings/repositories');

// If the scrape is successful, save the user's credentials.
_init.then(function( html ) {
  GHE.credentials = {
    username: html.match(/a href="\/(.+)" class="name">/)[1],
    csrf: html.match(/meta content="(.+=)" name="csrf\-token"/)[1]
  };
});

// GHE user account methods.
GHE.user = (function(){

  // Helper function to set user info.
  function _set( slug, value, cb ) {
    if ( !value ) {
      throw new Error('You must provide a new ' + slug + '.');
    }
    var data = {
          _method: 'put'
        };
    data['user[' + slug + ']'] = value;
    return _post( 'user', data, null, cb );
  }

  // Public user account methods.
  return {

    // Change the user's profile name.
    setName: function( newName, cb ) {
      return _set( 'profile_name', newName, cb );
    },

    // Change the user's profile email.
    setEmail: function( newEmail, cb ) {
      return _set( 'profile_email', newEmail, cb );
    },

    // Change the user's location.
    setLocation: function( newLocation, cb ) {
      return _set( 'profile_location', newLocation, cb );
    },

    // Change the user's website.
    setWebsite: function( newWebsite, cb ) {
      return _set( 'profile_blog', newWebsite, cb );
    },

    // Change the user's Gravatar email.
    setGravatar: function( newGravatar, cb ) {
      return _set( 'gravatar_email', newGravatar, cb );
    },

    // Redirect user to their GHE profile page.
    goToProfile: function() {
      _init.then(function() {
        window.location.replace( '/' + GHE.credentials.username );
      });
    }

  };

}());

// Repository methods
GHE.repo = function( loc ) {

  if ( !loc ) {
    throw new Error('You must provide the location of a repo in the format `/username/repo-name`.');
  }

  // Public user methods
  return {

    // Create issue
    createIssue: function( opts, cb ) {
      opts = opts || {};
      if ( !opts.title ) {
        throw new Error('You must provide a title for the issue.');
      }
      var data = {};
      data['issue[title]'] = opts.title;
      data['issue[body]'] = opts.body;
      return _post( 'issue', data, loc, cb );
    },

    // Post a comment to an issue
    postComment: function( opts, cb ) {
      opts = opts || {};
      if ( !opts.body ) {
        throw new Error('You must provide content for the issue.');
      }
      var data = {};
      data['issue'] = opts.issueNum;
      data['comment[body]'] = opts.body;
      return _post( 'comment', data, loc, cb );
    },

  };

};

// Get the CSRF token if that's all they want.
GHE.fetchToken = function( cb ) {
  return new Promise(function( resolve ) {
    _init.then(function( html ){
      if ( typeof cb === 'function' ) cb( GHE.credentials.csrf );
      resolve( GHE.credentials.csrf );
    });
  });
};

function _toQueryString( obj ) {
  var parts = [];
  for ( var i in obj ) {
    if ( obj.hasOwnProperty( i ) ) {
      parts.push( encodeURIComponent(i) + '=' + encodeURIComponent( obj[i] ) );
    }
  }
  return parts.join("&");
}

// Internal helper function to post to GHE with relevant data.
function _post( endpoint, data, location, cb ) {

  GHE.target = {
    endpoint: endpoint,
    location: location
  };

  return new Promise(function( resolve, reject ) {

    // We can't do anything until we have the user's CSRF token,
    // so we wait until the original scraping is complete.
    _init.then(function() {

      var endpoints = {
            user: '/users/' + GHE.credentials.username,
            issue: '/' + GHE.target.location + '/issues',
            comment: '/' + GHE.target.location + '/issue_comments'
          },
          endpoint = endpoints[ GHE.target.endpoint ],
          request = new XMLHttpRequest();

      data.authenticity_token = GHE.credentials.csrf;

      request.open( 'POST', endpoint, true );
      request.onreadystatechange = function() {
        if ( this.readyState === 4 ){
          if ( this.status >= 200 && this.status < 400 ) {
            if ( cb ) cb( this.responseText );
            resolve( this.responseText );
          } else {
            reject();
          }
        }
      };
      request.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8' );
      request.setRequestHeader( 'X-CSRF-Token', GHE.credentials.csrf );
      request.send( _toQueryString(data) );

    }, function( resp ) {
      reject( 'Unable to fetch CSRF token. Is this a GHE installation?', resp.message );
    });

  });

}

module.exports = GHE;
var listScroll;
var nLoadedImages = 0;
var preloadTimer;
var preloadImages = [ 
    "img/logo.png",    
    "img/marker-you.png",    
    "img/menu-icons.png",    
];

function checkSize() {
    // we are in landscape mode
    w = $(window).width();
    h = $(window).height();
    hh = $('header').height();
    sw = $('#main').width();

    if($('.landscape:visible').length) {
        $('.container').width(w-40);
        $('#main,#map').height(h-hh-5);
        $('#map').width(w-sw-1);
    } else { // portrait mode
        $('.container').width(w-20);
        $('#main,#map').height(h-hh-5-180);
        $('#map').width(w);
    }

    if(map) map.checkResize();
}

window.onresize = checkSize;


$(window).ready(function() {
    // resize elements if needed
    checkSize();

    // add inline scroll to vehicle list
    listScroll = new iScroll('main', { hScrollbar: false, hScroll: false, snap: false });

    // expand list items
    $('#main').on('click', '.row .header', function() {
        var e = $(this).parent();
        if(e.hasClass('active')) {
            // collapse data for selected vehicle
            e.removeClass('active');
            e.find('.data').hide();

            listScroll.refresh();
        } else {
            // expand data for selected vehicle
            e.addClass('active');
            e.find('.data').show();

            listScroll.refresh();
            
            // auto scroll when expanding an item
            var eName = "." + e.parent().attr('class') + " ." + e.attr('class').match(/vehicle\d+/)[0];
            listScroll.scrollToElement(eName);
            
            // pan to selected vehicle
            panTo(parseInt(e.attr('class').match(/vehicle(\d+)/)[1]));
        }
    });

    // We are able to get GPS position on idevices, if the user allows
    // The position is displayed in top right corner of the screen
    // This should be very handly for in the field tracking 
    //setTimeout(function() {updateCurrentPosition(50.27533, 3.335166);}, 5000);
    if(navigator.geolocation) {
        // if we have geolocation services, show the locate me button
        // the button pants the map to the user current location
        $("li.location").show().click(function() {
            if(map && currentPosition) {
                map.panTo(new GLatLng(currentPosition.lat, currentPosition.lon));    
            }      
        });

        // start polling for GPS data
        setInterval(function() {
            navigator.geolocation.getCurrentPosition(function(position) {
               var lat = position.coords.latitude;
               var long = position.coords.longitude;

               // add/update marker on the map
               updateCurrentPosition(lat, long);
                
               // round the coordinates
               lat = parseInt(lat * 1000000)/1000000;
               long = parseInt(long * 1000000)/1000000;

               // dispaly them in the top right corner
               $('#app_name b').html(lat + '<br/>' + long);
            }, 
            function() {
               // when there is no location
               $('#app_name b').html('mobile<br/>tracker');
            });
        }, 10000); // poll every 10sec;
    }

    // preload images
    var i = 0;
    for(i = 0; i < preloadImages.length; i++) {
        var image = new Image();
        image.onLoad = (function() { nLoadedImages++; })();
        image.src = preloadImages[i];
    }

    // check if images have loaded
    preloadTimer = setInterval(function() {
        if(nLoadedImages < preloadImages.length) return;
        clearInterval(preloadTimer);

        // app stars with a welcome screen
        // after images are loaded we can show the interface
        setTimeout(function() {
            $('#loading').hide(); // welcome screen
            $('header,#main,#map').show(); // interface elements
        }, 500);
    }, 100);
});
window.onload = function() {
  //Definitions
    const socket = io();
    var center = {
      x: 0,
      y: 0
    }
    var targeted = false;
    var ammo = 10;
    var hp = 3;
    
  //Scanner
    socket.on("connected", function(data) {
      if(data <= 1) {
        document.getElementById("player").innerHTML = "Player " + (data + 1);
      }
      else {
        document.getElementById("player").innerHTML = "Spectator";
      }
    });
    socket.on("health", function(data) {
      document.getElementById("health").innerHTML = data;
    });
    var color = {r:4, g:159, b:240};
    //var color = {r: 3, g: 144, b: 130};
    var tolerance = 125;
    var canvas  = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var webcam = document.getElementById('webcam');
    var vw = 980;
    var vh = 668;

    var clickTimer;

    // Register our custom color tracking function
    tracking.ColorTracker.registerColor('dynamic', function(r, g, b) {
      return getColorDistance(color, {r: r, g: g, b: b}) < tolerance;
    });

    // Create the color tracking object
    var tracker = new tracking.ColorTracker("dynamic");
    // Add callback for the "track" event
    tracker.on('track', function(e) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (e.data.length !== 0) {
        center.x = e.data[0].x + (e.data[0].width/2);
        center.y = e.data[0].y + (e.data[0].height/2);
      }
      else {
        center.x = -10;
        center.y = -10;
      }
    });

    // Start tracking
    tracking.track(webcam, tracker, { camera: true } );

    // Add listener for the click event on the video
    webcam.addEventListener("click", function (e) {

      // Grab color from the video feed where the click occured
      var c = getColorAt(webcam, e.offsetX, e.offsetY);

      // Update target color
      color.r = c.r;
      color.g = c.g;
      color.b = c.b;

    });

    // Calculates the Euclidian distance between the target color and the actual color
    function getColorDistance(target, actual) {
      return Math.sqrt(
        (target.r - actual.r) * (target.r - actual.r) +
        (target.g - actual.g) * (target.g - actual.g) +
        (target.b - actual.b) * (target.b - actual.b)
      );
    }

    // Returns the color at the specified x/y location in the webcam video feed
    function getColorAt(webcam, x, y) {
      // To be able to access pixel data from the webcam feed, we must first draw the current frame in
      // a temporary canvas.
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.width = webcam.width;
      canvas.height = webcam.height;
      context.drawImage(webcam, 0, 0, webcam.width, webcam.height);

      // Then we grab the pixel information from the temp canvas and return it as an object
      var pixel = context.getImageData(x, y, 1, 1).data;
      return {r: pixel[0], g: pixel[1], b: pixel[2]};
    }


  //Stuff that does things
    setInterval(function() {
      if(center.x > (vw*.9) && center.x < (vw*1.1) && center.y > (vh*0.9) && center.y < (vh*1.1)) {
        targeted = true;
        document.getElementById("chsvg").style.color = "red";
        //console.log("center: (" + center.x + "," + center.y + ")      window center: (" + vw + "," + vh + ")");
      }
      else {
        targeted = false;
        document.getElementById("chsvg").style.color = "black";
      }
    }, 1000/60);

  //Shooting
    $("body").click(function() {
      shoot();
    });
    $("body").on("tap", function() {
      shoot();
    });
    function shoot() {
      if(ammo > 0) {
        if(targeted == true) {
          socket.emit("shoot", function(score) {
            document.getElementById("score") = score;
          });
        }
        document.getElementById("webcam").style.display = "none";
        setTimeout(function() {
          document.getElementById("webcam").style.display = "block";
        }, 40);
        ammo--;
        document.getElementById("ammo").innerHTML = ammo;
      }
    }

    document.getElementById("body").addEventListener("mousedown", function() {
      clickTimer = setTimeout(function() {
        ammo = 10;
      }, 5000);
    });
    document.getElementById("body").addEventListener("mouseup", function() {
      clearTimeout(clickTimer);
    });
    document.getElementById("body").addEventListener("touchstart", function() {
      clickTimer = setTimeout(function() {
        ammo = 10;
      }, 5000);
    });
    document.getElementById("body").addEventListener("touchend", function() {
      clearTimeout(clickTimer);
    });
}

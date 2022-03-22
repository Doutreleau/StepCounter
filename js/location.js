const latitudes = [];
const longitudes = [];

// the next arrays will be used to convert the distance covered into the number of steps, according to the chart in https://www.thecalculatorsite.com/articles/units/how-many-steps-in-a-mile.php
const heights = [152.4, 154.94, 157.48, 160.02, 162.56, 165.1, 167.64, 170.18, 172.72, 175.26, 177.8, 180.34, 182.88, 185.42, 187.96, 190.5, 193.04]; //contains the heights in cm
const inverseSpeed= [20, 18, 16, 14, 12, 10, 8, 6]; //contains the "inverse of speed" in the chart in mins/mile
const stepsChart = [[2.371,2.244,2.117,1.991,1.997,1.710,1.423,1.136],
[2.357,2.230,2.103,1.977,1.984,1.697,1.409,1.122],
[2.343,2.216,2.089,1.962,1.970,1.683,1.396,1.109],
[2.329,2.202,2.075,1.948,1.957,1.670,1.382,1.095],
[2.282,2.155,2.028,1.901,1.943,1.656,1.369,1.082],
[2.268,2.141,2.014,1.887,1.930,1.643,1.355,1.068],
[2.253,2.127,2.000,1.873,1.916,1.629,1.342,1.055],
[2.239,2.113,1.986,1.859,1.903,1.616,1.328,1.041],
[2.225,2.098,1.972,1.845,1.889,1.602,1.315,1.028],
[2.211,2.084,1.958,1.831,1.876,1.589,1.301,1.014],
[2.197,2.070,1.943,1.817,1.862,1.575,1.288,1.001],
[2.183,2.056,1.929,1.803,1.849,1.562,1.274,987],
[2.169,2.042,1.915,1.788,1.835,1.548,1.261,974],
[2.155,2.028,1.901,1.774,1.822,1.535,1.247,960],
[2.141,2.014,1.887,1.760,1.808,1.521,1.234,947],
[2.127,2.000,1.873,1.746,1.795,1.508,1.220,933],
[2.112,1.986,1.859,1.732,1.781,1.494,1.207,920]]; // contains the number of steps depending on the height and the number of mins one takes to cover a mile

const result = document.getElementById("result");
 
locationTimer=null; //will contain the timer which will fetch the coordinates every 2 seconds
let beginning = new Date(); //stores the starting date of the session, useful when calculating the total duration of the session
    
function timerGetLocation(){
    locationTimer = setInterval(getLocation,2000); //gets coordinates every 2 seconds
    
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    result.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
    result.innerHTML += "<br><br>Latitude: " + position.coords.latitude + 
  "<br>Longitude: " + position.coords.longitude;
    latitudes[latitudes.length] = position.coords.latitude;
    longitudes[longitudes.length] = position.coords.longitude;
}

function stopGetLocation(){
	clearInterval(locationTimer);    
    let end = new Date(); //stores the date of the end of the session, useful when calculating the total duration of the session
    let durationInMilliseconds = end - beginning;
    let durationHours = Math.floor(durationInMilliseconds/3600000)
    let durationMin = Math.floor((durationInMilliseconds-durationHours*3600000)/60000);
    let durationSec = Math.floor((durationInMilliseconds-durationMin*60000-durationHours*3600000)/1000);
    
    dist=Math.round(totalDistance()); //dist is in metres
    distKm=Math.floor(dist/1000);
    distM=dist-(distKm*1000);
    avrSpeed=dist/(durationInMilliseconds/3600000);
    
    numSteps = conversionInSteps(dist,durationInMilliseconds);
    
	result.innerHTML = "Well done ! You ran "+numSteps+" steps ! You've completed "+distKm+ " "+ distM + " metres in "+ durationHours +" h " + durationMin + " min " + durationSec + "sec."
    
}
    
function totalDistance(){ //gets the total distance between all the recorded coordinates
    let len = latitudes.length;
    let dist = 0;
    for (let i=0 ; i<(len-1);i++){
        dist = dist + converseDistanceInKilometers(latitudes[i],longitudes[i],latitudes[i+1],longitudes[i+1]);
    }
    return dist;
}

function converseDistanceInKilometers(lat1,lon1,lat2,lon2){ //gets coordinates and returns the distance in metres
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    
    return d;
}


function conversionInSteps(dist,durationMs){ //for the input, the distance is in metres, the duration in milliseconds
    durationMin = Math.round(durationMs/60000);
    distMiles = dist * 0.00062137;
    userInverseSpeed = durationMin/distMiles;
    //then, we will get the index of the user's height in the chart in https://www.thecalculatorsite.com/articles/units/how-many-steps-in-a-mile.php
    const userHeight= document.getElementById("height").value;
    userHeightIndex = getHeightColumn(userHeight); //so now we know which line of stepsChart we will be using to calculate the steps
    const numSteps = getNumberSteps(userHeightIndex,userInverseSpeed);
    return numSteps;
}


function getHeightColumn(height){ //we will compare the user's height with the different heights that are in the chart. we do this to know which line in the chart will be useful.
    if (height<heights[0]){
        return 0;
    }
    else{
        for (let i=1;i<heights.length;i++){
            if (height<heights[i]){
                return i-1;
            }
        }
        return heights.length-1;
    }
}

// NOTE : THIS FUNCTION COULD BE MERGED WITH getHeightColumn
function getSteps(heightIndex,speed){ //gives the indexes of the two speeds surrounding the user's speed
    
    if (speed>inverseSpeed[0]){
        return 0;
    }
    else{
        for (let i=1;i<inverseSpeed.length;i++){
            if (speed>inverseSpeed[i]){
                return i;
            }
        }
        return inverseSpeed.lenght-1;
    }
}

function getNumberSteps(heightIndex,speed){
    speedIndex = getSteps(heightIndex,speed);
    const coefSup = (speed-inverseSpeed[speedIndex])/2;
    const numStepsForOneMile = coefSup * stepsChart[heightIndex][speedIndex-1] + (1-coefSup) * stepsChart[heightIndex][speedIndex];
    const numSteps = numStepsForOneMile * distMiles * 1000;
    return Math.round(numSteps);
}
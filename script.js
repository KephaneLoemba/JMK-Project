// global variables 
    // added by Mila


    //added by John


    //added by Kephane
let PositionObject
let firstPromise



//js code by Mila
    function createToDocontainer(){
        let toDoContainer = document.createElement("div");
        toDoContainer.className="uk-card uk-card-default uk-card-body uk-padding-small uk-card-hover uk-position-relative uk-margin-small";
        let content =  '<input type="checkbox" class="a uk-inline uk-text-large">'
                        +'<p class="uk-inline uk-margin-remove display-event-time"> 9AM - 10AM : </p>'
                        +'<p class=" uk-inline uk-margin-remove display-event-title"> ohhha </p>'
                        +'<ul class="uk-iconnav uk-position-top-right uk-position-small">'
                            +'<li><a href="#" uk-icon="icon: file-edit"></a></li>'
                            +'<li><a href="#" uk-icon="icon: trash"></a></li></ul>';
        toDoContainer.innerHTML = content;
        console.log(toDoContainer);
        document.querySelector("#to-do-list").appendChild(toDoContainer);
    }
    createToDocontainer();


    function moveToFinishedList(){
        let conatiner= element.target;
        conatiner.removeChild(container.childNodes[0])
        conatiner.childNodes[3].innerHTML='<li><a href="#" uk-icon="icon: refresh" uk-tooltip="title: Restore; pos: bottom"></a></li>'
        document.querySelector("#finished-list").appendChild(container);
    }



//Js code by Kephane
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
        console.log(position);
        console.log("its working, my dude");
        PositionObject = position
            
    })

    } else {
      alert("Geolocation is not supported by this browser.");
    }
}


function renderCurrentWeather() {


    let APIKey = "293cd84e574cf959670f3a3bbd55265b";
    let thatLat = PositionObject.coords.latitude.toFixed(2);
    let thatLon = PositionObject.coords.longitude.toFixed(2);

  
    // Here we are building the URLs we need to query the database
  
    let queryURL =
      "https://api.openweathermap.org/data/2.5/weather?lat=" +
      thatLat + "&lon=" +
      thatLon + "&units=imperial&appid=" +
      APIKey;
  
    fetch(queryURL)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
            console.log(data)
            let temps = data.main.temp;


            let currentIcon = document.createElement('img')
            currentIcon.src = "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png"


            let weatherCard = document.getElementById("weather-div")
            weatherCard.children[0].innerHTML =
            "<b>" + "Local weather, " + "</b>" + moment().format(" ha ");
            weatherCard.children[0].append(currentIcon)
            weatherCard.children[1].innerHTML = "<b>Temperature: </b>" + temps.toFixed(2) + '°F'
            weatherCard.children[2].innerHTML = "<b>Humidity: </b>" + data.main.humidity + '%' 
            weatherCard.children[3].innerHTML = "<b>Wind speed: </b>" + data.wind.speed + ' MPH'
  
      })
}



getLocation();

document.getElementById("forecast-button").addEventListener("click", renderCurrentWeather);

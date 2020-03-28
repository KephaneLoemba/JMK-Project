// global variables
//  python3 -m http.server 8000
// added by Mila
let authorizeButton = document.getElementById("authorize_button");
let signoutButton = document.getElementById("signout_button");
let toDoList = document.getElementById("to-do-list");
let finishedList = document.getElementById("finished-list");
//search and render events based on the date requested
let dayChange = 0;
let dateToRender = moment()
  .format()
  .slice(0, 10);
let todaysDate = moment()
  .format()
  .slice(0, 10);
let eventID = "";

//added by John
let artLink1 = document.getElementById("artLink1");
let artLink2 = document.getElementById("artLink2");
let artLink3 = document.getElementById("artLink3");
let artLink4 = document.getElementById("artLink4");
let artLink5 = document.getElementById("artLink5");

//added by Kephane
let PositionObject;
let firstPromise;
let storedFavorites = []
let memory = JSON.parse(localStorage.getItem('favorites'))
if (memory) {
  storedFavorites = memory
}
//js code by Mila
// On load, called to load the auth2 library and API client library.
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

// Initializes the API client library and sets up sign-in state listeners.
function initClient() {
  gapi.client
    .init({
      apiKey: "AIzaSyAOuEz41BrAV-boYRPZAkNXvs6K0VdnVNc",
      clientId:
        "749857904089-q5qqo9bp0518jpmis6m1h8eod6904fva.apps.googleusercontent.com",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
      ],
      scope:
        "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
    })
    .then(
      function() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      },
      function(error) {
        appendPre(JSON.stringify(error, null, 2));
      }
    );
}

// Append a pre element to the body containing the given message as its text node. Used to display the results of the API call.
function appendPre(message) {
  let textContent = document.createTextNode(message + "\n");
  toDoList.appendChild(textContent);
}

// Called when the signed in status changes, to update the UI appropriately. After a sign-in, the API is called.
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    listEvents(); //call API
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
  }
}

//   Sign in the user upon button click.
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

// Sign out the user upon button click.
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Print the summary and start datetime/date of the next ten events in the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listEvents() {
  gapi.client.calendar.events
    .list({
      calendarId: "primary",
      timeMin: new Date(`${dateToRender}T00:00:00-04:00`).toISOString(),
      timeMax: new Date(`${dateToRender}T23:59:59-04:00`).toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime"
    })
    .then(function(response) {
      //render the date
      document.getElementById("date-to-render").textContent = dateToRender;

      let eventsToRender = response.result.items;
      //clean up to do list before rendering events
      toDoList.innerHTML = "";
      finishedList.innerHTML = "";
      if (eventsToRender.length > 0) {
        for (i = 0; i < eventsToRender.length; i++) {
          let event = eventsToRender[i];
          let eventContainer = createEventContainer();
          eventContainer.id = event.id;

          //add event title and scheduled time into the event container
          addEventInfo(event, eventContainer);

          // check if the event is in the past or already marked finished
          let isFinished = isFinishedEvent(event);

          let iconsButtons = eventContainer.childNodes[3];
          //add event listener to edit button
          editModalFunction(iconsButtons.childNodes[0]);

          //add event listener to delete button
          deleteFunction(iconsButtons.childNodes[1]);

          //append event container to to-do-list
          toDoList.append(eventContainer);

          // add checkbox function or move to finished list accordingly
          if (isFinished) {
            //remove checkbox and move event container to finished-list
            moveToFinishedList(eventContainer);
          } else {
            //add event listener to check box;
            checkFunction(eventContainer.childNodes[0]);
          }
        }
      }
      // check if the to-do-list is empty and add notification if yes
      if (toDoList.textContent == "") {
        toDoList.append("No events to do.");
      }
      eventCountBadge();
    });
}

/* start of rendereing events from google to the lists and 
add functions to buttons in the container  */

//cerate container for each event in the response
function createEventContainer() {
  let toDoEventContainer = document.createElement("div");
  toDoEventContainer.className =
    "uk-card uk-card-default uk-card-body uk-padding-small uk-card-hover uk-position-relative uk-margin-small";
  let content =
    '<input type="checkbox" class="uk-inline uk-text-large">' +
    '<p class="uk-inline "></p>' +
    '<p class=" uk-inline "></p>' +
    '<ul class="uk-iconnav uk-position-top-right uk-position-small">' +
    '<li><a href="#event-edit-modal" uk-toggle uk-icon="icon: file-edit"></a></li>' +
    '<li><a href="#" uk-icon="icon: trash"></a></li></ul>';
  toDoEventContainer.innerHTML = content;
  return toDoEventContainer;
}

//add event infos into the event container
function addEventInfo(event, eventContainer) {
  // add event scheduled ime to the event container
  if (!event.start.dateTime) {
    eventContainer.childNodes[1].textContent = "All day event: ";
  } else {
    let fromHour = event.start.dateTime.slice(11, 16);
    let toHour = event.end.dateTime.slice(11, 16);
    eventContainer.childNodes[1].textContent = fromHour + " - " + toHour;
  }
  // add event title to event container
  eventContainer.childNodes[2].textContent = event.summary;
}

// check if the event from response marked as finished or is already in the past
function isFinishedEvent(event) {
  let isFinished = false;
  if (event.end.dateTime) {
    let eventEndHour = event.end.dateTime.slice(11, 16);
    let currentHour = moment().format("HH:mm");
    if (currentHour > eventEndHour) {
      isFinished = true;
    }
  } else if (event.description && event.description === "Finished") {
    isFinished = true;
  }

  //if the events is in the future, it is not finished
  if (todaysDate < dateToRender) {
    isFinished = false;
  }
  return isFinished;
}

//move checked or finished events from to-do list to finished list
function moveToFinishedList(eventContainer) {
  //remove check box from the container
  eventContainer.removeChild(eventContainer.childNodes[0]);
  //remove edit btn from the container
  eventContainer.childNodes[2].removeChild(
    eventContainer.childNodes[2].childNodes[0]
  );
  finishedList.appendChild(eventContainer);
}

//check finished event function:
//add function to checkbox, checked event will be marked as finished
function checkFunction(checkbox) {
  checkbox.addEventListener("click", function() {
    if (this.checked == true) {
      eventID = this.parentNode.id;
      //move the checked event to finished list
      moveToFinishedList(this.parentNode);
      //mark event as finished in google calender
      markEventFinished();
      eventCountBadge();
    }
  });
}

//mark event as finished in google calender
function markEventFinished() {
  gapi.client
    .init({
      apiKey: "AIzaSyAOuEz41BrAV-boYRPZAkNXvs6K0VdnVNc",
      clientId:
        "749857904089-q5qqo9bp0518jpmis6m1h8eod6904fva.apps.googleusercontent.com",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
      ],
      scope:
        "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
    })
    .then(function() {
      let event = gapi.client.calendar.events.get({
        calendarId: "primary",
        eventId: eventID
      });

      // Example showing a change in the location
      event.description = "Finished";

      let request = gapi.client.calendar.events.patch({
        calendarId: "primary",
        eventId: eventID,
        resource: event
      });

      request.execute(function(event) {});
    });
}

//edit event function:
//add function to edit button, will open edit modal while clicked
function editModalFunction(editBtn) {
  editBtn.addEventListener("click", function() {
    eventID = this.parentNode.parentNode.id;
    let eventContainer = this.parentNode.parentNode;
    //open the edit form modal, and pre-fill fields accordingly
    preFillEventInfo(eventContainer);
  });
}

//fill the event info into the edit from modal
function preFillEventInfo(eventContainer) {
  document.getElementById("event-edit-title").value =
    eventContainer.childNodes[2].textContent;
  console.log(eventContainer.childNodes[2].textContent);
  document.getElementById("event-edit-date").value = dateToRender;
  let time = eventContainer.childNodes[1].textContent;
  console.log(time);
  if (time === "All day event: ") {
    document.getElementById("event-edit-start-time").value = "00:00";
    document.getElementById("event-edit-end-time").value = "24:00";
  } else {
    document.getElementById("event-edit-start-time").value = time.slice(0, 5);
    document.getElementById("event-edit-end-time").value = time.slice(8, 13);
  }
}

//add function to edit event modal save button, changes will be saved to the website and google calender
document
  .getElementById("event-edit-save-btn")
  .addEventListener("click", editEvent);

// save the changes from edit modal to google calender
function editEvent() {
  gapi.client
    .init({
      apiKey: "AIzaSyAOuEz41BrAV-boYRPZAkNXvs6K0VdnVNc",
      clientId:
        "749857904089-q5qqo9bp0518jpmis6m1h8eod6904fva.apps.googleusercontent.com",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
      ],
      scope:
        "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
    })
    .then(function() {
      let event = gapi.client.calendar.events.get({
        calendarId: "primary",
        eventId: eventID
      });

      //Update event info with the values from edit modal
      event.summary = document.getElementById("event-edit-title").value;
      //differentiate scheduled event and all day event
      let eventStart = document.getElementById("event-edit-start-time").value;
      let eventEnd = document.getElementById("event-edit-end-time").value;
      let eventDate = document.getElementById("event-edit-date").value;
      if (eventStart === "00:00" && eventEnd === "24:00") {
        event.start = {
          date: eventDate
        };
        event.end = {
          date: moment(eventDate)
            .add(1, "days")
            .format()
            .slice(0, 10)
        };
      } else {
        event.start = {
          dateTime: eventDate + "T" + eventStart + ":00-04:00"
        };
        event.end = {
          dateTime: eventDate + "T" + eventEnd + ":00-04:00"
        };
      }
      //update changes into the google calender
      let request = gapi.client.calendar.events.patch({
        calendarId: "primary",
        eventId: eventID,
        resource: event
      });
      request.execute(function(event) {
        handleClientLoad();
      });
    });
}

//delete event function:
//add function to delete button, will delete event from the webpage as well as google calender
function deleteFunction(deleteBtn) {
  deleteBtn.addEventListener("click", function() {
    let thisContainer = this.parentNode.parentNode;
    eventID = thisContainer.id;
    //delete from google calender
    deleteEvent();
    //delete from webpage
    thisContainer.parentNode.removeChild(this.parentNode.parentNode);
    eventCountBadge();
  });
}

//delete event from google calender
function deleteEvent() {
  gapi.client
    .init({
      apiKey: "AIzaSyAOuEz41BrAV-boYRPZAkNXvs6K0VdnVNc",
      clientId:
        "749857904089-q5qqo9bp0518jpmis6m1h8eod6904fva.apps.googleusercontent.com",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
      ],
      scope:
        "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
    })
    .then(function() {
      let event = gapi.client.calendar.events.get({
        calendarId: "primary",
        eventId: eventID
      });
      let request = gapi.client.calendar.events.delete({
        calendarId: "primary",
        eventId: eventID,
        resource: event
      });

      request.execute(function(event) {});
    });
}
/* end of event container */

/*start of date display and control panel */
//add event listener to previous button
document.getElementById("previous-day").addEventListener("click", function() {
  dayChange--;
  dateToRender = moment()
    .add(dayChange, "days")
    .format()
    .slice(0, 10);
  handleClientLoad();
});

//add event listener to previous button
document.getElementById("next-day").addEventListener("click", function() {
  dayChange++;
  dateToRender = moment()
    .add(dayChange, "days")
    .format()
    .slice(0, 10);
  handleClientLoad();
});

// count the events in the list and add it to te badge
function eventCountBadge() {
  document.getElementById("to-do-count").textContent =
    toDoList.childElementCount;
  document.getElementById("finished-count").textContent =
    finishedList.childElementCount;
}
/* end of date panel */

/* start of add event function */
// add event listener to save button in add event modal
document.getElementById("form-save-btn").addEventListener("click", addNewEvent);

//add the event to google calendar
function addNewEvent() {
  gapi.client
    .init({
      apiKey: "AIzaSyAOuEz41BrAV-boYRPZAkNXvs6K0VdnVNc",
      clientId:
        "749857904089-q5qqo9bp0518jpmis6m1h8eod6904fva.apps.googleusercontent.com",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
      ],
      scope:
        "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
    })
    .then(function() {
      gapi.client.calendar.events
        .list({
          calendarId: "primary"
        })
        .then(function(response) {
          let eventTitle = document.getElementById("form-event-title").value;
          //differentiate all day event and scheduled event
          let eventDate =
            document.getElementById("form-event-date").value || dateToRender;
          let eventStart = document.getElementById("form-event-start-time")
            .value;
          let eventEnd = document.getElementById("form-event-end-time").value;
          let event = {
            summary: eventTitle
          };
          if (eventStart && eventEnd) {
            event.start = {
              dateTime: eventDate + "T" + eventStart + ":00-04:00"
            };
            event.end = {
              dateTime: eventDate + "T" + eventEnd + ":00-04:00"
            };
          } else {
            event.start = {
              date: eventDate
            };
            event.end = {
              date: moment(eventDate)
                .add(1, "days")
                .format()
                .slice(0, 10)
            };
          }
          // add the event to google calender
          let request = gapi.client.calendar.events.insert({
            calendarId: "primary",
            resource: event
          });
          request.execute(function(event) {
            handleClientLoad();
          });
        });
    });
}

//Js code by Kephane
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log(position);
      console.log("its working, my dude");
      PositionObject = position;
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function renderCurrentWeather() {
  let buttonCard = document.getElementById("button-card");
  buttonCard.classList.add("uk-animation-scale-down");
  setTimeout(function() {
    buttonCard.classList.remove("uk-animation-scale-down");
  }, 90);

  hideLocationInstructions();
  if (PositionObject) {
    let APIKey = "293cd84e574cf959670f3a3bbd55265b";
    let thatLat = PositionObject.coords.latitude.toFixed(2);
    let thatLon = PositionObject.coords.longitude.toFixed(2);

    // Here we are building the URLs we need to query the database

    let queryURL =
      "https://api.openweathermap.org/data/2.5/weather?lat=" +
      thatLat +
      "&lon=" +
      thatLon +
      "&units=metric&appid=" +
      APIKey;

    fetch(queryURL)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        console.log(data);
        let temps = data.main.temp;

        let currentIcon = document.createElement("img");
        currentIcon.src =
          "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";

        let weatherCard = document.getElementById("weather-div");
        weatherCard.children[0].innerHTML =
          "Local weather, " + moment().format(" ha ");
        weatherCard.children[0].append(currentIcon);
        weatherCard.children[1].innerHTML =
          "Temperature: " + temps.toFixed(2) + "°C";
        weatherCard.children[2].innerHTML =
          "Humidity: " + data.main.humidity + "%";
        weatherCard.children[3].innerHTML =
          "Wind speed: " + data.wind.speed + " KM/H";
      });
  }
}

function hideLocationInstructions() {
  let weatherMessage = document.getElementById("location-instructions");
  let forecastButtonIcon = document.getElementById("forecast-button-icon");
  if (PositionObject) {
    weatherMessage.style.display = "none";
    forecastButtonIcon.setAttribute("uk-icon", "icon: refresh");
  } else {
    weatherMessage.classList.remove("uk-animation-shake");
    weatherMessage.style.display = "block";
    setTimeout(function() {
      weatherMessage.classList.add("uk-animation-shake");
    }, 1);
    forecastButtonIcon.setAttribute("uk-icon", "icon: location");
  }
}

getLocation();

document
  .getElementById("forecast-button")
  .addEventListener("click", renderCurrentWeather);

//JS added by John (news section)

function displayNewsInfo() {
  let url = `https://api.nytimes.com/svc/topstories/v2/home.json?api-key=3YES3qufvW0LVKvA4mQ1B1dqtjLm93QY`;

  fetch(url)
    .then(function(result) {
      return result.json();
    })
    .then(function(news) {
      let newsBox = document.getElementById("news");
      console.log(news);

      //Title and Link for 1st article
      artLink1.textContent = news.results[0].title;
      artLink1.href = news.results[0].url;

      //Title and Link for 2nd article
      artLink2.textContent = news.results[1].title;
      artLink2.href = news.results[1].url;

      //Title and Link for 3rd article
      artLink3.textContent = news.results[2].title;
      artLink3.href = news.results[2].url;

      //Title and Link for 4th article
      artLink4.textContent = news.results[3].title;
      artLink4.href = news.results[3].url;

      //Title and Link for 5th article
      artLink5.textContent = news.results[4].title;
      artLink5.href = news.results[4].url;
    });
}

displayNewsInfo();
displayFavoriteArticles();


// Article favoriting  (JS by Kephane)

  

  

for (let star of document.querySelectorAll(".iconStyle")) {

  star.addEventListener("click", addToFavorites);
}

function addToFavorites() {
  clearFavorites();
  // Part 1: Grab the desired article's title and URL. store them in variables.
  
  let thisArticleTitle = this.parentElement.previousElementSibling.firstChild.textContent;
  let thisArticleURL = this.parentElement.previousElementSibling.firstChild.href
  // Part 2: add the selected article's title and URL to the favorites array.
  console.log(storedFavorites)
  storedFavorites.unshift([thisArticleTitle, thisArticleURL])
  console.log(storedFavorites)
  localStorage.setItem("favorites", JSON.stringify(storedFavorites));
  
  // Part 3: dynamically display the updated contents of Favorites array to the HTML

  displayFavoriteArticles();

  // Part 4: Add animation on click, for responsiveness.
  let currentStarIcon = this
  this.classList.add("uk-animation-scale-down");
  setTimeout(function() {
    currentStarIcon.classList.remove("uk-animation-scale-down");
  }, 90);
  
}

function displayFavoriteArticles () {
  // Clear current diplay of favorites
  clearFavorites();
  // Display storedFavorites array.
  let i = 0;
  for (let thisFavorite of storedFavorites) {
        if (i < 5){
        // Grab all of the article slots in your favorites tab, and put them into an array.
        let favoriteArticleSlots = document.getElementsByClassName("favLink");
        // fill up each favorite slot with the information from localStorage.
        
        favoriteArticleSlots[i].href = thisFavorite[1]
        favoriteArticleSlots[i].innerHTML = thisFavorite[0]
        // Loop over this sequence, for each <a> tag that we selected.
        i++
        }
  } 


}

function clearFavorites () {
  
  for (let favAtag of document.getElementsByClassName("favLink")) {

    favAtag.innerHTML = "";
  }

}




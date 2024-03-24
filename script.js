// Declare jsonEvents at the top level so it's accessible to other functions
let jsonEvents = [];
let jsonOriginalEvents = [];
let calendarId;
// var calendarId = "testCalendar1";
let calendarIdNew;
var userId = "testUser1";
let timezone;

//document.addEventListener('DOMContentLoaded', function() {
//  document.getElementById('importButton').addEventListener('click', uploadCalendar);
// document.getElementById('populateButton').addEventListener('click', populateTrips);
//});

//GET request to dynamoDB
// fetch('https://dy6i1yjyh6.execute-api.us-east-1.amazonaws.com/ITS/calendar/' + calendarIdNew, { // Replace with the calendarID to call
// method: 'GET', 
// headers: {
//   'Content-Type': 'application/json',
// }
// })
// .then((response) => response.text())
// .then((data) => {
// console.log(JSON.parse(data));
// })
// .catch((error) => console.error(error));



document.addEventListener('DOMContentLoaded', function () {
  const importButton = document.getElementById('importButton');
  const populateButton = document.getElementById('populateButton');

  console.log('Adding event listeners');

  if (importButton) {
    importButton.addEventListener('click', uploadCalendar);
  } else {
    console.error('importButton not found.');
  }

  if (populateButton) {
    populateButton.addEventListener('click', populateTrips);
  } else {
    console.error('populateButton not found.');
  }
});

function uploadCalendar() {
  const fileInput = document.getElementById('calendarUpload');
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const fileExtension = file.name.split('.').pop();

    if (fileExtension === 'ics') {
      const reader = new FileReader();

      reader.onload = function (event) {
        const icsData = event.target.result;
        try {
          const jcalData = ICAL.parse(icsData);
          const comp = new ICAL.Component(jcalData);
          const events = comp.getAllSubcomponents('vevent');
          // Scenarios for different timezone formatting 
          if (comp.getFirstPropertyValue('vtimezone')) {
              timezone = comp.getFirstPropertyValue('vtimezone');
          } else if (comp.getFirstPropertyValue('x-wr-timezone')) {
              timezone = comp.getFirstPropertyValue('x-wr-timezone');
          } else if (comp.getFirstPropertyValue('tzid')) {
              timezone = comp.getFirstPropertyValue('tzid');
          } else if (comp.getFirstPropertyValue('tzoffsetfrom')) {
              timezone = comp.getFirstPropertyValue('tzoffsetfrom');
          }

            // Populate the global jsonOriginalEvents variable with converted events
            jsonOriginalEvents = events.map(event => {
              const icalEvent = new ICAL.Event(event);
              const startDate = moment(icalEvent.startDate.toJSDate());
              const endDate = moment(icalEvent.endDate.toJSDate());
              
              return {
                summary: icalEvent.summary,
                location: icalEvent.location,
                startDate: startDate.tz(timezone).format(),
                endDate: endDate.tz(timezone).format(),
              };
            });
            
            // Id of original calendar
            calendarId = uuid.v4();

            // Create a data object to send to the API
            data = {
              // "calendarId": calendarId,
              "calendarId": calendarId, 
              "userId": userId,
              "content": jsonOriginalEvents
            }

            // // Send data to DynamoDB through API
            // fetch('https://dy6i1yjyh6.execute-api.us-east-1.amazonaws.com/ITS/calendar', {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify(data),
            // })
            //   .then(response => {
            //     if (!response.ok) {
            //       throw new Error('Network response was not ok');
            //     }
            //     return response.json();
            //   })
            //   .then(data => {
            //     console.log(data);
            //   })
            //   .catch(error => {
            //     console.error('There was a problem with your fetch operation:', error);
            //   });

            // console.log(jsonOriginalEvents); // Log the JSON array of events
            placeOriginalEventsInCalendar(); // Call placeOriginalEventsInCalendar() here to display original calendar
          } catch (e) {
            console.error('Error parsing ICS:', e);
            document.getElementById('error').textContent = 'Error parsing the calendar file.';
          }
        };

        reader.onerror = function () {
          console.error('File could not be read');
          document.getElementById('error').textContent = 'File could not be read.';
        };

        reader.readAsText(file);

        document.getElementById('desktop-1').style.display = 'none';
        document.getElementById('desktop-2').style.display = 'flex';

      } else {
        document.getElementById('error').textContent = 'Please upload a file in .ics format.';
      }
    }
  }


  function alerts() {
    document.getElementById('status-icon').style.display = 'inline';
    document.getElementById('status-text').style.display = 'inline';
  }


  function placeOriginalEventsInCalendar() {
    // jsonOriginalEvents is an array of event objects of original calendar

    // Get the current date and time in the specified timezone
    const currentDateInTimezone = moment.tz(moment(), timezone).format('YYYY-MM-DD HH:mm:ss');
    console.log('currentDateInTimezone', currentDateInTimezone)


    function getWeekBounds(date, timezone) {
      // Clone the date to avoid modifying the original date
      const startDate = moment(date).tz(timezone).startOf('isoWeek');
      const endDate = moment(date).tz(timezone).endOf('isoWeek');
  
      // Format the dates
      const monday = startDate.format('YYYY-MM-DD 00:00:00');
      const sunday = endDate.format('YYYY-MM-DD 23:59:59');
  
      return { monday, sunday };
    }
    
    const { monday, sunday } = getWeekBounds(currentDateInTimezone, timezone);
    
    console.log("Monday 00:00:00 of the week:", monday);
    console.log("Sunday 23:59:59 of the week:", sunday);

    const filterStartDate = monday;
    const filterEndDate = sunday;
  
    jsonOriginalEvents.forEach((event, index) => {
      // Create an event element
      const eventElement = document.createElement('div');
      eventElement.classList.add('event');
      eventElement.textContent = event.summary; // add the event title
      console.log('Placing events on calendar:', event);
      console.log(`Event [${index}] summary:`, event.summary);
      
      const startTime = moment(event.startDate).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
      const endTime = moment(event.endDate).tz(timezone).format('YYYY-MM-DD HH:mm:ss')
      console.log(`Event [${index}] start time:`, startTime);

      // Get the day of the week for the event (0 is Sunday, 1 is Monday, etc.)
      const dayOfWeek = moment(startTime, 'YYYY-MM-DD HH:mm:ss').day();
      console.log('This is the day of week: ', dayOfWeek)
      // Assuming your .day-cell elements have a data-day attribute starting from 0 for Sunday
      const dayCell = document.querySelector(`.day-cell[data-day="${dayOfWeek}"]`);
      console.log('This is the day-cell: ', dayCell)

      if (moment(startTime, 'YYYY-MM-DD HH:mm:ss').isAfter(moment(filterStartDate, 'YYYY-MM-DD HH:mm:ss')) && moment(startTime, 'YYYY-MM-DD HH:mm:ss').isBefore(moment(filterEndDate, 'YYYY-MM-DD HH:mm:ss'))) {
        // Calculate the start time in minutes from midnight
        const minutesFromMidnight = moment(startTime, 'YYYY-MM-DD HH:mm:ss').hour() * 60 + moment(startTime, 'YYYY-MM-DD HH:mm:ss').minute() - 360; // The day begins at 6am
        console.log('minutes from midnight is: ', minutesFromMidnight)
        // Calculate the duration of the event in minutes
        const eventDuration = moment(endTime, 'YYYY-MM-DD HH:mm:ss').diff(moment(startTime, 'YYYY-MM-DD HH:mm:ss'), 'minutes');
        console.log('event duration is: ', eventDuration)

        // You may need to adjust the height of an hour in pixels
        const hourHeight = 50; // The height of a one-hour slot in your calendar
        const topPosition = (minutesFromMidnight / 60) * hourHeight;
        const height = (eventDuration / 60) * hourHeight;
        console.log('the height of the hour is: ', hourHeight)
        console.log('the top position is: ', topPosition)
        console.log('the height is: ', height)

        // Apply styles to position the event in the calendar
        eventElement.style.position = 'absolute';
        eventElement.style.top = `${topPosition}px`;
        eventElement.style.height = `${height}px`;
        eventElement.style.width = '100%'; // Make the event take up the whole width of the day cell
        eventElement.style.backgroundColor = 'lightblue'; // Event background color
        eventElement.style.border = '1px solid darkblue'; // Event border

        // Append the event element to the corresponding day cell
        if (dayCell) {
          console.log(`dayCell found for event [${index}]:`, dayCell);
          dayCell.appendChild(eventElement);
        } else {
          console.error(`dayCell not found for event [${index}] on dayOfWeek:`, dayOfWeek);
        }
        // Check that everything is working
        console.log('dayOfWeek:', dayOfWeek);
        console.log('dayCell:', dayCell);
        console.log('Event Duration (minutes):', eventDuration);
        console.log('Top Position (px):', topPosition);
        console.log('Event Height (px):', height);
      }
    });
  }


  /* PLACE EVENTS (OUTPUT) ON CALENDAR */
  function placeEventsInCalendar() {
    // jsonEvents is an array of event objects of eventual calendar

    // Get the current date and time in the specified timezone
    const currentDateInTimezone = moment.tz(moment(), timezone).format('YYYY-MM-DD HH:mm:ss');
    console.log('currentDateInTimezone', currentDateInTimezone)


    function getWeekBounds(date, timezone) {
      // Clone the date to avoid modifying the original date
      const startDate = moment(date).tz(timezone).startOf('isoWeek');
      const endDate = moment(date).tz(timezone).endOf('isoWeek');
  
      // Format the dates
      const monday = startDate.format('YYYY-MM-DD 00:00:00');
      const sunday = endDate.format('YYYY-MM-DD 23:59:59');
  
      return { monday, sunday };
    }
    
    const { monday, sunday } = getWeekBounds(currentDateInTimezone, timezone);
    
    console.log("Monday 00:00:00 of the week:", monday);
    console.log("Sunday 23:59:59 of the week:", sunday);

    const filterStartDate = monday;
    const filterEndDate = sunday;
    
    jsonEvents.forEach((event, index) => {
      // Create an event element
      const eventElement = document.createElement('div');
      eventElement.classList.add('event');
      eventElement.textContent = event.summary; // add the event title
      console.log('Placing events on calendar:', event);
      console.log(`Event [${index}] summary:`, event.summary);

      const startTime = moment(event.startDate).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
      const endTime = moment(event.endDate).tz(timezone).format('YYYY-MM-DD HH:mm:ss')
      console.log(`Event [${index}] start time:`, startTime);

      // Get the day of the week for the event (0 is Sunday, 1 is Monday, etc.)
      const dayOfWeek = moment(startTime, 'YYYY-MM-DD HH:mm:ss').day();
      console.log('This is the day of week: ', dayOfWeek)
      // Assuming your .day-cell elements have a data-day attribute starting from 0 for Sunday
      const dayCell = document.querySelector(`.day-cell[data-day="${dayOfWeek}"]`);
      console.log('This is the day-cell: ', dayCell)

      if (moment(startTime, 'YYYY-MM-DD HH:mm:ss').isAfter(moment(filterStartDate, 'YYYY-MM-DD HH:mm:ss')) && moment(startTime, 'YYYY-MM-DD HH:mm:ss').isBefore(moment(filterEndDate, 'YYYY-MM-DD HH:mm:ss'))) {
        // Calculate the start time in minutes from midnight
        const minutesFromMidnight = moment(startTime, 'YYYY-MM-DD HH:mm:ss').hour() * 60 + moment(startTime, 'YYYY-MM-DD HH:mm:ss').minute() - 360; // The day begins at 6am
        console.log('minutes from midnight is: ', minutesFromMidnight)
        // Calculate the duration of the event in minutes
        const eventDuration = moment(endTime, 'YYYY-MM-DD HH:mm:ss').diff(moment(startTime, 'YYYY-MM-DD HH:mm:ss'), 'minutes');
        console.log('event duration is: ', eventDuration)


        // You may need to adjust the height of an hour in pixels
        const hourHeight = 50; // The height of a one-hour slot in your calendar
        const topPosition = (minutesFromMidnight / 60) * hourHeight;
        const height = (eventDuration / 60) * hourHeight;
        console.log('the height of the hour is: ', hourHeight)
        console.log('the top position is: ', topPosition)
        console.log('the height is: ', height)

        // Apply styles to position the event in the calendar
        eventElement.style.position = 'absolute';
        eventElement.style.top = `${topPosition}px`;
        eventElement.style.height = `${height}px`;
        eventElement.style.width = '100%'; // Make the event take up the whole width of the day cell
        eventElement.style.backgroundColor = 'lightblue'; // Event background color
        eventElement.style.border = '1px solid darkblue'; // Event border

        // Append the event element to the corresponding day cell
        if (dayCell) {
          console.log(`dayCell found for event [${index}]:`, dayCell);
          dayCell.appendChild(eventElement);
        } else {
          console.error(`dayCell not found for event [${index}] on dayOfWeek:`, dayOfWeek);
        }
        // Check that everything is working
        console.log('dayOfWeek:', dayOfWeek);
        console.log('dayCell:', dayCell);
        console.log('Event Duration (minutes):', eventDuration);
        console.log('Top Position (px):', topPosition);
        console.log('Event Height (px):', height);
      }
    });
  }

  function isCurrentWeek(date) {
    console.log('This is the date: ', date)
    const now = new Date();
    const startOfWeek = now.getDate() - now.getDay(); // Starting date of the week (Sunday)
    const endOfWeek = startOfWeek + 6; // Ending date of the week (Saturday)
    const start = new Date(now.setDate(startOfWeek));
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.setDate(endOfWeek));
    end.setHours(23, 59, 59, 999);
    console.log('Output of isCurrentWeek:', date >= start && date <= end)
    return date >= start && date <= end;
  }

  function populateTrips() {
    console.log('populateTrips called');
    console.log('jsonEvents at the time of populateTrips:', jsonEvents);
    if (!jsonEvents.length) {
      console.error('jsonEvents is empty');
      return; // Stop the function if there are no events to process.
    }
    calendarIdNew = uuid.v4();
    // Replace this with lambda function call (with calendarIdNew as an argument)
    alerts();
    placeEventsInCalendar();
  }

  function exportCalendar() {
    // Retrieve the calendar data
    const calendarData = retrieveCalendarData();

    // Format the data into iCalendar format
    const iCalendarContent = formatToICalendar(calendarData);

    // Create a Blob object containing the iCalendar content
    const blob = new Blob([iCalendarContent], { type: 'text/calendar' });

    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'calendar.ics'; // Set the filename

    // Trigger the download
    link.click();
}

  function retrieveCalendarData() {
      // //GET request to dynamoDB
      // fetch('https://dy6i1yjyh6.execute-api.us-east-1.amazonaws.com/ITS/calendar/' + calendarIdNew, { // Replace with the calendarID to call
      // method: 'GET', 
      // headers: {
      //   'Content-Type': 'application/json',
      // }
      // })
      // .then((response) => response.text())
      // .then((data) => {
      // console.log(JSON.parse(data));
      // })
      // .catch((error) => console.error(error))
      // console.log(data.content);
      // return data.content;
  }

  function formatToICalendar(calendarData, timezone) {
      // Replace this with your logic to format data into iCalendar format
      let iCalendarContent = `BEGIN:VCALENDAR\nVERSION:2.0\n`;

      // Include timezone definition
      iCalendarContent += `BEGIN:VTIMEZONE\n`;
      iCalendarContent += `TZID:${timezone}\n`;
      iCalendarContent += `END:VTIMEZONE\n`;
      
      calendarData.forEach(event => {
          iCalendarContent += `BEGIN:VEVENT\n`;
          iCalendarContent += `SUMMARY:${event.summary}\n`;
          iCalendarContent += `DTSTART:${event.startDate}\n`;
          iCalendarContent += `DTEND:${event.endDate}\n`;
          iCalendarContent += `LOCATION:${event.location}\n`; 
          iCalendarContent += `END:VEVENT\n`;
      });

      iCalendarContent += `END:VCALENDAR`;

      return iCalendarContent;
  }

  // Example usage: Call exportCalendar() when user clicks a button
  const exportButton = document.getElementById('exportButton');
  exportButton.addEventListener('click', exportCalendar);




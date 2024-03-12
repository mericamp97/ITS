// Declare jsonEvents at the top level so it's accessible to other functions
let jsonEvents = [];



//document.addEventListener('DOMContentLoaded', function() {
//  document.getElementById('importButton').addEventListener('click', uploadCalendar);
 // document.getElementById('populateButton').addEventListener('click', populateTrips);
//});

document.addEventListener('DOMContentLoaded', function() {
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
      
      reader.onload = function(event) {
        const icsData = event.target.result;
        try {
          const jcalData = ICAL.parse(icsData);
          const comp = new ICAL.Component(jcalData);
          const events = comp.getAllSubcomponents('vevent');
          
          // Populate the global jsonEvents variable with converted events
          jsonEvents = events.map(event => {
            const icalEvent = new ICAL.Event(event);
            return {
              summary: icalEvent.summary,
              location: icalEvent.location,
              startDate: icalEvent.startDate.toString(),
              endDate: icalEvent.endDate.toString()
              // You can add more properties as needed
            };
          });

          console.log(jsonEvents); // Log the JSON array of events
        } catch (e) {
          console.error('Error parsing ICS:', e);
          document.getElementById('error').textContent = 'Error parsing the calendar file.';
        }
      };
      
      reader.onerror = function() {
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

  /* PLACE EVENTS ON CALENDAR */

  function placeEventsInCalendar() {
    // jsonEvents is an array of event objects
    const filterStartDate = new Date('2024-02-12T00:00:00+08:00'); // Start of the day in Singapore Time
    const filterEndDate = new Date('2024-02-18T23:59:59+08:00'); // End of the day in Singapore Time
    console.log('placeEventsInCalendar called with jsonEvents:', jsonEvents);
    jsonEvents.forEach((event, index) => {
      // Create an event element
      const eventElement = document.createElement('div');
      eventElement.classList.add('event');
      eventElement.textContent = event.summary; // add the event title
      console.log('Placing events on calendar:', event);
      console.log(`Event [${index}] summary:`, event.summary);
  
      // Convert event start and end times to Date objects
      const startTime = new Date(event.startDate);
      const endTime = new Date(event.endDate);
      console.log(`Event [${index}] start time:`, startTime);
  
      // Get the day of the week for the event (0 is Sunday, 1 is Monday, etc.)
      const dayOfWeek = startTime.getDay();
      console.log('This is the day of week: ',dayOfWeek)
      // Assuming your .day-cell elements have a data-day attribute starting from 0 for Sunday
      const dayCell = document.querySelector(`.day-cell[data-day="${dayOfWeek}"]`);
      console.log('This is the day-cell: ', dayCell)
      
      // If the event is not within the current week, don't place it
    //  if (!isCurrentWeek(startTime)) {
    //    return;
    //  }
      if (startTime >= filterStartDate && startTime <= filterEndDate) {
        // Calculate the start time in minutes from midnight
        const minutesFromMidnight = startTime.getHours() * 60 + startTime.getMinutes()-540; // The day begins at 9am
        console.log('minutes from midnight is: ',minutesFromMidnight)
        // Calculate the duration of the event in minutes
        const eventDuration = (endTime - startTime) / (1000 * 60);
        console.log('event duration is: ', eventDuration)
    
        // You may need to adjust the height of an hour in pixels
        const hourHeight = 50; // The height of a one-hour slot in your calendar
        const topPosition = (minutesFromMidnight / 60) * hourHeight;
        const height = (eventDuration / 60) * hourHeight;
        console.log('the hight of the hour is: ',hourHeight)
        console.log('the top position is: ',topPosition)
        console.log('the hight is: ',height)
    
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
    console.log('Output of isCurrentWeek:',date >= start && date <= end)
    return date >= start && date <= end;
  }

  function populateTrips() {
    console.log('populateTrips called');
    console.log('jsonEvents at the time of populateTrips:', jsonEvents);
    if (!jsonEvents.length) {
      console.error('jsonEvents is empty');
      return; // Stop the function if there are no events to process.
    }
    alerts();
    placeEventsInCalendar();
}

  


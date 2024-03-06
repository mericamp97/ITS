// Declare jsonEvents at the top level so it's accessible to other functions
let jsonEvents = [];

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

  function placeEventsInCalendar(jsonEvents) {
    // Assuming jsonEvents is an array of event objects
    jsonEvents.forEach(event => {
      // Create an event element
      const eventElement = document.createElement('div');
      eventElement.classList.add('event');
      eventElement.textContent = event.summary; // add the event title
      console.log('Placing events on calendar:', events);
  
      // Convert event start and end times to Date objects
      const startTime = new Date(event.startDate);
      const endTime = new Date(event.endDate);
  
      // Get the day of the week for the event (0 is Sunday, 1 is Monday, etc.)
      const dayOfWeek = startTime.getDay();
      // Assuming your .day-cell elements have a data-day attribute starting from 0 for Sunday
      const dayCell = document.querySelector(`.day-cell[data-day="${dayOfWeek}"]`);
      
      // If the event is not within the current week, don't place it
      if (!isCurrentWeek(startTime)) {
        return;
      }
  
      // Calculate the start time in minutes from midnight
      const minutesFromMidnight = startTime.getHours() * 60 + startTime.getMinutes();
      // Calculate the duration of the event in minutes
      const eventDuration = (endTime - startTime) / (1000 * 60);
  
      // You may need to adjust the height of an hour in pixels
      const hourHeight = 50; // The height of a one-hour slot in your calendar
      const topPosition = (minutesFromMidnight / 60) * hourHeight;
      const height = (eventDuration / 60) * hourHeight;
  
      // Apply styles to position the event in the calendar
      eventElement.style.position = 'absolute';
      eventElement.style.top = `${topPosition}px`;
      eventElement.style.height = `${height}px`;
      eventElement.style.width = '100%'; // Make the event take up the whole width of the day cell
      eventElement.style.backgroundColor = 'lightblue'; // Event background color
      eventElement.style.border = '1px solid darkblue'; // Event border
  
      // Append the event element to the corresponding day cell
      if (dayCell) {
        dayCell.appendChild(eventElement);
      }
    });
  }
  
  function isCurrentWeek(date) {
    const now = new Date();
    const startOfWeek = now.getDate() - now.getDay(); // Starting date of the week (Sunday)
    const endOfWeek = startOfWeek + 6; // Ending date of the week (Saturday)
    const start = new Date(now.setDate(startOfWeek));
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.setDate(endOfWeek));
    end.setHours(23, 59, 59, 999);
  
    return date >= start && date <= end;
  }

  function populateTrips() {
    alerts();
    placeEventsInCalendar(jsonEvents);
}
  


/* function uploadCalendar() {
    const fileInput = document.getElementById('calendarUpload');
    if (fileInput.files.length > 0) {
      const fileName = fileInput.files[0].name;
      const fileExtension = fileName.split('.').pop();
      if (fileExtension === 'ics') {
        document.getElementById('desktop-1').style.display = 'none';
        document.getElementById('desktop-2').style.display = 'flex';
        // Here, you might also read the file and do something with it
      } else {
        document.getElementById('error').textContent = 'Please upload a file in .ics format.';
      }
    }
  } */

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
            
            // Convert each event to a more readable JSON format
            const jsonEvents = events.map(event => {
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
  
  function populateTrips() {
    document.getElementById('status-icon').style.display = 'inline';
    document.getElementById('status-text').style.display = 'inline';
  }


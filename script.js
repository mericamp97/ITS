function uploadCalendar() {
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
  }
  
  function populateTrips() {
    // Logic to populate trips will go here
  }


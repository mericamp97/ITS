const apiEndpoint = 'https://s3xuutsnfwkk5vllnsofeeve7q0vqktm.lambda-url.us-east-1.on.aws/';

// Data to send
const data = {
    origin: "ChIJW-fkx_ga2jERSjkkKeJjaUM",
    destination: "ChIJA5LATO4Z2jER111V-v6abAI",
    mode: "DRIVE",
    arrivalTime: "2024-03-19T23:01:23.045123456Z"
  };

// Make a POST request
fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error with response!!');
    }
    return response.json(); 
  })
  .then(data => {
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
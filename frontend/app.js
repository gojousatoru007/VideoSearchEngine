function searchVideos() {
    const searchInput = document.getElementById('searchInput').value;
  
    // Make a POST request to the server
    fetch('http://localhost:3000/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: searchInput }),
    })
      .then(response => response.json())
      //.then(data => console.log(data))
      .then(results => {
        console.log(results);  // Check the logged results
        displayResults(results);
      })
      .catch(error => console.error('Error:', error));
  }
  

  function displayResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.innerHTML = ''; // Clear previous results
  
    console.log('Results received:', results); // Check if results are received
  
    results.forEach(video => {
      console.log('Creating card for video:', video); // Check if createVideoCard is called with correct data
      const card = createVideoCard(video);
      resultsSection.appendChild(card);
    });
  }
  
  
  // function displayResults(results) {
  //   const resultsSection = document.getElementById('resultsSection');
  //   resultsSection.innerHTML = ''; // Clear previous results
  
  //   // Hardcoded dummy data for testing
  //   const dummyVideo = {
  //     snippet: {
  //       thumbnails: {
  //         default: { url: 'https://placekitten.com/640/360' },
  //       },
  //       title: 'Dummy Video',
  //     },
  //     statistics: {
  //       viewCount: 100,
  //       likeCount: 10,
  //     },
  //   };
  
  //   const card = createVideoCard(dummyVideo);
  //   resultsSection.appendChild(card);
  // }
  


  function createVideoCard(video) {
    const card = document.createElement('div');
    card.classList.add('video-card');
  
    if (video && video.videoInfo && video.videoInfo.snippet && video.videoInfo.snippet.thumbnails && video.videoInfo.snippet.thumbnails.default) {
      const thumbnail = document.createElement('img');
      thumbnail.src = video.videoInfo.snippet.thumbnails.default.url;
      thumbnail.alt = 'Video Thumbnail';
      card.appendChild(thumbnail);
    } else {
      const noThumbnail = document.createElement('p');
      noThumbnail.textContent = 'No thumbnail available';
      card.appendChild(noThumbnail);
    }
  
    if (video && video.videoInfo && video.videoInfo.snippet && video.videoInfo.snippet.title) {
      const title = document.createElement('h2');
      title.textContent = video.videoInfo.snippet.title;
      card.appendChild(title);
    }
  
    if (video && video.videoInfo && video.videoInfo.statistics && video.videoInfo.statistics.viewCount) {
      const viewCount = document.createElement('p');
      viewCount.textContent = `Views: ${video.videoInfo.statistics.viewCount}`;
      card.appendChild(viewCount);
    }
  
    if (video && video.videoInfo && video.videoInfo.statistics && video.videoInfo.statistics.likeCount) {
      const likes = document.createElement('p');
      likes.textContent = `Likes: ${video.videoInfo.statistics.likeCount}`;
      card.appendChild(likes);
    }
  
    if (video && video.videoInfo && video.videoInfo.snippet && video.videoInfo.snippet.publishedAt) {
      const datePublished = document.createElement('p');
      datePublished.textContent = `Published: ${video.videoInfo.snippet.publishedAt}`;
      card.appendChild(datePublished);
    }
  
    return card;
  }
  
  
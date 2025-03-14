// Enable horizontal scrolling with mouse wheel
document.addEventListener('DOMContentLoaded', () => {
    const horizontalScrollContainer = document.querySelector('.horizontal-scroll');
    
    if (horizontalScrollContainer) {
        horizontalScrollContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            horizontalScrollContainer.scrollLeft += e.deltaY;
        });
    }
    
    // Add a subtle trail effect to the cursor (optional)
    const cursor = document.createElement('div');
    cursor.classList.add('cursor-trail');
    document.body.appendChild(cursor);
    
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Initialize Last.fm integration
    fetchNowPlaying();
    setInterval(fetchNowPlaying, 10000); // Update every 10 seconds
});

// Last.fm API integration
const lastFmUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=HeepAIO&api_key=40224015974d85a4dbd7e7a3afa6af24&format=json`;

// Function to format time ago
function timeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp * 1000); // Last.fm timestamps are in seconds
  const diffMs = now - past;
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  } else {
    return 'just now';
  }
}

async function fetchNowPlaying() {
  try {
    const response = await fetch(lastFmUrl);
    const data = await response.json();

    const currentTrack = data.recenttracks.track[0];
    const isNowPlaying = currentTrack['@attr']?.nowplaying;
    
    const listeningStatus = document.getElementById("listening-status");
    const nowPlayingText = document.getElementById("now-playing-text");
    
    if (isNowPlaying) {
      // Update status text
      if (listeningStatus) {
        listeningStatus.textContent = "listening to...";
      }
      
      // Currently playing track
      const trackName = currentTrack.name.toLowerCase();
      const artistName = currentTrack.artist['#text'].toLowerCase();
      
      if(trackName.length + artistName.length >= 39){
        nowPlayingText.textContent = `${(trackName + " by " + artistName).substring(0, 36)}...`;
      } else {
        nowPlayingText.textContent = `${trackName} by ${artistName}`;
      }
    } else {
      // Update status text
      if (listeningStatus) {
        listeningStatus.textContent = "was listening to...";
      }
      
      // Last played track with time ago
      const lastTrack = currentTrack; // The first track is the most recent
      const trackName = lastTrack.name.toLowerCase();
      const artistName = lastTrack.artist['#text'].toLowerCase();
      const timestamp = parseInt(lastTrack.date?.uts || 0);
      
      let timeAgoStr = '';
      if (timestamp) {
        timeAgoStr = ` (${timeAgo(timestamp)})`;
      }
      
      // Format text with track name, artist, and time ago
      const baseText = `${trackName} by ${artistName}`;
      
      if(baseText.length + timeAgoStr.length >= 39){
        // If too long, truncate the track info but keep the time ago
        const availableLength = 36 - timeAgoStr.length;
        nowPlayingText.textContent = `${baseText.substring(0, availableLength)}...${timeAgoStr}`;
      } else {
        nowPlayingText.textContent = `${baseText}${timeAgoStr}`;
      }
    }
  } catch (error) {
    console.error("Error fetching data from Last.fm API:", error);
    const listeningStatus = document.getElementById("listening-status");
    const nowPlayingText = document.getElementById("now-playing-text");
    
    if (listeningStatus) {
      listeningStatus.textContent = "listening status...";
    }
    
    if (nowPlayingText) {
      nowPlayingText.textContent = "Failed to fetch current song.";
    }
  }
}

// Fetch on page load and set interval
document.addEventListener('DOMContentLoaded', () => {
  fetchNowPlaying();
  setInterval(fetchNowPlaying, 10000); // Update every 10 seconds
});
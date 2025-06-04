// Video Storage Module for StudyHub
class VideoStorage {
  constructor() {
    this.STORAGE_PREFIX = 'studyhub_video_';
    this.VIDEOS_KEY = 'studyhub_videos';
    this.videos = JSON.parse(localStorage.getItem(this.VIDEOS_KEY) || '[]');
  }

  // Save video file to localStorage
  saveVideo(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const videoData = {
            id: 'vid_' + Date.now(),
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            data: event.target.result.split(',')[1] // Remove data:application/octet-stream;base64,
          };
          
          // Save the video data to localStorage
          localStorage.setItem(this.STORAGE_PREFIX + videoData.id, JSON.stringify(videoData));
          
          // Update videos list
          this.videos.push({
            id: videoData.id,
            name: videoData.name,
            size: videoData.size,
            type: videoData.type,
            lastModified: videoData.lastModified
          });
          
          this._saveVideosList();
          
          resolve({
            id: videoData.id,
            name: videoData.name,
            size: videoData.size,
            type: videoData.type,
            path: `local:${videoData.id}`
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      // Read file as data URL
      reader.readAsDataURL(file);
    });
  }
  
  // Get video by ID
  getVideo(id) {
    const videoData = localStorage.getItem(this.STORAGE_PREFIX + id);
    return videoData ? JSON.parse(videoData) : null;
  }
  
  // Get all videos
  getAllVideos() {
    return [...this.videos];
  }
  
  // Delete video
  deleteVideo(id) {
    // Remove from localStorage
    localStorage.removeItem(this.STORAGE_PREFIX + id);
    
    // Update videos list
    this.videos = this.videos.filter(video => video.id !== id);
    this._saveVideosList();
    
    return true;
  }
  
  // Save videos list to localStorage
  _saveVideosList() {
    localStorage.setItem(this.VIDEOS_KEY, JSON.stringify(this.videos));
  }
  
  // Get video URL for playback
  getVideoUrl(videoId) {
    if (videoId.startsWith('local:')) {
      const id = videoId.replace('local:', '');
      const video = this.getVideo(id);
      if (video) {
        return `data:${video.type};base64,${video.data}`;
      }
    }
    return videoId; // Return as-is if not a local video
  }
}

// Create a singleton instance
const videoStorage = new VideoStorage();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = videoStorage;
} else {
  window.videoStorage = videoStorage;
}

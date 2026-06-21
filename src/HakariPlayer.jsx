import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, Maximize, Minimize, Volume, Volume2, VolumeX, Settings,
  Rewind, FastForward, Check, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function formatTime(seconds) {
  if (isNaN(seconds)) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function HakariPlayer({ sources, initialLanguage, onProgress, onEnded, userPreferences, autoPlay }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const leftTapRef = useRef({ count: 0, time: 0 });
  const rightTapRef = useRef({ count: 0, time: 0 });
  const seekTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  // Settings Panel State
  const [settingsMenu, setSettingsMenu] = useState('hidden'); // 'hidden', 'main', 'language', 'quality', 'speed'
  const [activeLanguage, setActiveLanguage] = useState(initialLanguage);
  const [activeQuality, setActiveQuality] = useState('Auto');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const [seekOverlay, setSeekOverlay] = useState(null); // { side, amount, id }

  const availableLanguages = Object.keys(sources || {});
  const qualities = ['Auto', '1080p', '720p', '480p'];
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const currentSrc = sources[activeLanguage] || sources[availableLanguages[0]];

  const hideControls = useCallback(() => {
    if (isPlaying && settingsMenu === 'hidden') {
      setShowControls(false);
    }
  }, [isPlaying, settingsMenu]);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  }, [hideControls]);

  useEffect(() => {
    resetControlsTimeout();
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [isPlaying, settingsMenu, resetControlsTimeout]);

  // Handle Hot-Swapping Language without losing state
  const handleLanguageChange = (lang) => {
    if (lang === activeLanguage) return;
    const time = videoRef.current?.currentTime || 0;
    const playing = !videoRef.current?.paused;
    setActiveLanguage(lang);
    if (videoRef.current) {
      videoRef.current.dataset.restoreTime = time;
      videoRef.current.dataset.wasPlaying = playing;
    }
  };

  const handleLoadedData = () => {
    setIsBuffering(false);
    const video = videoRef.current;
    if (!video) return;
    
    if (video.dataset.restoreTime) {
      video.currentTime = parseFloat(video.dataset.restoreTime);
      delete video.dataset.restoreTime;
    }
    
    video.playbackRate = playbackSpeed;
    
    if (video.dataset.wasPlaying === 'true' || autoPlay) {
      video.play().catch(() => {});
      delete video.dataset.wasPlaying;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    const currProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(currProgress || 0);
    if (onProgress) {
      onProgress(currProgress || 0);
    }
  };

  const handleSeekChange = (e) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(parseFloat(e.target.value));
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Double Tap Seeking Logic
  const handleTap = (side, e) => {
    // If the click is on controls, ignore
    if (e.target.closest('.playerControlsBottom') || e.target.closest('.playerSettingsMenu')) return;

    const now = Date.now();
    const ref = side === 'left' ? leftTapRef : rightTapRef;
    const diff = now - ref.current.time;

    if (diff < 300) {
      // Is Double/Triple tap
      ref.current.count += 1;
      const seconds = (ref.current.count + 1) * 10;
      
      if (videoRef.current) {
        const delta = side === 'left' ? -10 : 10;
        videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
      }

      setSeekOverlay({ side, amount: seconds, id: now });

      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
      seekTimeoutRef.current = setTimeout(() => {
        ref.current.count = 0;
        setSeekOverlay(null);
      }, 600);
    } else {
      ref.current.count = 0;
      ref.current.time = now;
      // Single tap -> toggle controls if on mobile, or play/pause
      if (!seekOverlay) {
        setShowControls(prev => !prev);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const muted = !isMuted;
    videoRef.current.muted = muted;
    setIsMuted(muted);
    if (muted) setVolume(0);
    else {
      videoRef.current.volume = 1;
      setVolume(1);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
    setSettingsMenu('main');
  };

  const mapLangLabel = (key) => {
    if (key.toLowerCase().includes('sub')) return 'Japanese';
    if (key.toLowerCase().includes('dub')) return 'English Dub';
    if (key.toLowerCase().includes('hindi')) return 'Hindi Dub';
    if (key.toLowerCase().includes('bangla')) return 'Bangla Dub';
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div 
      className={`hakariPlayerContainer ${isFullscreen ? 'fullscreen' : ''} ${!showControls && isPlaying ? 'hideCursor' : ''}`}
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={currentSrc}
        className="hakariVideoElement"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onLoadedData={handleLoadedData}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={onEnded}
        playsInline
      />

      {/* Seek Overlays */}
      <div className="seekZones">
        <div className="seekZone left" onClick={(e) => handleTap('left', e)} />
        <div className="seekZone right" onClick={(e) => handleTap('right', e)} />
      </div>

      <AnimatePresence>
        {seekOverlay && (
          <motion.div 
            key={seekOverlay.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`seekIndicator ${seekOverlay.side}`}
          >
            <div className="seekRipples">
              {seekOverlay.side === 'left' ? <Rewind size={32} /> : <FastForward size={32} />}
              <span>{seekOverlay.side === 'left' ? '-' : '+'}{seekOverlay.amount}s</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="playerSpinner">
          <div className="spinnerRing" />
        </div>
      )}

      {/* Main Controls Overlay */}
      <div className={`playerControlsOverlay ${showControls || !isPlaying ? 'visible' : ''}`}>
        
        {/* Settings Menu Popup */}
        <AnimatePresence>
          {settingsMenu !== 'hidden' && (
            <motion.div 
              className="playerSettingsMenu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {settingsMenu === 'main' && (
                <div className="settingsList">
                  <button onClick={() => setSettingsMenu('language')}>
                    <span>Language</span>
                    <span className="settingsValue">{mapLangLabel(activeLanguage)}</span>
                  </button>
                  <button onClick={() => setSettingsMenu('quality')}>
                    <span>Quality</span>
                    <span className="settingsValue">{activeQuality}</span>
                  </button>
                  <button onClick={() => setSettingsMenu('speed')}>
                    <span>Speed</span>
                    <span className="settingsValue">{playbackSpeed}x</span>
                  </button>
                </div>
              )}

              {settingsMenu === 'language' && (
                <div className="settingsList">
                  <button className="settingsBack" onClick={() => setSettingsMenu('main')}>
                    <ChevronLeft size={18} /> Language
                  </button>
                  {availableLanguages.map(lang => (
                    <button key={lang} onClick={() => { handleLanguageChange(lang); setSettingsMenu('hidden'); }}>
                      {mapLangLabel(lang)}
                      {activeLanguage === lang && <Check size={16} />}
                    </button>
                  ))}
                </div>
              )}

              {settingsMenu === 'quality' && (
                <div className="settingsList">
                  <button className="settingsBack" onClick={() => setSettingsMenu('main')}>
                    <ChevronLeft size={18} /> Quality
                  </button>
                  {qualities.map(q => (
                    <button key={q} onClick={() => { setActiveQuality(q); setSettingsMenu('hidden'); }}>
                      {q}
                      {activeQuality === q && <Check size={16} />}
                    </button>
                  ))}
                </div>
              )}

              {settingsMenu === 'speed' && (
                <div className="settingsList">
                  <button className="settingsBack" onClick={() => setSettingsMenu('main')}>
                    <ChevronLeft size={18} /> Speed
                  </button>
                  {speeds.map(s => (
                    <button key={s} onClick={() => handleSpeedChange(s)}>
                      {s === 1 ? 'Normal' : `${s}x`}
                      {playbackSpeed === s && <Check size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="playerControlsBottom">
          <div className="progressBarContainer">
            <input 
              type="range" 
              min="0" max="100" step="0.1"
              value={progress} 
              onChange={handleSeekChange}
              className="progressSlider"
              style={{ '--progress': `${progress}%` }}
            />
          </div>

          <div className="controlsRow">
            <div className="controlsLeft">
              <button className="controlBtn" onClick={togglePlay}>
                {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
              </button>
              
              <div className="volumeControl">
                <button className="controlBtn" onClick={toggleMute}>
                  {isMuted || volume === 0 ? <VolumeX size={22} /> : volume < 0.5 ? <Volume2 size={22} /> : <Volume size={22} />}
                </button>
                <input 
                  type="range" min="0" max="1" step="0.05" 
                  value={isMuted ? 0 : volume} 
                  onChange={handleVolumeChange}
                  className="volumeSlider"
                  style={{ '--progress': `${isMuted ? 0 : volume * 100}%` }}
                />
              </div>

              <span className="timeDisplay">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="controlsRight">
              <button className={`controlBtn ${settingsMenu !== 'hidden' ? 'active' : ''}`} onClick={() => setSettingsMenu(prev => prev === 'hidden' ? 'main' : 'hidden')}>
                <Settings size={22} />
              </button>
              <button className="controlBtn" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

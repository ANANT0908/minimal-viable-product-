import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface Video {
  id: string;
  title: string;
  url: string;
}

const videos: Video[] = [
  {
    id: 'lesson1',
    title: 'Intro to AI',
    url: 'https://www.youtube.com/watch?v=S8ukFF6SdGk',
  },
  {
    id: 'lesson2',
    title: 'Deep Learning Basics',
    url: 'https://www.youtube.com/watch?v=aircAruvnKk',
  },
];

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const getVideoId = (url: string): string => {
  const match = url.match(/v=([^&]+)/);
  return match ? match[1] : '';
};

const Dashboard: React.FC = () => {
  const { t } = useTranslation('common');
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const players = useRef<Record<string, any>>({});
  const trackingIntervals = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!document.getElementById('youtube-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API ready');
    };
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setProgressMap(data.progress || {});
          setCompletedMap(data.completed || {});
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!expandedVideoId) return;

    const video = videos.find((v) => v.id === expandedVideoId);
    if (!video) return;

    const iframeId = `yt-player-${video.id}`;
    const progressPercent = progressMap[video.id] || 0;

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        const player = new window.YT.Player(iframeId, {
          events: {
            onReady: () => {
              const trySeek = setInterval(() => {
                const duration = player.getDuration?.();
                if (duration && !isNaN(duration)) {
                  const seekTime = Math.floor((progressPercent / 100) * duration);
                  if (seekTime > 0) {
                    player.seekTo(seekTime, true);
                  }
                  clearInterval(trySeek);
                }
              }, 300);
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                startTracking(video.id, player);
              }
              if (event.data === window.YT.PlayerState.ENDED) {
                stopTracking(video.id);
              }
            },
          },
        });
        players.current[video.id] = player;
      } else {
        setTimeout(initPlayer, 500);
      }
    };

    initPlayer();
  }, [expandedVideoId, progressMap]);

  const startTracking = (videoId: string, player: any) => {
    if (trackingIntervals.current[videoId]) return;

    const interval = setInterval(() => {
      const duration = player.getDuration?.();
      const currentTime = player.getCurrentTime?.();
      if (!duration || !currentTime || isNaN(duration) || isNaN(currentTime)) return;

      const percent = Math.floor((currentTime / duration) * 100);
      setProgressMap((prev) => {
        const current = prev[videoId] || 0;
        return percent > current ? { ...prev, [videoId]: percent } : prev;
      });

      if (userId) {
        updateDoc(doc(db, 'users', userId), {
          [`progress.${videoId}`]: percent,
        });
      }

      if (percent >= 100) {
        stopTracking(videoId);
      }
    }, 3000);

    trackingIntervals.current[videoId] = interval;
  };

  const stopTracking = (videoId: string) => {
    clearInterval(trackingIntervals.current[videoId]);
    delete trackingIntervals.current[videoId];
  };

  const toggleVideo = (id: string) => {
    if (expandedVideoId === id) {
      stopTracking(id);
      setExpandedVideoId(null);
    } else {
      setExpandedVideoId(id);
    }
  };

  const markAsComplete = async (videoId: string) => {
    if (!userId) return;
    await updateDoc(doc(db, 'users', userId), {
      [`completed.${videoId}`]: true,
    });
    setCompletedMap((prev) => ({ ...prev, [videoId]: true }));
  };

  return (
    <div
      style={{
        padding: '2rem',
        width: '800px',
        margin: 'auto',
        fontFamily: 'Segoe UI, sans-serif',
        color: '#1f2937',
      }}
    >
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        📚 {t('course_dashboard')}
      </h2>

      {videos.map((video) => (
        <div
          key={video.id}
          style={{
            marginBottom: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
            padding: '1rem 1.5rem',
          }}
        >
          <div
            onClick={() => toggleVideo(video.id)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong style={{ fontSize: '1.1rem' }}>{video.title}</strong>
            <span style={{ fontSize: '0.95rem', color: '#4b5563' }}>
              {progressMap[video.id] || 0}% watched {completedMap[video.id] && '✅'}
            </span>
          </div>

          {expandedVideoId === video.id && (
            <div style={{ marginTop: '1rem' }}>
              <div
                style={{
                  position: 'relative',
                  paddingBottom: '56.25%',
                  height: 0,
                  overflow: 'hidden',
                  borderRadius: '0.5rem',
                }}
              >
                <iframe
                  id={`yt-player-${video.id}`}
                  src={`https://www.youtube.com/embed/${getVideoId(video.url)}?enablejsapi=1&origin=${window.location.origin}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                  }}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                ></iframe>
              </div>

              <button
                onClick={() => markAsComplete(video.id)}
                style={{
                  marginTop: '1rem',
                  padding: '0.6rem 1.25rem',
                  backgroundColor: completedMap[video.id] ? '#16a34a' : '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: completedMap[video.id] ? 'not-allowed' : 'pointer',
                }}
                disabled={completedMap[video.id]}
              >
                {completedMap[video.id] ? `✅ ${t('completed')}` : t('mark_as_complete')}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;

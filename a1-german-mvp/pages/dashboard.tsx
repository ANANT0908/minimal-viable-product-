'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';

interface Video {
  id: string;
  url: string;
}

const videos: Video[] = [
  { id: 'lesson1', url: 'https://www.youtube.com/watch?v=d54ioeKA-jc&t=77s' },
  { id: 'lesson2', url: 'https://www.youtube.com/watch?v=S8ukFF6SdGk&t=406s' },
];

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const getVideoId = (url: string): string => {
  const match = url.match(/[?&]v=([^&#]+)/);
  return match?.[1] || '';
};

const waitForYT = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
    } else {
      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    }
  });
};

const Dashboard = () => {
  const { t } = useTranslation('common');

  const [userId, setUserId] = useState<string | null>(null);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [loadingCompleteId, setLoadingCompleteId] = useState<string | null>(null);

  const players = useRef<Record<string, any>>({});
  const trackingIntervals = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  useEffect(() => {
    if (!document.getElementById('youtube-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const docRef = doc(db, 'users', user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            setProgressMap(data.progress || {});
            setCompletedMap(data.completed || {});
          }
        } catch (err) {
          console.error('Failed to fetch user data:', err);
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    return () => {
      Object.values(players.current).forEach((player) => player?.destroy?.());
      Object.values(trackingIntervals.current).forEach(clearInterval);
    };
  }, []);

  const toggleVideo = useCallback((id: string) => {
    if (expandedVideoId && players.current[expandedVideoId]) {
      stopTracking(expandedVideoId);
      players.current[expandedVideoId].destroy?.();
      delete players.current[expandedVideoId];
    }
    setExpandedVideoId((prev) => (prev === id ? null : id));
  }, [expandedVideoId]);

  const startTracking = (videoId: string, player: any) => {
    if (trackingIntervals.current[videoId]) return;

    const interval = setInterval(() => {
      const duration = player.getDuration?.();
      const currentTime = player.getCurrentTime?.();
      if (!duration || !currentTime || isNaN(duration) || isNaN(currentTime)) return;

      const percent = Math.floor((currentTime / duration) * 100);
      setProgressMap((prev) => ({ ...prev, [videoId]: percent }));

      if (userId && percent > (progressMap[videoId] || 0)) {
        updateDoc(doc(db, 'users', userId), {
          [`progress.${videoId}`]: percent,
        }).catch(err => console.error('Error updating progress:', err));
      }

      if (percent >= 100) stopTracking(videoId);
    }, 3000);

    trackingIntervals.current[videoId] = interval;
  };

  const stopTracking = (videoId: string) => {
    clearInterval(trackingIntervals.current[videoId]);
    delete trackingIntervals.current[videoId];
  };

  const markAsComplete = async (videoId: string) => {
    if (!userId) {
      console.warn('User not authenticated');
      return;
    }

    const updatedValue = !completedMap[videoId];
    setLoadingCompleteId(videoId);

    try {
      await updateDoc(doc(db, 'users', userId), {
        [`completed.${videoId}`]: updatedValue,
      });

      setCompletedMap((prev) => ({
        ...prev,
        [videoId]: updatedValue,
      }));
    } catch (err: any) {
      console.error(`Error updating completion for ${videoId}:`, err.message, err);
    } finally {
      setLoadingCompleteId(null);
    }
  };

  useEffect(() => {
    if (!expandedVideoId) return;

    const video = videos.find((v) => v.id === expandedVideoId);
    if (!video) return;

    const iframeId = `yt-player-${video.id}`;
    const progressPercent = progressMap[video.id] || 0;

    const initPlayer = async () => {
      await waitForYT();

      const player = new window.YT.Player(iframeId, {
        events: {
          onReady: () => {
            const seek = setInterval(() => {
              const duration = player.getDuration?.();
              if (duration && !isNaN(duration)) {
                const seekTime = Math.floor((progressPercent / 100) * duration);
                if (seekTime > 0) player.seekTo(seekTime, true);
                clearInterval(seek);
              }
            }, 300);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) startTracking(video.id, player);
            if (event.data === window.YT.PlayerState.ENDED) stopTracking(video.id);
          },
        },
      });

      players.current[video.id] = player;
    };

    initPlayer();
  }, [expandedVideoId, progressMap]);

  return (
    <Box sx={{ p: 4, width: '60%', minWidth: 400, mx: 'auto', color: 'text.primary' }}>
      <Typography variant="h4" align="center" mb={4}>
        📚 {t('course.dashboard')}
      </Typography>

      {videos.map((video) => (
        <Paper key={video.id} elevation={3} sx={{ mb: 4, p: 3, borderRadius: 3 }}>
          <Box
            onClick={() => toggleVideo(video.id)}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <Typography fontWeight="bold" fontSize="1.1rem">
              {t(`course.lessons.${video.id}`)}
            </Typography>

            <Typography fontSize="0.95rem" color="text.secondary">
              {progressMap[video.id] || 0}% {t('course.watched')}{' '}
              {completedMap[video.id] && '✅'}
            </Typography>
          </Box>
          <Typography mt={1} color="text.secondary" fontSize="0.95rem">
            {t(`course.lessons.${video.id}_desc`)}
          </Typography>
          {expandedVideoId === video.id && (
            <Box mt={2}>
              <Box
                sx={{
                  position: 'relative',
                  paddingBottom: '56.25%',
                  height: 0,
                  overflow: 'hidden',
                  borderRadius: 2,
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
                />
              </Box>

              <Button
                onClick={() => markAsComplete(video.id)}
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  backgroundColor: completedMap[video.id] ? 'success.main' : 'primary.main',
                }}
                disabled={loadingCompleteId === video.id}
              >
                {completedMap[video.id]
                  ? `✅ ${t('course.completed')}`
                  : t('course.mark_complete')}
              </Button>
            </Box>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default Dashboard;

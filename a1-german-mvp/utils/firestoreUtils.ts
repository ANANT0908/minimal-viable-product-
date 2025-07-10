import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const saveVideoProgress = async (
  userId: string,
  videoId: string,
  progress: number
) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`progress.${videoId}`]: progress,
    });
  } catch (error) {
    console.error('Error saving video progress:', error);
  }
};


export const markVideoComplete = async (userId: string, videoId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`completed.${videoId}`]: true,
    });
  } catch (error) {
    console.error('Error marking video complete:', error);
  }
};

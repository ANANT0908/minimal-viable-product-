import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export const ensureUserDocumentExists = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      email: user.email,
      name: user.displayName || '',
      progress: {},
      completed: {},
      createdAt: new Date(),
    });
  }
};

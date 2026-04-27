import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../firebase';

export function usePlans(tripId) {
  const [plans, setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!tripId) return;

    const q = query(
      collection(db, 'trips', tripId, 'plans'),
      orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPlans(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [tripId]);

  async function addPlan(planData) {
    await addDoc(collection(db, 'trips', tripId, 'plans'), {
      ...planData,
      createdAt: serverTimestamp(),
    });
  }

  async function updatePlan(planId, planData) {
    await updateDoc(doc(db, 'trips', tripId, 'plans', planId), planData);
  }

  async function deletePlan(planId) {
    await deleteDoc(doc(db, 'trips', tripId, 'plans', planId));
  }

  /**
   * Toggle a reaction emoji for a user.
   * Uses arrayUnion / arrayRemove for atomic Firestore updates.
   */
  async function updateReaction(planId, emoji, userId) {
    const planRef    = doc(db, 'trips', tripId, 'plans', planId);
    const plan       = plans.find((p) => p.id === planId);
    const current    = plan?.reactions?.[emoji] ?? [];
    const alreadySet = current.includes(userId);

    await updateDoc(planRef, {
      [`reactions.${emoji}`]: alreadySet
        ? arrayRemove(userId)
        : arrayUnion(userId),
    });
  }

  /**
   * Append a comment to the plan's comments array.
   * @param {string} planId
   * @param {{ text: string, authorName: string, authorId: string }} param
   */
  async function addComment(planId, { text, authorName, authorId }) {
    const planRef = doc(db, 'trips', tripId, 'plans', planId);
    const comment = {
      id:         `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      text:       text.slice(0, 50),
      authorName,
      authorId,
      createdAt:  Date.now(),
    };
    await updateDoc(planRef, { comments: arrayUnion(comment) });
  }

  return { plans, loading, error, addPlan, updatePlan, deletePlan, updateReaction, addComment };
}

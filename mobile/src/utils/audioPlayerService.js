// Pure Mobile Audio Service powered by Expo Audio (New Architecture)
import { createAudioPlayer } from 'expo-audio';

let activePlayer = null;

export function playAudioUrl(source) {
  try {
    if (activePlayer) {
      try {
        activePlayer.pause();
        activePlayer.release();
      } catch (e) {}
      activePlayer = null;
    }
    if (!source) return null;
    activePlayer = createAudioPlayer(source);
    activePlayer.play();
    return activePlayer;
  } catch (e) {
    console.warn('Audio play error:', e);
    return null;
  }
}

export const playAudioSource = playAudioUrl;

export function stopCurrentAudio() {
  if (activePlayer) {
    try {
      activePlayer.pause();
      activePlayer.release();
    } catch (e) {}
    activePlayer = null;
  }
}

export function getActivePlayer() {
  return activePlayer;
}


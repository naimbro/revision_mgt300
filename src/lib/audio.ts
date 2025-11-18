// Efectos de sonido usando Web Audio API

export const playCelebrationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Secuencia ascendente de tonos
    [600, 750, 900].forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = audioContext.currentTime + (i * 0.15);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  } catch (error) {
    console.error('Error playing celebration sound:', error);
  }
};

export const playDisappointmentSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Secuencia descendente de tonos graves
    [400, 300, 200].forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sawtooth';

      const startTime = audioContext.currentTime + (i * 0.2);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  } catch (error) {
    console.error('Error playing disappointment sound:', error);
  }
};

export const playRevealSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    const startTime = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.2);
  } catch (error) {
    console.error('Error playing reveal sound:', error);
  }
};

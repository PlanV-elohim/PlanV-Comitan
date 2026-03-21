/**
 * Plays a premium 'success' magical chord using the Web Audio API.
 * Requires 0 external assets and works instantly.
 */
export const playSuccessSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        const playNote = (hz: number, delayMs: number, type: OscillatorType = 'sine') => {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = type;
                osc.frequency.setValueAtTime(hz, ctx.currentTime);
                
                // Envelope
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05); // Quick attack
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5); // Smooth release
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start();
                osc.stop(ctx.currentTime + 1.5);
            }, delayMs);
        };

        // Upward arpeggio for a positive, rewarding feel (E Major)
        playNote(329.63, 0);       // E4
        playNote(415.30, 80);      // G#4
        playNote(493.88, 160);     // B4
        playNote(659.25, 240, 'triangle'); // E5 (Brighter peak)
    } catch (e) {
        console.warn("Audio playback failed or blocked", e);
    }
};

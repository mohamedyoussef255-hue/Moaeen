/**
 * Audio Processing Utilities for Voice Studio
 * Handles decoding, intelligent speech segmentation (cutting up to 15 min audio to optimal 10-15s),
 * and converting AudioBuffer to standard PCM 16-bit WAV Blob.
 */

export interface AudioSliceResult {
  fullDuration: number; // in seconds
  sliceStart: number; // in seconds
  sliceDuration: number; // in seconds
  optimalWavBlob: Blob;
  previewUrl: string;
}

/**
 * Convert an AudioBuffer into a 16-bit PCM WAV Blob
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = Math.min(buffer.numberOfChannels, 2); // mono or stereo
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // Helper to write string ASCII
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // 1. RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // file size - 8
  writeString(8, 'WAVE');

  // 2. fmt subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size for PCM
  view.setUint16(20, format, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // 3. data subchunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channels & write 16-bit PCM samples
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      // Clamp between -1.0 and 1.0
      sample = Math.max(-1, Math.min(1, sample));
      // Scale to 16-bit signed integer [-32768, 32767]
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Slice an AudioBuffer from startTime to (startTime + duration)
 */
export function sliceAudioBuffer(
  audioCtx: AudioContext,
  sourceBuffer: AudioBuffer,
  startSec: number,
  durationSec: number
): AudioBuffer {
  const sampleRate = sourceBuffer.sampleRate;
  const numChannels = sourceBuffer.numberOfChannels;

  const actualStart = Math.max(0, Math.min(startSec, sourceBuffer.duration));
  const actualDuration = Math.min(durationSec, Math.max(0, sourceBuffer.duration - actualStart));

  const startOffset = Math.floor(actualStart * sampleRate);
  const frameCount = Math.floor(actualDuration * sampleRate);

  const sliced = audioCtx.createBuffer(numChannels, Math.max(1, frameCount), sampleRate);

  for (let c = 0; c < numChannels; c++) {
    const srcData = sourceBuffer.getChannelData(c);
    const destData = sliced.getChannelData(c);
    for (let i = 0; i < frameCount; i++) {
      destData[i] = srcData[startOffset + i] || 0;
    }
  }

  return sliced;
}

/**
 * Intelligent Speech Segment Finder:
 * Scans an AudioBuffer (up to 15 min / 900s) to find the window with the most continuous,
 * high-energy speech (avoiding silence, breath, or background noise).
 * Returns the best start time in seconds for a segment of targetDuration.
 */
export function findBestVoiceSegment(
  sourceBuffer: AudioBuffer,
  targetDuration: number = 12
): number {
  const duration = sourceBuffer.duration;
  if (duration <= targetDuration) {
    return 0;
  }

  const sampleRate = sourceBuffer.sampleRate;
  const channelData = sourceBuffer.getChannelData(0); // analyze primary channel
  const totalSamples = channelData.length;

  // Analysis window step: 1 second intervals
  const stepSec = 1;
  const stepSamples = Math.floor(stepSec * sampleRate);
  const windowSamples = Math.floor(targetDuration * sampleRate);

  let bestStartTime = 0;
  let maxEnergy = -1;

  for (let start = 0; start + windowSamples <= totalSamples; start += stepSamples) {
    // Calculate RMS energy and peak ratio for this window
    let sumSquares = 0;
    // Sub-sample to keep calculation extremely fast even on 15-minute files
    const stride = 16;
    let sampledCount = 0;

    for (let i = start; i < start + windowSamples; i += stride) {
      const val = channelData[i];
      sumSquares += val * val;
      sampledCount++;
    }

    const rms = Math.sqrt(sumSquares / (sampledCount || 1));

    // Slight bias towards middle of recording (avoid initial mic pop or trailing clicks)
    const currentSec = start / sampleRate;
    const centerBias = 1.0 - Math.abs(currentSec - duration * 0.4) / (duration * 2);
    const score = rms * (0.8 + 0.2 * centerBias);

    if (score > maxEnergy) {
      maxEnergy = score;
      bestStartTime = currentSec;
    }
  }

  return Math.round(bestStartTime * 10) / 10;
}

/**
 * Formats seconds into MM:SS format
 */
export function formatAudioDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

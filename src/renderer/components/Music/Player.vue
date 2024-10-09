<template>
  <div class="music-player">
    <div class="track-info">
      <span v-if="currentTrack.name">
        🎵 {{ currentTrack.name }}
      </span>
      <span v-else>
        Nenhuma música selecionada
      </span>
      <button @click="togglePlayPause" :disabled="!currentTrack">
        {{ isPlaying ? '⏸️' : '▶️' }}
      </button>
    </div>

      <section v-if="currentTrack" class="controls" style="display: flex; justify-content: center;align-items: center;">
        <span>{{ formatTime(currentTime) }}</span>

        <div class="progress-container">
          <div class="progress-line"></div>
          
          <div id="waveform"></div>
        </div>

        <span>{{ formatTime(duration) }}</span>

      </section>

      <section class="controls__volume">
          <label for="volume">🔊</label>
          <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          v-model.number="volume"
          @input="changeVolume"
          />
      </section>
  </div>
</template>

<script>
  import { ref, watch, onUnmounted, onMounted } from 'vue';
  import { Howl } from 'howler';
  import WaveSurfer from 'wavesurfer.js';

  export default {
    name: 'MusicPlayer',
    props: {
      currentTrack: {
        type: Object,
        default: { name: '', dataURL: '' }
      },
    },
    setup(props) {
      const isPlaying = ref(false);
      const volume = ref(1.0);
      const currentTime = ref(0);
      const duration = ref(0);
      const sound = ref(null);
      const waveform = ref(null);

      const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60) || 0;
        const secs = Math.floor(seconds % 60) || 0;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
      };

      const playSound = () => {
        if (props.currentTrack && props.currentTrack.dataURL) {
          sound.value = new Howl({
            src: [props.currentTrack.dataURL],
            html5: true,
            volume: volume.value,
            onend: () => {
              isPlaying.value = false;
              currentTime.value = 0;
            },
            onplay: () => {
              isPlaying.value = true;
              duration.value = sound.value.duration();
              requestAnimationFrame(updateCurrentTime);
            },
            onseek: () => {
              requestAnimationFrame(updateCurrentTime);
            },
          });

          sound.value.play();
        }
      };

      const pauseSound = () => {
        if (sound.value && isPlaying.value) {
          sound.value.pause();
          isPlaying.value = false;
        }
      };

      const resumeSound = () => {
        if (sound.value && !isPlaying.value) {
          sound.value.play();
          isPlaying.value = true;
        }
      };

      const togglePlayPause = () => {
        if (isPlaying.value) {
          pauseSound();
        } else {
          resumeSound();
        }
      };

      const changeVolume = () => {
        if (sound.value) {
          sound.value.volume(volume.value);
        }
      };

      const updateCurrentTime = () => {
        if (sound.value && isPlaying.value) {
          currentTime.value = sound.value.seek();
          const progress = currentTime.value / duration.value;
          waveform.value.seekTo(progress);

          const progressLine = document.querySelector('.progress-line');
          if (progressLine) {
            progressLine.style.background = `linear-gradient(to right, #3f51b5 ${progress * 100}%, #ddd 0%)`;
          }

          requestAnimationFrame(updateCurrentTime);
        }
      };

      watch(
        () => props.currentTrack,
        (newTrack) => {
          if (sound.value) {
            sound.value.stop();
          }
          isPlaying.value = false;
          currentTime.value = 0;
          duration.value = 0;
          if (newTrack && newTrack.dataURL) {
            playSound();
            waveform.value.load(newTrack.dataURL);
          }
        }
      );

      onMounted(() => {
        waveform.value = WaveSurfer.create({
          container: '#waveform',
          waveColor: '#ddd',
          progressColor: '#3f51b5',
          cursorColor: '#fff',
          barWidth: 1,
          responsive: true,
          height: 30,
        });

        waveform.value.on('click', (progress) => {
          if (sound.value && duration.value > 0) {
            const newTime = progress * duration.value;

            if (!isNaN(newTime) && isFinite(newTime)) {
              sound.value.seek(newTime); 
              currentTime.value = newTime; 

              if (isPlaying.value) {
                sound.value.play();
              }
            }
          }
        });
      });

      onUnmounted(() => {
        if (sound.value) {
          sound.value.stop();
          sound.value.unload();
        }
        if (waveform.value) {
          waveform.value.destroy();
        }
      });

      return {
        isPlaying,
        volume,
        currentTime,
        duration,
        togglePlayPause,
        changeVolume,
        formatTime,
      };
    },
  };
</script>

<style scoped>
  .music-player {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #1e1e1e;
    color: #ffffff;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.5);
  }

  .track-info {
    font-size: 16px;
  }

  .track-info button {
    cursor: pointer;
    padding: 8px 12px;
    margin-left: 10px;
    background-color: #3f51b5;
    border: none;
    border-radius: 4px;
    color: white;
    transition: background-color 0.3s;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  #waveform {
    width: 300px;
    height: 80px;
    margin: 0 10px;
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .seek-bar-info {
    display: flex;
    align-items: center;
  }

  .seek-bar-info span {
    font-size: 14px;
    margin: 0 10px;
  }

  .controls input[type='range'] {
    width: 100px;
    margin: 0 10px;
  }
  
.progress-container {
  position: relative;
  width: 100%;
  min-width: 300px;
  margin: 10px;
}

.progress-line {
  width: 100%;
  height: 5px;
  background: linear-gradient(to right, #3f51b5 0%, #3f51b5 0%, #ddd 0%);
  transition: height 0.3s ease, background-size 0.3s ease;
}

.progress-container:hover .progress-line {
  height: 0;
}

.progress-container:hover #waveform {
  display: block;
  margin-top: -15px;
  margin-left: -1px;
}


</style>

<template>
  <div>
    <div class="modal" v-if="winner">
      <div class="winner">
        <h5 class="glow">Gewinner der Bertinale 2022</h5>
        <div class="poster-container">
          <div class="poster-image"
               :style="{backgroundImage: `url(${posterCache[winner.name]})` }"></div>
        </div>
        <h1 class="glow">{{ winner.name }}</h1>
        <h5 class="glow">mit {{ winner.score }} Punkten</h5>
      </div>
    </div>
    <div class="modal" v-if="sweet16">
      <video autoplay src="https://thumbs.gfycat.com/HonoredValidCottonmouth-mobile.mp4"></video>
    </div>
    <div class="leaderboard-container" :style="{opacity: winner ? 0 : 1}">
      <Firework ref="firework" v-if="winner"></Firework>
      <div class="leaderboard" :class="{'has-selected': selected}">
        <transition-group
            move-class="leaderboard__item--move"
            v-if="movies.length > 0"
        >
          <LeaderboardItem
              v-for="(movie, index) in sortedMovies"
              :key="movie.id"
              :movie="movie"
              :rank="index + 1"
              :selected="selected === movie"
              @step="handleStep"
              @click="select(movie)"
              @escape="unselect(movie)"
          />
        </transition-group>
        <p class="message" v-else>Nothing to show</p>
      </div>
      <div class="poster" v-if="selected">
        <div class="poster-container" :style="{'opacity': posterVisible ? 1 : 0}">
          <div class="poster-image"
               :style="{backgroundImage: `url(${poster})` }"></div>
          <div class="selected-info glow">
            <div class="points">{{ Math.round(selected.score * 100) / 100 }}</div>
            <div class="history">
              <div v-for="(step, index) in selected.history || []">
                <span v-if="step > 0" style="color: green">+</span>
                <span v-else-if="step < 0" style="color: red">-</span>
                <span @click="selected.history.splice(index, 1); calculateScore(selected)">{{ Math.abs(step) }}</span>
              </div>
            </div>
            <div class="last-step glow" v-if="lastStep !== 0">
              <span v-if="lastStep > 0" style="color: green">+</span>
              <span v-else-if="lastStep < 0" style="color: red">-</span>
              {{ Math.abs(lastStep) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LeaderboardItem from './LeaderboardItem.vue'
import Firework from '@/components/Firework.vue'

export default {
  name: 'Leaderboard',
  components: {
    LeaderboardItem,
    Firework,
  },
  data () {
    return {
      movies: [],
      selected: null,
      posterVisible: false,
      sweet16: false,
      winner: null,
      poster: null,
      posterCache: {},
      lastStep: 0,
    }
  },
  watch: {
    selected () {
      if (this.selected) {
        if (!this.posterCache[this.selected.name]) {
          this.getPoster(this.selected).then(poster => {
            this.posterCache[this.selected.name] = poster
            this.poster = poster
            setTimeout(() => {
              this.posterVisible = true
            }, 1000)
          })
        } else {
          this.poster = this.posterCache[this.selected.name]
          setTimeout(() => {
            this.posterVisible = true
          }, 1000)
        }
      } else {
        this.posterVisible = false
      }
    },
  },
  mounted () {
    document.addEventListener('keyup', e => {
      console.log(e)
      if (e.key === 'h') {
        this.sweet16 = true
        setTimeout(() => {
          this.sweet16 = false
        }, 1500)
      }
      if (e.key === 'f') {
        this.finish()
      }
      if (e.key === 'Escape') {
        this.unfinish()
      }
    })
    fetch('../movies.json')
        .then((res) => res.json())
        .then((res) => {
          console.log(res)
          this.movies = res.map((movie, index) => ({
            ...movie,
            id: index,
            name: movie.title,
            poster: movie.poster,
            score: 0,
          }))
        })
  },
  methods: {
    finish () {
      this.winner = this.sortedMovies[0]
      this.$nextTick().then(() => {
        this.$refs.firework.firework()
      })
    },
    unfinish () {
      this.winner = null
    },
    calculateScore (movie) {
      movie.score = movie.history.reduce((item, carry) => item + carry, 0) / Math.max(movie.history.length, 1)
      movie.score = movie.score < 0 ? 0 : movie.score
    },
    handleStep (event) {
      const { movieId, step } = event
      let movie = this.movies.find((movie) => movie.id === movieId)
      movie.history = movie.history || []
      movie.history.push(step)
      this.calculateScore(movie)
      this.movies = [...this.movies]
      this.downloadLeaderboard()
      this.lastStep = step
      setTimeout(() => {
        this.lastStep = 0
      }, 4000)
    },
    addPoints (movie, points) {
      movie.score += points
      movie.score = movie.score < 0 ? 0 : movie.score
      this.movies = [...this.movies]
    },
    select (movie) {
      this.selected = movie
    },
    unselect () {
      this.selected = null
    },
    getAssetUrl (url) {
      return new URL(url, import.meta.url).href
    },
    async getMovie (movie) {
      const url = new URL('https://api.themoviedb.org/3/search/movie?api_key=64a015ee94412bef16ea9ef83bf3b8e8')
      url.searchParams.append('query', movie.apiTitle || movie.title || movie.name)
      url.searchParams.append('language', 'de-DE')
      if (movie.year) {
        url.searchParams.append('year', movie.year)
      }
      return await fetch(url.toString()).then(res => res.json()).then(data => data.results[0])
    },
    async getPoster (movie) {
      console.log(movie)
      const x = 'https://image.tmdb.org/t/p/w500/' + (await this.getMovie(movie)).poster_path
      console.log(x)
      return x
    },
    downloadLeaderboard () {
      this.downloadJson(JSON.stringify(this.movies), 'leaderboard2022.json')
    },
    downloadJson (data, filename) {
      const file = new Blob([data], { type: 'application/json' })
      if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename)
      else { // Others
        const a = document.createElement('a'),
            url = URL.createObjectURL(file)
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        setTimeout(function () {
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        }, 0)
      }
    },
  },
  computed: {
    sortedMovies () {
      return [...this.movies].sort((a, b) =>
          a.score === b.score
              ? a.id < b.id
                  ? -1
                  : 1
              : a.score > b.score
                  ? -1
                  : 1
      )
    },
  },
}
</script>

<style lang="scss">
@import url("https://fonts.cdnfonts.com/css/gotham");
@import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');

.leaderboard {
  border-radius: 0.5rem;
  font-family: monospace, serif;
  list-style: none;
  width: 80vw;
  max-width: 100vw;
  font-size: 20px;
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(16, 1fr);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 30px;
  transition: column-gap 1s;

  &.has-selected {
    column-gap: 350px;
  }
}

.leaderboard__item--move {
  transition: transform 2s;
  transition-delay: 2s;
}

.message {
  text-align: center;
}

.leaderboard-container {
  display: flex;
  font-family: Audiowide;
  color: white;
  margin: 3rem auto 0;
  padding: 2rem;
  justify-content: center;
  gap: 5rem;
}

.poster {
  position: absolute;
}

.poster-container {
  padding: 0px;
  opacity: 0;
  transition: all 2s;
  transition-delay: 2s;
}

.poster-image {
  width: 300px;
  height: 500px;
  background-size: contain;
  background-repeat: no-repeat;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}

.selected-info {
  font-family: Audiowide;
}

.points {
  text-align: center;
  font-size: 3rem;
}

.last-step {
  text-align: center;
  font-size: 3rem;
  animation: blinker 1s linear infinite;
}

.history {
  font-size: 1.5rem;
}

.modal {
  position: absolute;
  width: 100%;
  left: 0;
  z-index: 99;
  font-family: Gotham;
}

.winner {
  background-color: rgba(0, 0, 0, 0.7);
  padding-block: 20px;
  text-align: center;
  font-size: 40px;
  backdrop-filter: blur(10px);
  font-family: Audiowide, monospace;

  .poster-container {
    opacity: 1;
  }

  .poster-image {
    margin-inline: auto;
  }
}
</style>

<template>
  <div>
    <div class="modal" v-if="winner">
      <div class="winner">
        Winner of the Bertinale 2021
        <h1>{{ winner.name }}</h1>
      </div>
    </div>
    <div class="modal" v-if="sweet16">
      <video autoplay src="https://thumbs.gfycat.com/HonoredValidCottonmouth-mobile.mp4"></video>
    </div>
    <div class="leaderboard-container">
    <Firework ref="firework" v-if="winner"></Firework>
    <div class="leaderboard">
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
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import LeaderboardItem from "./LeaderboardItem.vue";
import Firework from "@/components/Firework.vue";

export default {
  name: "Leaderboard",
  components: {
    LeaderboardItem,
    Firework,
  },
  data() {
    return {
      movies: [],
      selected: null,
      posterVisible: false,
      sweet16: false,
      winner: null,
      poster: null,
    };
  },
  watch: {
    selected() {
      if (this.selected) {
        this.getPoster(this.selected).then(poster => {
          this.poster = poster
          setTimeout(() => {
            this.posterVisible = true
          }, 1000)
        })
      } else {
        this.posterVisible = false
      }
    },
  },
  mounted() {
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
    fetch("../movies.json")
        .then((res) => res.json())
        .then((res) => {
          console.log(res)
          this.movies = res.map((movie, index) => ({
            ...movie,
            id: index,
            name: movie.title,
            poster: movie.poster,
            score: 0,
          }));
        });
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
    handleStep(event) {
      const {movieId, step} = event;
      let movie = this.movies.find((movie) => movie.id === movieId);
      movie.score += step;
      movie.score = movie.score < 0 ? 0 : movie.score;
      this.movies = [...this.movies];
      document.cookie = JSON.stringify(this.movies)
    },
    addPoints(movie, points) {
      movie.score += points;
      movie.score = movie.score < 0 ? 0 : movie.score;
      this.movies = [...this.movies];
    },
    select(movie) {
      this.selected = movie;
    },
    unselect() {
      this.selected = null;
    },
    getAssetUrl (url) {
      return new URL(url, import.meta.url).href
    },
    async getMovie(movie) {
      const url = new URL('https://api.themoviedb.org/3/search/movie?api_key=64a015ee94412bef16ea9ef83bf3b8e8')
      url.searchParams.append('query', movie.apiTitle || movie.title || movie.name)
      url.searchParams.append('language', 'de-DE')
      if (movie.year) {
        url.searchParams.append('year', movie.year)
      }
      return await fetch(url.toString()).then(res => res.json()).then(data => data.results[0])
    },
    async getPoster(movie) {
      console.log(movie)
      const x = 'https://image.tmdb.org/t/p/w500/' + (await this.getMovie(movie)).poster_path
      console.log(x)
      return x
    },
  },
  computed: {
    sortedMovies() {
      return [...this.movies].sort((a, b) =>
          a.score === b.score
              ? a.id < b.id
                  ? -1
                  : 1
              : a.score > b.score
                  ? -1
                  : 1
      );
    },
  },
};
</script>

<style>
@import url("https://fonts.cdnfonts.com/css/gotham");
@import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');

.leaderboard {
  border-radius: 0.5rem;
  font-family: monospace, serif;
  list-style: none;
  width: 80vw;
  max-width: 1000px;
  font-size: 20px;
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(20, 1fr);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 30px;
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

.poster-container {
  padding: 10px;
  opacity: 0;
  transition: all 2s;
  transition-delay: 2s;
}

.poster-image {
  width: 250px;
  height: 460px;
  background-size: contain;
  background-repeat: no-repeat;
}

.poster img {
  width: 200px;
  height: 300px;
}

.modal {
  position: absolute;
  width: 100%;
  left: 0;
  z-index: 99;
  font-family: Gotham;
}

.winner {
  background-color: rgba(255, 255, 255, 0.25);
  padding: 100px;
  text-align: center;
  font-size: 40px;
  backdrop-filter: blur(10px);
}
</style>

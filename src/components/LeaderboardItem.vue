<template>
  <div class="leaderboard__item" :class="{ selected: selected }" @click="focus" @dblclick="inputShown = true; $refs.newScore.focus()">
    <span class="leaderboard__rank">{{ delayedRank }}</span>
    <span class="leaderboard__movie">{{ movie.name }}</span>
    <span class="leaderboard__score">
      {{ Math.round(movie.score * 100) / 100 }}
    </span>
    <input
        ref="newScore"
        v-model="newStep"
        @keyup="typeScore"
        style="width: 0; height: 0; opacity: 0"
    />
  </div>
</template>

<script>
export default {
  name: 'LeaderboardItem',
  props: {
    movie: {
      type: Object,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    selected: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data () {
    return {
      delayedRank: this.rank,
      newStep: '',
      inputShown: false,
    }
  },
  watch: {
    rank () {
      setTimeout(() => {
        this.delayedRank = this.rank
      }, 4000)
    },
    selected () {
      this.inputShown = this.selected
      if (this.selected) {
        setTimeout(() => {
          this.focus()
        }, 500)
        this.focus()
      }
    },
  },
  methods: {
    focus () {
      this.$refs.newScore.focus()
    },
    typeScore (e) {
      if (e.code === 'Escape') {
        this.newStep = ''
        this.$emit('escape')
      }
      if (e.code === 'Enter') {
        if (this.newStep === '') {
          return
        }
        this.inputShown = false
        this.$emit('step', {
          movieId: this.movie.id,
          step: Number.isInteger(parseInt(this.newStep, 10)) ? parseInt(this.newStep, 10) : 0,
        })
        this.newStep = ''
      }
    },
  },
}
</script>

<style>
.leaderboard__item {
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.25rem;
  background: linear-gradient(
      45deg,
      rgba(87, 16, 229, 0.5) 20%,
      rgba(94, 16, 229, 0.98) 100%
  );
  color: white;
  padding: 10px;
  height: 25px;
  cursor: default;
}

.leaderboard__item.selected {
  outline: 2px solid rgba(255, 255, 100, 0.4);
}

.leaderboard__rank {
  font-weight: bold;
  width: 20px;
  display: inline-block;
}

.leaderboard__movie {
  text-align: left;
  text-transform: uppercase;
  margin-left: 20px;
  user-select: none;
}

.leaderboard__score {
  text-align: right;
  font-weight: bold;
  float: right;
  user-select: none;
}

.leaderboard__buttons {
  display: flex;
  justify-content: center;
  width: 30%;
}

.leaderboard__button {
  background: #4000ff;
  border: 1px solid #007bff;
  color: #fff;
  cursor: pointer;
  height: 2rem;
  line-height: 1;
  margin: 0 0.1rem;
  width: 2rem;
}

.leaderboard__button--disabled {
  background: #eee;
  border: 1px solid #ccc;
  color: #ccc;
  cursor: auto;
}
</style>

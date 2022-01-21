<template>
  <div class="leaderboard">
    <transition-group
      move-class="leaderboard__item--move"
      v-if="users.length > 0"
    >
      <LeaderboardItem
        v-for="(user, index) in sortedUsers"
        :key="user.id"
        :user="user"
        :rank="index + 1"
        :selected="selected === user"
        @step="handleStep"
        @click="select(user)"
        @escape="unselect(user)"
      />
    </transition-group>
    <p class="message" v-else>Nothing to show</p>
  </div>
</template>

<script>
import LeaderboardItem from "./LeaderboardItem.vue";

export default {
  name: "Leaderboard",
  components: {
    LeaderboardItem: LeaderboardItem,
  },
  data() {
    return {
      users: [],
      selected: null,
    };
  },
  mounted() {
    fetch("../users.json")
      .then((res) => res.json())
      .then((res) => {
        this.users = res.movies.map((movie, index) => ({
          id: index,
          name: movie,
          score: 0,
        }));
      });
  },
  methods: {
    handleStep(event) {
      const { userId, step } = event;
      let user = this.users.find((user) => user.id === userId);
      user.score += step;
      user.score = user.score < 0 ? 0 : user.score;
      this.users = [...this.users];
    },
    addPoints(user, points) {
      user.score += points;
      user.score = user.score < 0 ? 0 : user.score;
      this.users = [...this.users];
    },
    select(user) {
      this.selected = user;
    },
    unselect(user) {
      this.selected = null;
    },
  },
  computed: {
    sortedUsers() {
      return [...this.users].sort((a, b) =>
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

.leaderboard {
  border-radius: 0.5rem;
  font-family: "Gotham";
  list-style: none;
  margin: 5rem auto 0;
  padding: 2rem;
  width: 80vw;
  max-width: 1000px;
  font-size: 20px;
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(15, 1fr);
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
</style>
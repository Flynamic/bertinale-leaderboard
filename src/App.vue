<template>
  <div>
    <div class="logo">
      <img src="./assets/Bertfinale.png" alt="Bertfinale" width="300">
    </div>
    <Leaderboard :users="users" />
  </div>
</template>

<script>
import Leaderboard from "./components/Leaderboard.vue";

export default {
  name: "App",
  components: {
    Leaderboard: Leaderboard,
  },
  data() {
    return {
      users: {},
    };
  },
  mounted() {
    fetch("../users.json")
      .then((res) => res.json())
      .then((res) => (this.users = res.users))
      .catch((err) => console.error("Error:", err));
  },
};
</script>

<style>
body {
  background-color: rgb(7, 34, 79);
}

.logo {
  margin-top: 2rem;
  text-align: center;
}
</style>

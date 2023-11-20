<template>
    <nav>
      <router-link to="/" active-class="active-tab">Home</router-link>
      <router-link to="/planner" active-class="active-tab">Planner</router-link>
      <router-link to="/about" active-class="active-tab">About</router-link>
    </nav>
  </template>
  
<style scoped>
nav {
    width: 100%;
    overflow: hidden;
    background-color: #333;
}

nav a {
    float: left;
    color: #f2f2f2;
    text-align: center;
    padding: 14px 16px;
    text-decoration: none;
    font-size: 17px;
}

nav a:hover {
    background-color: lightblue;
    color: black;
}

.active-tab {
    background-color: lightblue;
    color: white;
}
</style>
<script setup lang="ts">
import { useRoute } from 'vue-router';
import AppTopbar from './components/AppTopbar.vue';
import AppSidebar from './components/AppSidebar.vue';

const route = useRoute();

// Check if current route is the login page
const isLoginPage = () => route.name === 'login';

</script>

<template>
  <div id="app" class="app-layout">
    <AppTopbar v-if="!isLoginPage()" />
    <div class="main-content">
      <!-- Sidebar -->
      <AppSidebar v-if="!isLoginPage()" />
      <!-- Page content rendered by router -->
      <div class="page-content" :class="{ 'full-width': isLoginPage() }">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style>
html, body, #app {
  width: 100%;
  margin: 0;
  padding: 0;
  /* Adjusted height to allow main-content to take remaining space */
  height: 100%;
  /* Apply a placeholder 'funny' Chinese font. A specific custom font might be needed for the exact desired style. */
  font-family: "Microsoft YaHei UI", "Microsoft YaHei", sans-serif; /* Placeholder - consider a more 'fun' custom font */
}

body {
  background-color: #ffffff;
}

.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Make the layout container take full viewport height */
}

.main-content {
  flex-grow: 1; /* Allow main content to take up remaining vertical space */
  display: flex; /* Arrange sidebar and page content side-by-side */
  gap: 12px; /* Add a gap between sidebar and main content */
  margin-top: 12px; /* Add gap between AppTopbar and main content */
  overflow: hidden; /* Hide overflow if content exceeds viewport */
}

.page-content {
    flex-grow: 1; /* Allow page content to take remaining horizontal space */
    overflow-y: auto; /* Add scroll to page content if it overflows vertically */
    padding: 0; /* Removed incorrect 'px' unit for zero padding */
}

/* Style to make page content full width when sidebar is hidden */
.page-content.full-width {
    padding: 0; /* Remove padding on login page */
    margin: 0; /* Remove margin on login page */
    height: 100vh; /* Take full viewport height */
    width: 100vw; /* Take full viewport width */
    position: fixed; /* Position fixed to cover entire viewport */
    top: 0;
    left: 0;
    z-index: 1000; /* Ensure it's above other elements */
}

/* Remove or adjust styles that might conflict with the new layout */
/* #app styles were moved to .app-layout or adjusted */
</style>

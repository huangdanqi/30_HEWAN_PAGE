<script setup lang="ts">
import { useRoute } from 'vue-router';
import AppTopbar from './components/AppTopbar.vue';
import AppSidebar from './components/AppSidebar.vue';

const route = useRoute();

// Assume the login route is named 'Login' in your router configuration.
// If your login route has a different name, update the condition accordingly.
const isLoginPage = () => route.name === 'Login';

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
    padding: 0; /* Remove padding on login page if desired */
    /* flex-grow: 1 is already set, which should make it full width */
}

/* Remove or adjust styles that might conflict with the new layout */
/* #app styles were moved to .app-layout or adjusted */
</style>

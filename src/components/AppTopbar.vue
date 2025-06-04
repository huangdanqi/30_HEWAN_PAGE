<template>
  <div class="app-topbar">
    <div class="topbar-left">
      <!-- Application Title/Logo -->
      <span class="app-title">核玩科技信息管理平台</span>
    </div>
    <div class="topbar-right">
      <!-- Right side icons and user info -->
      <a-space :size="16">
        <a-tooltip title="Messages">
          <MailOutlined />
        </a-tooltip>
        <a-tooltip title="Notifications">
          <BellOutlined />
        </a-tooltip>
        <!-- User Dropdown -->
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent>
             <a-space :size="4">
               <a-avatar size="small">
                 <template #icon><UserOutlined /></template>
               </a-avatar>
               <span>Admin</span>
               <DownOutlined />
            </a-space>
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item key="login">
                <!-- Assuming a login route exists -->
                <router-link to="/login">Login</router-link>
              </a-menu-item>
              <a-menu-item key="logout" @click="handleLogout">
                Logout
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MailOutlined, BellOutlined, UserOutlined, DownOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth'; // Import the auth store

const router = useRouter();
const authStore = useAuthStore(); // Use the auth store

const handleLogout = () => {
  authStore.logout(router); // Call the logout action from the auth store and pass the router instance
};

// No other complex script logic needed yet
</script>

<style scoped>
.app-topbar {
  height: 60px; /* Example height based on common top bars */
  background-color: #2c3e50; /* Dark background */
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Optional subtle shadow */
}

.topbar-left .app-title {
  font-size: 20px;
  font-weight: bold;
  color: white; /* Ensure title is white */
}

.topbar-right .anticon, .topbar-right span, .topbar-right .ant-dropdown-link {
  color: white; /* Ensure icons, text, and dropdown link are white */
}

.topbar-right .ant-space-item {
   display: flex;
   align-items: center;
}

/* Basic styles for the "funny" look - more comprehensive styling will be in the main layout */
.app-topbar {
  font-family: 'Comic Sans MS', cursive; /* Example funny font - replace with a suitable Chinese one later */
}

.ant-dropdown-link {
    cursor: pointer;
}

/* Style for router-link inside dropdown */
.ant-menu-item a {
    color: inherit; /* Inherit color from parent menu item */
    text-decoration: none; /* Remove underline */
}
</style> 
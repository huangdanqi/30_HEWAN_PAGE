<template>
  <div class="account-title-container">
    <h2>账户信息</h2>
  </div>
</template>

<script setup lang="ts">
// No script logic needed for just a title
</script>

<style scoped>
.account-title-container {
  border: 1px solid #e8e8e8; /* Light grey border */
  padding: 10px 14px; /* Adjusted from 16px 24px * 0.60 */
  margin-bottom: 10px; /* Adjusted from 16px * 0.60 */
  background-color: #fff; /* White background */
  border-radius: 4px; /* Slightly rounded corners */
}

.account-title-container h2 {
  margin: 0; /* Remove default margin from h2 */
  font-size: 12px; /* Adjusted to 12px */
  font-weight: 500; /* Adjust font weight if needed */
  color: rgba(0, 0, 0, 0.85); /* Standard Ant Design text color */
  text-align: left; /* Center the text horizontally */
}
</style> 
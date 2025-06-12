<template>
  <div class="login-page">
    <div class="login-image-container">
      <!-- The background image is now set via CSS -->
    </div>
    <div class="login-form-container">
      <a-card class="login-card" :bordered="false">
        <div class="card-header">
          <h2>核玩科技</h2>
          <h2>信息管理平台</h2>
        </div>
        <a-form
          :model="formState"
          name="login"
          @finish="onFinish"
          @finishFailed="onFinishFailed"
          autocomplete="off"
          layout="vertical"
        >
          <a-form-item
            label="账号 :"
            name="username"
            :rules="[{ required: true, message: '请输入账号!' }]"
          >
            <a-input v-model:value="formState.username" placeholder="请输入账号"></a-input>
          </a-form-item>

          <a-form-item
            label="密码 :"
            name="password"
            :rules="[{ required: true, message: '请输入密码!' }]"
          >
            <a-input-password v-model:value="formState.password" placeholder="请输入密码"></a-input-password>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loading" block>
              登陆
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

interface FormState {
  username: string
  password: string
}

const router = useRouter()
const loading = ref(false)

const formState = reactive<FormState>({
  username: '',
  password: '',
})

const onFinish = async (_values: FormState) => {
  loading.value = true
  try {
    // TODO: Replace with actual API call
    // const response = await loginApi(values)
    // localStorage.setItem('token', response.token)

    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    localStorage.setItem('token', 'dummy-token')

    message.success('登陆成功!')
    router.push('/')
  } catch (error) {
    message.error('登陆失败，请重试！')
  } finally {
    loading.value = false
  }
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
}
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: row; /* Explicitly set flex direction to row */
  height: 100%; /* Ensure full height relative to parent */
  width: 100%; /* Ensure full width relative to parent */
  background: #fff; /* Changed background to white */
  align-items: stretch; /* Ensure children stretch to full height */
  justify-content: center; /* Center content horizontally */
  flex-grow: 1; /* Allow login-page to grow and fill available space */
}

.login-image-container {
  flex: 3; /* Increased flex to make image container wider */
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('./src/assets/images/home_page.png');
  background-size: 100% 100%; /* Force image to cover entire container */
  background-position: center;
  background-repeat: no-repeat;
  padding: 0 !important; /* Ensure no padding */
  margin: 0; /* Ensure no margin */
  height: 100%; /* Ensure it takes full height of its parent */
  min-width: 0; /* Prevent shrinking below content size */
  min-height: 0; /* Prevent shrinking below content size */
}

.login-image-container img {
  vertical-align: top; /* Remove any default vertical alignment space */
}

.login-form-container {
  flex: 1; /* Make form container narrower */
  display: flex;
  flex-direction: column; /* Arrange items in a column */
  justify-content: center; /* Center content vertically within its container */
  align-items: center; /* Align content to the center */
  background: #fff; /* Ensure white background for the form side */
  padding: 60px 20px; /* Reduced vertical padding for better fit without scrolling */
  margin: 0; /* Ensure no margin */
  height: 100%; /* Ensure it takes full height of its parent */
  min-width: 0; /* Prevent shrinking below content size */
  min-height: 0; /* Prevent shrinking below content size */
}

.login-form-container > * {
  margin-top: 0 !important;
}

.login-card {
  width: 90%; /* Make card responsive */
  max-width: 400px; /* Set a specific max-width for the card */
  margin: 0 auto; /* Center the card horizontally */
  box-shadow: none; /* Removed box-shadow */
}

.card-header {
  text-align: center;
  margin-bottom: 32px; /* Increased margin-bottom for better spacing */
  margin-top: 0; /* Set margin-top to 0 to rely on parent padding */
  padding-top: 0; /* Removed !important */
}

.card-header h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 32px; /* Further increased margin for separation from form items */
  margin-top: 0px; /* Force no top margin */
  line-height: 1; /* Remove extra line height space */
}

.ant-card-body {
  padding: 24px 64px 150px 64px; /* Further increased bottom padding to move button lower */
}

/* Adjust form item margin for better spacing */
.ant-form-item {
  margin-bottom: 32px; /* Set consistent margin-bottom for regular items */
  margin-top: 0; /* Rely on container padding for general top spacing */
  padding-top: 0; /* No top padding on item itself */
}

.ant-form-item label {
  /* Removed margin-top: 0 !important; */
  /* Removed padding-top: 0 !important; */
}

/* Style for the login button */
.ant-btn-primary {
  background-color: #3366FF; /* Updated to new blue color */
  border-color: #3366FF;
}

.ant-btn-primary:hover {
   background-color: #40a9ff; /* This might need adjustment based on new blue hover */
   border-color: #40a9ff;
}

/* Adjust margin for the last form item to move the button lower */
.ant-form-item:last-child {
  margin-top: 80px; /* Further increased margin-top to push the button lower */
  margin-bottom: 0; /* Ensure no extra margin, relying on .ant-card-body padding */
}
</style> 
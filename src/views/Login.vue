<template>
  <div class="login-page">
    <div class="login-image-container">
      <!-- Placeholder for the image -->
      <img src="/src/assets/images/download.png" alt="Login Illustration" class="login-illustration"/>
    </div>
    <div class="login-form-container">
      <a-card class="login-card" :bordered="false">
        <div class="card-header">
          <h2>核玩科技</h2>
          <h3>信息管理平台</h3>
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

const onFinish = async (values: FormState) => {
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
  min-height: 100vh;
  background: #f0f2f5;
}

.login-image-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-illustration {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.login-form-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px; /* Added padding to the card */
}

.card-header {
  text-align: center;
  margin-bottom: 24px;
}

.card-header h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-header h3 {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.65);
}

/* Adjust form item margin for better spacing */
.ant-form-item {
  margin-bottom: 20px !important;
}

/* Style for the login button */
.ant-btn-primary {
  /* You might want to adjust the button color to match the image */
  background-color: #1890ff; /* Default Ant Design primary color */
  border-color: #1890ff;
}

.ant-btn-primary:hover {
   background-color: #40a9ff;
   border-color: #40a9ff;
}

/* Remove default padding from form items with no label (like the button) */
.ant-form-item:last-child {
  margin-bottom: 0 !important;
}
</style> 
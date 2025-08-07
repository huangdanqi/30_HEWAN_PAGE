import { createRouter, createWebHistory } from 'vue-router'
import Account from '../views/Account.vue'
import AgentConfiguration from '../views/AgentConfiguration.vue'
import ToolConfiguration from '../views/ToolConfiguration.vue'
import DeviceType from '../views/DeviceType.vue'
import DeviceProduction from '../views/DeviceProduction.vue'
import DeviceManagement from '../views/DeviceManagement.vue'
import Firmware from '../views/Firmware.vue'
import TableDemo from '../views/TableDemo.vue'
import ProductType from '../views/ProductType.vue'
import IPAudio from '../views/IPAudio.vue'
import IPImage from '../views/IPImage.vue'
import IPVideo from '../views/IPVideo.vue'
import MusicResources from '../views/MusicResources.vue'
import BuiltInAlarm from '../views/BuiltInAlarm.vue'
import IPManagement from '../views/IPManagement.vue'
import ModelConfiguration from '../views/ModelConfiguration.vue'
import ToyProduction from '../views/ToyProduction.vue'
import ProductList from '../views/ProductList.vue'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      redirect: '/account'
    },
      {
      path: '/account',
      name: 'account',
      component: Account
      },
      {
      path: '/agent-configuration',
      name: 'agent-configuration',
      component: AgentConfiguration
      },
      {
      path: '/tool-configuration',
      name: 'tool-configuration',
      component: ToolConfiguration
      },
      {
      path: '/device-type',
      name: 'device-type',
      component: DeviceType
      },
      {
      path: '/device-production',
      name: 'device-production',
      component: DeviceProduction
      },
      {
      path: '/device-management',
      name: 'device-management',
      component: DeviceManagement
      },
      {
      path: '/firmware',
      name: 'firmware',
      component: Firmware
      },
      {
      path: '/table-demo',
      name: 'table-demo',
      component: TableDemo
      },
      {
      path: '/product-type',
      name: 'product-type',
      component: ProductType
      },
      {
      path: '/ip-audio',
      name: 'ip-audio',
      component: IPAudio
      },
      {
      path: '/ip-image',
      name: 'ip-image',
      component: IPImage
      },
      {
      path: '/ip-video',
      name: 'ip-video',
      component: IPVideo
      },
      {
      path: '/music-resources',
      name: 'music-resources',
      component: MusicResources
      },
      {
      path: '/built-in-alarm',
      name: 'built-in-alarm',
      component: BuiltInAlarm
      },
      {
      path: '/ip-management',
      name: 'ip-management',
      component: IPManagement
      },
      {
      path: '/model-configuration',
      name: 'model-configuration',
      component: ModelConfiguration
      },
      {
      path: '/toy-production',
      name: 'toy-production',
      component: ToyProduction
      },
      {
      path: '/product-list',
      name: 'product-list',
      component: ProductList
      }
    ]
})

export default router 
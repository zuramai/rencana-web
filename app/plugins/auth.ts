export default defineNuxtPlugin({
  name: 'rencana-auth',
  dependsOn: ['rencana-api'],
  async setup() {
    await useAuth().refresh()
  }
})

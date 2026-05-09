import { reactive } from 'vue'

export const appState = reactive({
  showSideMenu: false,
  toggleSideMenu: () => {
    appState.showSideMenu = !appState.showSideMenu
  },
  closeSideMenu: () => {
    appState.showSideMenu = false
  }
})
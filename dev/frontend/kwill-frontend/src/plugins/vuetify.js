import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'kwillTheme',
    themes: {
      kwillTheme: {
        dark: false, //to turn dark mode on and off
        colors: {
          primary: '#2c9e0f',   
          secondary: '#158f44', 
          accent: '#c0bdb4',    
          error: '#f44336',     
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
    },
  },
    defaults: {
    global: {
      style: {
        fontFamily: "'Playwrite NZ Basic', sans-serif",
      },
    },
  },
})
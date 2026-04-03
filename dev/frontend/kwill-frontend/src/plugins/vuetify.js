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
          primary: '#e66c63',   
          secondary: '#bb3a3a', 
          accent: '#c0bdb4',    
          error: '#f44336',     
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
        variables: {
          // any theme variables for CSS styling go here
        }
      },
      kwillThemeDark: {
        dark: true,
        colors: {
          primary: '#8f3933',   
          secondary: '#8f1515', 
          accent: '#c0bdb4',    
          error: '#f44336',     
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
        variables: {
          // any theme variables for CSS styling go here
        }
      }
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
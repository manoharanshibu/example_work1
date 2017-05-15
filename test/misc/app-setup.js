// import App from 'app/App'
// import config from 'config/config'

//
// App
//
// global.config = config
// global.App = App


global.App = {
    Globals: { sport: 'SOCCER' },
    data: {
        reply: () => {}
    },
    Config: {
        singleSignOn: false,
        tracking: {
            doubleclick: ''
        }
    },
    session: {
        reply: () => {},
        on: () => {}
    },
    bus: {
        on: () => {}
    }
}

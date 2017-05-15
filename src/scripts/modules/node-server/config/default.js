var env = process.env;
module.exports = {
    sportsbook:  env.HTML5_NODE,
    widgets:     env.HTML5_WIDGETS_PATH,
    prefix:      env.HTML5_NODE_PATH,
    rethink: {
        host:    env.RETHINK_HOST,
        port:    env.RETHINK_PORT,
        db:      env.RETHINK_DB,
        authKey: env.RETHINK_PASSWORD
    },
    port:        env.NODE_SERVER_PORT
};

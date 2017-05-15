import io from 'socket.io-client';
import {isLocal} from 'common/util/AppUtil';
const DIVIDER = '::';

export default class CmsSocket {

    constructor(domain, path) {
        this.layoutRoom = 'Layout';

        const socketOptions = {
            transports: ['websocket'],
            'force new connection': true,
            secure: true,
			path
        };

        this.socket = io.connect(domain, socketOptions);

        this.widgetWatcher = {};
        this.widgetProperties = {};
        this.widgetPropertiesOld = {};
    }

    setLayoutAttrs({ route, segment }) {
        this.route = route;
        this.segment = segment;
        this.changeRoute();
    }

    updateFromDelta(room, id, delta, callback) {
        callback(delta.new_val);
    }

    joinRoom(room, eventHandler, id) {
        this.socket.emit('join', room, id);
        this.socket.on(room + ':data', eventHandler);
        this.socket.on(room + ':delta', delta => this.updateFromDelta(room, id, delta, eventHandler));
        this.socket.on(room + ':error', (err) => console.log(err));
    }

    leaveRoom(room, id) {
        this.socket.emit('leave', room, id);
        this.socket.off(room + ':data');
        this.socket.off(room + ':delta');
        this.socket.on(room + ':error', (err) => console.log(err));
    }

    leaveLayoutRoom() {
        if (this.layoutRoom) {
            this.leaveRoom(this.layoutRoom);
        }
    }

    joinLayoutRoom(eventHandler) {
        const id = [ this.route, this.segment ].join(DIVIDER);
        this.joinRoom(this.layoutRoom, eventHandler, id);
    }

    watchSportLayout(eventHandler) {
        this.sportLayoutHandler = eventHandler;
    }

    off() {
        this.leaveLayoutRoom();
    }

    changeRoute() {
        this.leaveLayoutRoom();
        this.joinLayoutRoom(this.sportLayoutHandler);
    }

    createWidgetWatcher(widgetName, eventHandler) {
        this.widgetWatcher[widgetName] = eventHandler;
    }

    watchWidget(widgetName) {
        const oldProperties = this.widgetPropertiesOld[widgetName];
        const newProperties = this.widgetProperties[widgetName];
        const watcher = this.widgetWatcher[widgetName];
        this.leaveRoom(widgetName, oldProperties.id);
        this.joinRoom(widgetName, watcher, newProperties.id);
    }

    setWidgetProperties(widgetName, properties) {
        this.widgetPropertiesOld[widgetName] = _.clone(this.widgetProperties[widgetName]) || {};
        this.widgetProperties[widgetName] = properties || {};
    }

    updateWidgetResource(widgetName, properties) {
        if (_.isEqual(this.widgetProperties[widgetName], properties)) {
            return;
        }
        this.setWidgetProperties(widgetName, properties);
        this.watchWidget(widgetName, properties);
    }
}

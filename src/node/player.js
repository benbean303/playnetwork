import * as pc from 'playcanvas';
import node from './index.js';

import performance from './libs/node-performance.js';

/**
 * @class Player
 * @classdesc Player is created for each pair of a {@link User} and a {@link Room}
 * to which {@link User} has joined. So {@link User} will have as many {@link Player}s
 * as many {@link Room}s it has joined.
 * @extends pc.EventHandler
 * @property {number} id Unique ID of a Player
 * @property {User} user {@link User} to which this {@link Player} belongs.
 * @property {Room} room {@link Room} which this {@link Player} is created for.
 * @property {number} latency Network latency in miliseconds which takes in
 * account networking round-trip as well as {@link Room}'s Application update
 * frequency.
 */

/**
 * @event Player#destroy
 * @description Fired when {@link Player} has been destroyed.
 */

export default class Player extends pc.EventHandler {
    constructor(id, user, room) {
        super();

        this.id = id;
        this.user = user;
        this.room = room;
        this.latency = 0;

        this.on('_pong', () => {
            performance.handlePong(this);
        });

        this.user.once('destroy', this.destroy, this);

        node.channel.send('_routes:add', { type: 'players', id: this.id });
    }

    /**
     * @method send
     * @description Send a named message to a {@link Player}. So {@link User}
     * on client-side knows with which {@link Room} this message is associated with.
     * @param {string} name Name of a message.
     * @param {object|array|string|number|boolean} [data] Optional message data.
     * Must be JSON friendly data.
     */
    send(name, data) {
        this.user._send(name, data, 'player', this.id);
    }

    toData() {
        return {
            id: this.id,
            userData: this.user.toData()
        };
    }

    destroy() {
        this.user.off('destroy', this.destroy, this);
        this.fire('destroy');
        this.off();
        node.channel.send('_routes:remove', { type: 'players', id: this.id });
    }
}
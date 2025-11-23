import fs from 'fs/promises';
import path from 'path';

import { unifyPath } from './utils.js';

class ServerAssets {
    directory = null;

    cache = new Map();

    async initialize(directory) {
        if (!directory) {
            this.directory = null;
            this.cache.clear();
            return;
        }

        this.directory = unifyPath(directory);
    }

    async addApplication(app) {
        if (!this.directory) return;

        const files = await this._collectMetadataFiles(this.directory);
        const roomId = this._getRoomId(app);

        if (roomId !== null) {
            app.once('destroy', () => {
                this._clearCacheForRoom(roomId);
            });
        }

        for (const filePath of files) {
            await this._loadAssetFile(app, filePath, roomId);
        }
    }

    async _collectMetadataFiles(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const results = [];

        for (const entry of entries) {
            const entryPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                results.push(...await this._collectMetadataFiles(entryPath));
            } else if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.includes('-')) {
                results.push(entryPath);
            }
        }

        return results;
    }

    async _loadAssetFile(app, filePath, roomId) {
        try {
            const contents = await fs.readFile(filePath, 'utf8');
            const cacheKey = this._cacheKey(filePath, roomId);
            if (this.cache.get(cacheKey) === contents) return;

            const json = JSON.parse(contents);
            if (!json?.id || !json?.type) {
                console.warn(`Skipping invalid server asset ${filePath}`);
                return;
            }

            if (app.assets.get(json.id)) {
                this.cache.set(cacheKey, contents);
                return;
            }

            const asset = new pc.Asset(json.name || `${json.id}`, json.type, null, json.data || null);
            asset.id = json.id;
            asset.preload = false;

            if (Array.isArray(json.tags)) {
                json.tags.forEach((tag) => asset.tags.add(tag));
            }

            app.assets.add(asset);
            if (json.file?.url) {
                await this._loadFromFile(app, asset, filePath, json.file.url);
            } else {
                asset.loaded = true;
                asset.fire('load', asset);
            }

            this.cache.set(cacheKey, contents);
        } catch (err) {
            console.error(`Failed to load server asset from ${filePath}`, err);
        }
    }

    async _loadFromFile(app, asset, metaPath, relativePath) {
        const handler = app.loader.getHandler(asset.type);
        if (!handler) {
            console.warn(`No handler for asset type ${asset.type}`);
            return;
        }

        const absolutePath = path.resolve(path.dirname(metaPath), relativePath);
        const ext = path.extname(absolutePath).toLowerCase();

        try {
            let data;
            if (ext === '.json' || ext === '.txt') {
                const text = await fs.readFile(absolutePath, 'utf8');
                data = JSON.parse(text);
            } else {
                const buffer = await fs.readFile(absolutePath);
                data = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
            }

            const resource = handler.open(absolutePath, data, asset);
            if (handler.patch) handler.patch(asset, resource);

            asset.resource = resource;
            asset.loaded = true;
            asset.fire('load', asset);
        } catch (err) {
            console.error(`Failed to load server asset file ${absolutePath}`, err);
        }
    }

    _cacheKey(filePath, roomId) {
        return `${roomId ?? 'global'}::${filePath}`;
    }

    _getRoomId(app) {
        if (app?.room && app.room.id !== undefined && app.room.id !== null) {
            return app.room.id;
        }
        return null;
    }

    _clearCacheForRoom(roomId) {
        if (roomId === null) return;
        for (const key of this.cache.keys()) {
            if (key.startsWith(`${roomId}::`)) {
                this.cache.delete(key);
            }
        }
    }
}

export default new ServerAssets();



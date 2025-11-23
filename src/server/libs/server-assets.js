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
        for (const filePath of files) {
            await this._loadAssetFile(app, filePath);
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

    async _loadAssetFile(app, filePath) {
        try {
            const contents = await fs.readFile(filePath, 'utf8');
            if (this.cache.get(filePath) === contents) return;

            const json = JSON.parse(contents);
            if (!json?.id || !json?.type) {
                console.warn(`Skipping invalid server asset ${filePath}`);
                return;
            }

            if (app.assets.get(json.id)) {
                this.cache.set(filePath, contents);
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

            this.cache.set(filePath, contents);
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
}

export default new ServerAssets();



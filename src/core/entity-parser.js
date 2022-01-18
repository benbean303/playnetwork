import scripts from './scripts.js';

const valueToRaw = {
    vec2: (value) => {
        if (! value) return null;
        return [ value.x, value.y ];
    },
    vec3: (value) => {
        if (! value) return null;
        return [ value.x, value.y, value.z ];
    },
    vec4: (value) => {
        if (! value) return null;
        return [ value.x, value.y, value.z, value.w ];
    },
    rgb: (value) => {
        if (! value) return null;
        return [ value.r, value.g, value.b ];
    },
    rgba: (value) => {
        if (! value) return null;
        return [ value.r, value.g, value.b, value.a ];
    },
    asset: (value) => {
        if (value === null || typeof(value) === 'number')
            return value;

        if (value instanceof pc.Asset)
            return value.id;

        return null;
    },
    entity: (value) => {
        if (value === null || typeof(value) === 'string')
            return value;

        if (value instanceof pc.Entity)
            return value.getGuid();

        return null;
    },
    arrayClone: (value) => {
        if (! value) return null;
        return value.slice(0);
    }
};

const componentsSchema = {
    camera: {
        enabled: null,
        fov: null,
        projection: null,
        clearColor: valueToRaw.rgba,
        clearColorBuffer: null,
        clearDepthBuffer: null,
        frustumCulling: null,
        orthoHeight: null,
        farClip: null,
        nearClip: null,
        priority: null,
        rect: valueToRaw.vec4,
        layers: valueToRaw.arrayClone
    },
    collision: {
        enabled: null,
        type: null,
        halfExtents: valueToRaw.vec3,
        radius: null,
        axis: null,
        height: null,
        asset: valueToRaw.asset,
        renderAsset: valueToRaw.asset
    },
    screen: {
        enabled: null,
        screenSpace: null,
        scaleMode: null,
        scaleBlend: null,
        resolution: valueToRaw.vec2,
        referenceResolution: valueToRaw.vec2
    },
    layoutgroup: {
        enabled: null,
        orientation: null,
        reverseX: null,
        reverseY: null,
        alignment: valueToRaw.vec2,
        padding: valueToRaw.vec4,
        spacing: valueToRaw.vec2,
        widthFitting: null,
        heightFitting: null,
        wrap: null,
    },
    element: {
        enabled: null,
        width: null,
        height: null,
        anchor: valueToRaw.vec4,
        pivot: valueToRaw.vec2,
        margin: valueToRaw.vec4,
        alignment: valueToRaw.vec2,
        autoWidth: null,
        autoHeight: null,
        type: null,
        rect: valueToRaw.vec4,
        rtlReorder: null,
        unicodeConverter: null,
        materialAsset: null,
        // material: ,
        color: valueToRaw.rgba,
        opacity: null,
        textureAsset: null,
        // texture: ,
        spriteAsset: null,
        // sprite: ,
        spriteFrame: null,
        pixelsPerUnit: null,
        spacing: null,
        lineHeight: null,
        wrapLines: null,
        layers: valueToRaw.arrayClone,
        fontSize: null,
        minFontSize: null,
        maxFontSize: null,
        autoFitWidth: null,
        autoFitHeight: null,
        maxLines: null,
        fontAsset: null,
        // font: ,
        useInput: null,
        batchGroupId: null,
        mask: null,
        outlineColor: valueToRaw.rgba,
        outlineThickness: null,
        shadowColor: valueToRaw.rgba,
        shadowOffset: valueToRaw.vec2,
        enableMarkup: null,
        key: null,
        text: null
    },
    button: {
        enabled: null,
        active: null,
        imageEntity: null,
        hitPadding: valueToRaw.vec4,
        transitionMode: null,
        hoverTint: valueToRaw.rgba,
        pressedTint: valueToRaw.rgba,
        inactiveTint: valueToRaw.rgba,
        fadeDuration: null,
        hoverSpriteAsset: valueToRaw.asset,
        hoverSpriteFrame: null,
        pressedSpriteAsset: valueToRaw.asset,
        pressedSpriteFrame: null,
        inactiveSpriteAsset: valueToRaw.asset,
        inactiveSpriteFrame: null,
        hoverTextureAsset: valueToRaw.asset,
        pressedTextureAsset: valueToRaw.asset,
        inactiveTextureAsset: valueToRaw.asset
    },
    rigidbody: {
        enabled: null,
        mass: null,
        linearDamping: null,
        angularDamping: null,
        linearFactor: valueToRaw.vec3,
        angularFactor: valueToRaw.vec3,
        friction: null,
        rollingFriction: null,
        restitution: null,
        type: null,
        group: null,
        mask: null
    },
    render: {
        enabled: null,
        material: () => {
            return null;
        },
        asset: valueToRaw.asset,
        materialAssets: valueToRaw.arrayClone,
        castShadows: null,
        receiveShadows: null,
        castShadowsLightmap: null,
        lightmapped: null,
        lightmapSizeMultiplier: null,
        renderStyle: null,
        type: null,
        layers: valueToRaw.arrayClone,
        isStatic: null,
        batchGroupId: null
    },
    model: {
        enabled: null,
        type: null,
        asset: valueToRaw.asset,
        materialAsset: valueToRaw.asset,
        castShadows: null,
        castShadowsLightmap: null,
        receiveShadows: null,
        lightmapped: null,
        lightmapSizeMultiplier: null,
        isStatic: null,
        layers: valueToRaw.arrayClone,
        batchGroupId: null
    },
    anim: function(component) {
        return {
            activate: null,
            animationAssets: component.originalData.animationAssets,
            layerIndices: null,
            layers: valueToRaw.arrayClone,
            parameters: null,
            playing: null,
            rootBone: null,
            speed: null,
            stateGraph: null,
            stateGraphAsset: () => valueToRaw.asset(component.originalData.stateGraphAsset),
            targets: null
        }
    },
    sound: function(component) {
        return {
            data: null,
            distanceModel: null,
            enabled: null,
            maxDistance: null,
            pitch: null,
            positional: null,
            refDistance: null,
            rollOffFactor: null,
            slots: () => component.originalData.slots,
            volume: null,
        }
    },
    light: {
        enabled: null,
        bake: null,
        bakeDir: null,
        affectDynamic: null,
        affectLightmapped: null,
        isStatic: null,
        color: valueToRaw.rgb,
        intensity: null,
        type: null,
        shadowDistance: null,
        range: null,
        innerConeAngle: null,
        outerConeAngle: null,
        shape: null,
        falloffMode: null,
        castShadows: null,
        shadowUpdateMode: null,
        shadowType: null,
        shadowResolution: null,
        shadowBias: null,
        normalOffsetBias: null,
        vsmBlurMode: null,
        vsmBlurSize: null,
        vsmBias: null,
        cookieAsset: null,
        cookieIntensity: null,
        cookieFalloff: null,
        cookieChannel: null,
        cookieAngle: null,
        cookieScale: valueToRaw.vec2,
        cookieOffset: valueToRaw.vec2,
        layers: valueToRaw.arrayClone,
        numCascades: null,
        cascadeDistribution: null
    },
    script: {
        enabled: null,
        order: function(value, script) {
            const names = script._scripts.map((v) => { return v.__scriptType.__name });

            Object.keys(script._scriptsIndex).forEach((key) => {
                if (!scripts.registry._scripts[key]) {
                    names.push(key);
                }
            });

            return names;
        },
        scripts: function(_scripts, component) {
            const data = { };

            for(let i = 0; i < _scripts.length; i++) {
                const scriptName = _scripts[i].__scriptType.__name;
                const attributes = { };

                for(const attrName in _scripts[i].__scriptType.attributes.index) {
                    let value = null;
                    let valueRaw = _scripts[i].__attributes[attrName];
                    const attrType = _scripts[i].__scriptType.attributes.index[attrName].type;
                    const attrArray = _scripts[i].__scriptType.attributes.index[attrName].array;

                    switch(attrType) {
                        case 'boolean':
                        case 'number':
                        case 'string':
                            if (attrArray) {
                                value = valueRaw.slice(0);
                            } else {
                                value = valueRaw;
                            }
                            break;
                        case 'vec2':
                        case 'vec3':
                        case 'vec4':
                        case 'rgb':
                        case 'rgba':
                        case 'entity':
                        case 'asset':
                            if (attrArray) {
                                value = valueRaw.map((v) => { return valueToRaw[attrType](v); });
                            } else {
                                value = valueToRaw[attrType](valueRaw);
                            }
                            break;
                        // curve
                        case 'json':
                            value = valueRaw;
                            break;
                    }

                    attributes[attrName] = value;
                }

                data[scriptName] = {
                    enabled: _scripts[i]._enabled,
                    attributes: attributes
                }
            }

            for (const key in component._scriptsData) {
                if (data[key] || scripts.registry._scripts[key])
                    continue;

                const v = component._scriptsData[key];

                data[key] = {
                    enabled: v.enabled,
                    attributes: v.attributes
                }
            }

            return data;
        }
    }
};

function entityToData(entity) {
    const guid = entity.getGuid();
    const position = entity.getLocalPosition();
    const rotation = entity.getLocalEulerAngles();
    const scale = entity.getLocalScale();

    const components = { };

    for(const name in componentsSchema) {
        if (! entity[name]) continue;
        let fields = componentsSchema[name];

        if (typeof(fields) === 'function')
            fields = fields(entity[name]);

        const component = entity[name];
        components[name] = { };
        
        for(let fieldName in fields) {
            const field = fields[fieldName];

            if (typeof(field) === 'function') {
                components[name][fieldName] = field(component[fieldName], component);
            } else {
                components[name][fieldName] = component[fieldName];
            }
        }
    }

    const children = [ ];
    for(let i = 0; i < entity.children.length; i++) {
        if (! (entity.children[i] instanceof pc.Entity))
            continue;

        children.push(entity.children[i].getGuid());
    }

    return {
        name: entity.name,
        parent: entity.parent.getGuid(),
        resource_id: guid,
        tags: entity.tags.list(),
        enabled: entity._enabled,
        components: components,
        position: valueToRaw.vec3(position),
        rotation: valueToRaw.vec3(rotation),
        scale: valueToRaw.vec3(scale),
        children: children
    };
};

export default entityToData;

// @flow
import assert from 'assert';
import {mat4} from 'gl-matrix';
import {mercatorXfromLng, mercatorYfromLat, mercatorZfromAltitude} from '../mercator_coordinate.js';
import LngLat from '../lng_lat.js';
import EXTENT from '../../data/extent.js';
import {Aabb} from '../../util/primitives.js';

class MercatorTileTransform {
    _tr: Transform;
    _worldSize: number;

    constructor(tr: Transform, worldSize: number) {
        this._tr = tr;
        this._worldSize = worldSize;
    }

    createTileMatrix(id: UnwrappedTileID): Float64Array {
        const canonical = id.canonical;
        const zoomScale = Math.pow(2, canonical.z);
        const scale = this._worldSize / zoomScale;
        const unwrappedX = canonical.x + zoomScale * id.wrap;

        const posMatrix = mat4.identity(new Float64Array(16));
        mat4.translate(posMatrix, posMatrix, [unwrappedX * scale, canonical.y * scale, 0]);
        mat4.scale(posMatrix, posMatrix, [scale / EXTENT, scale / EXTENT, 1]);

        return posMatrix;
    }

    createRenderTileMatrix(id: UnwrappedTileID): Float64Array {

    }

    createLabelPlaneMatrix(id: UnwrappedTileID): Float64Array {

    }

    tileAabb(id: UnwrappedTileID, z: number, min: number, max: number) {
        assert(z >= id.canonical.z);
        const numTiles = 1 << z;
        const zScale = 1 << (z - id.canonical.z);
        const wrap = id.wrap;

        const xMin = wrap * numTiles + id.canonical.x * zScale;
        const xMax = wrap * numTiles + (id.canonical.x + 1) * zScale;
        const yMin = id.canonical.y * zScale;
        const yMax = (id.canonical.y + 1) * zScale;

        return new Aabb(
            [xMin, yMin, min],
            [xMax, yMax, max]);
    }

    cullTile(aabb: Aabb, id: CanonicalTileID, camera: FreeCamera): boolean {
        return true;
    }
};

export default {
    name: 'mercator',
    //center: [0, 0],
    project(lng: number, lat: number) {
        const x = mercatorXfromLng(lng);
        const y = mercatorYfromLat(lat);
        return {x, y, z: 0};
    },
    requiresDraping: false,
    supportsWorldCopies: true,
    zAxisUnit: "meters",

    pixelsPerMeter(lat: number, worldSize: number) {
        return mercatorZfromAltitude(1, lat) * worldSize;
    },

    createTileTransform(tr: Transform, worldSize: number): TileTransform {
        return new MercatorTileTransform(tr, worldSize);
    },

//    unproject(x: number, y: number) {
//        return new LngLat(
//            lngFromMercatorX(x),
//            latFromMercatorY(y));
//    }
};
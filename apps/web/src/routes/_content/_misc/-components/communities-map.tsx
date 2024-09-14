import { useNavigate } from '@tanstack/react-router';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import OpenLayerMap from 'ol/Map.js';
import type { Pixel } from 'ol/pixel.js';
import { transform } from 'ol/proj.js';
import OSM from 'ol/source/OSM.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Circle as CircleStyle, Fill, Icon, Style } from 'ol/style.js';
import View from 'ol/View.js';
import { useEffect } from 'react';

interface CommunitiesMapProps {
  communities: Array<{
    id: number;
    name: string;
    lat: number;
    lng: number;
  }>;
}

export const CommunitiesMap = ({ communities }: CommunitiesMapProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const map = new OpenLayerMap({
      target: 'communities-map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: transform([-100, 40], 'EPSG:4326', 'EPSG:3857'), // Centro del mapa
        zoom: 2,
      }),
    });

    const markers = communities.map((community) => {
      const coordinate = transform(
        [community.lng, community.lat],
        'EPSG:4326',
        'EPSG:3857',
      );
      const feature = new Feature(new Point(coordinate));

      feature.set('communityId', community.id);

      const styles = [
        new Style({
          image: new CircleStyle({
            radius: 11,
            fill: new Fill({
              color: 'rgba(218, 107, 9, 0.6)',
            }),
          }),
        }),

        new Style({
          image: new CircleStyle({
            radius: 9, // Tamaño del círculo blanco
            fill: new Fill({
              color: 'white', // Color del círculo
            }),
          }),
        }),

        new Style({
          image: new Icon({
            src: '/src/assets/icons/orange_pill_color.svg',
            scale: 0.03,
            anchor: [0.5, 1.2],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
          }),
        }),
      ];

      feature.setStyle(styles);
      return feature;
    });

    const vectorSource = new VectorSource({
      features: markers,
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    map.addLayer(vectorLayer);

    map.on('click', function (evt: { pixel: Pixel }) {
      const feature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => feature,
      );
      if (feature) {
        const communityId = feature.get('communityId');
        if (communityId) {
          navigate({
            to: '/resources/builders/$builderId',
            params: {
              builderId: communityId.toString(),
            },
          });
        }
      }
    });

    return () => {
      map.setTarget(undefined);
    };
  }, [communities, navigate]);

  return (
    <div id="communities-map" style={{ height: '500px', width: '100%' }} />
  );
};

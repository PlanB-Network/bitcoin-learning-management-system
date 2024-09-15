import { useNavigate } from '@tanstack/react-router';
import { Attribution, Zoom, defaults as defaultControls } from 'ol/control.js';
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
          source: new OSM({
            attributions: [],
          }),
        }),
      ],
      view: new View({
        center: transform([0, 30], 'EPSG:4326', 'EPSG:3857'),
        zoom: 2,
      }),
      controls: defaultControls({ zoom: false }).extend([
        new Zoom({
          className: 'custom-zoom-controls',
        }),
        new Attribution({
          collapsible: false,
          className: 'custom-attribution',
        }),
      ]),
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
            radius: 9,
            fill: new Fill({
              color: 'white',
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

    const zoomControls = document.querySelector('.custom-zoom-controls');
    const attributionControl = document.querySelector('.custom-attribution');

    if (zoomControls) {
      const buttons = Array.prototype.slice.call(
        zoomControls.querySelectorAll('button'),
      ) as HTMLButtonElement[];
      for (const button of buttons) {
        button.classList.add(
          'w-8',
          'h-8',
          'flex',
          'items-center',
          'justify-center',
          'bg-white',
          'text-black',
          'rounded',
          'shadow-sm',
        );
      }

      zoomControls.classList.add(
        'absolute',
        'top-4',
        'left-4',
        'z-10',
        'p-1',
        'bg-white',
        'rounded-lg',
        'shadow-lg',
        'flex',
        'flex-col',
        'gap-1',
      );
    }

    if (attributionControl) {
      attributionControl.classList.add(
        'absolute',
        'bottom-0',
        'right-0',
        'bg-white',
        'p-2',
        'rounded-md',
        'text-xs',
        'opacity-80',
      );
    }

    return () => {
      map.setTarget(undefined);
    };
  }, [communities, navigate]);

  return (
    <div
      id="communities-map"
      className="w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden relative"
    />
  );
};

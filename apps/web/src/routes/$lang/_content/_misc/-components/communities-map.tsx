import { useNavigate } from '@tanstack/react-router';
import { Attribution, defaults as defaultControls, Zoom } from 'ol/control.js';
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

import OrangePillPath from '#src/assets/icons/orange_pill_color.svg';
import { formatNameForURL } from '#src/utils/string.ts';

interface CommunitiesMapProps {
  communities: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
  }>;
}

export const CommunitiesMap = ({ communities }: CommunitiesMapProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const map = new OpenLayerMap({
      controls: defaultControls({ zoom: false }).extend([
        new Zoom({
          className: 'custom-zoom-controls',
        }),
        new Attribution({
          className: 'custom-attribution',
          collapsible: false,
        }),
      ]),
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: [],
          }),
        }),
      ],
      target: 'communities-map',
      view: new View({
        center: transform([0, 30], 'EPSG:4326', 'EPSG:3857'),
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
      feature.set('communityName', community.name);

      const styles = [
        new Style({
          image: new CircleStyle({
            fill: new Fill({
              color: 'rgba(218, 107, 9, 0.6)',
            }),
            radius: 11,
          }),
        }),
        new Style({
          image: new CircleStyle({
            fill: new Fill({
              color: 'white',
            }),
            radius: 9,
          }),
        }),
        new Style({
          image: new Icon({
            anchor: [0.5, 1.2],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 0.03,
            src: OrangePillPath,
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

    map.on('click', (evt: { pixel: Pixel }) => {
      const feature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => feature,
      );
      if (feature) {
        const communityId = feature.get('communityId');
        const communityName = feature.get('communityName');
        if (communityId) {
          const projectId = communityId.toString();
          const projectName = formatNameForURL(communityName);
          navigate({
            to: `/resources/projects/${projectName}-${projectId}`,
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
          'shadow-xs',
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

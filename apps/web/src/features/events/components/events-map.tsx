/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import type { Coordinate } from 'ol/coordinate.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import OpenLayerMap from 'ol/Map.js';
import type MapBrowserEvent from 'ol/MapBrowserEvent.js';
import { transform } from 'ol/proj.js';
import OSM from 'ol/source/OSM.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Icon, Style } from 'ol/style.js';
import View from 'ol/View.js';
import 'ol/ol.css';
import { useEffect, useState } from 'react';

import type {
  EventLocation,
  EventPayment,
  JoinedEvent,
  UserEvent,
} from '@sovereign-university/types';
import { cn } from '@sovereign-university/ui';

import { trpc } from '#src/utils/trpc.ts';

import { EventCard } from './event-card.tsx';

type CourseType =
  | 'course'
  | 'lecture'
  | 'conference'
  | 'exam'
  | 'meetup'
  | 'workshop';

interface EventsMapProps {
  events: JoinedEvent[];
  eventPayments: EventPayment[] | undefined;
  userEvents: UserEvent[] | undefined;
  openAuthModal: () => void;
  isLoggedIn: boolean;
  setIsPaymentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPaymentModalData: React.Dispatch<
    React.SetStateAction<{
      eventId: string | null;
      satsPrice: number | null;
      accessType: 'physical' | 'online' | 'replay' | null;
    }>
  >;
  conversionRate: number | null;
}

interface MapState {
  center: Coordinate;
  zoom: number;
}

interface EventGroup {
  placeId: number;
  coordinate: Coordinate;
  location: EventLocation;
  events: JoinedEvent[];
}

function groupCountries(
  events: JoinedEvent[],
  locations?: EventLocation[],
  filter?: string[],
): EventGroup[] | null {
  if (!locations?.length || !events?.length) {
    return null;
  }

  const locationsMap = new Map(locations.map((e) => [e.name, e]));
  const groupedByLocationEvents = new Map<number, EventGroup>();

  const now = Date.now();
  for (const event of events) {
    // Skip past events
    const startDate = new Date(event.startDate).getTime();
    if (now > startDate) {
      continue;
    }

    // Skip events that are excluded by filter
    if (filter?.length && (!event.type || !filter?.includes(event.type))) {
      continue;
    }

    if (!event.addressLine1) {
      continue;
    }

    const location = locationsMap.get(event.addressLine1);
    if (!location) {
      continue;
    }

    const group = groupedByLocationEvents.get(location.placeId);
    if (group) {
      group.events.push(event);
    } else {
      groupedByLocationEvents.set(location.placeId, {
        placeId: location.placeId,
        coordinate: [location.lng, location.lat],
        events: [event],
        location,
      });
    }
  }

  return [...groupedByLocationEvents.values()];
}

const osmLayer = new TileLayer({
  preload: Number.POSITIVE_INFINITY,
  source: new OSM({ attributions: [] }),
});

function createCounterStyle(count: number) {
  const src =
    'data:image/svg+xml;base64,' +
    btoa(`\
<svg width="48" height="79" viewBox="0 0 48 79" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g>
    <g filter="url(#filter_1)">
      <rect x="8" y="38" width="32" height="32" rx="16" fill="white"/>
      <rect x="8.5" y="38.5" width="31" height="31" rx="15.5" stroke="#E5E7EB"/>
      <text x="24" y="60" font-family="Rubik" font-size="18" text-anchor="middle" fill="#374151">${count}</text>
    </g>

    <g>
      <rect x="19.437" y="7.97662" width="11.0446" height="26.9979" fill="white"/>
      <path d="M24.6494 22.3049H23.3406V27.9595H25.0228C25.527 27.9595 25.9043 27.8181 26.1506 27.5466C26.397 27.2752 26.524 26.8011 26.524 26.132V24.5262C26.524 23.6889 26.3816 23.1116 26.0852 22.7905C25.7888 22.4693 25.3076 22.3011 24.6494 22.3011V22.3049Z" fill="#FF5C00"/>
      <path d="M25.7888 19.2195C26.0736 18.9252 26.2161 18.4243 26.2161 17.7285V16.7C26.2161 15.4422 25.7234 14.8113 24.7418 14.796H23.3329V19.6669H24.4839C25.0651 19.6669 25.5078 19.5139 25.7926 19.2157L25.7888 19.2195Z" fill="#FF5C00"/>
      <path d="M24.7379 0C19.9147 0 16 3.88444 16 8.67881V33.66C16 38.4506 19.9109 42.3388 24.7379 42.3388C29.5611 42.3388 33.4759 38.4544 33.4759 33.66V8.67881C33.4759 3.88826 29.565 0 24.7379 0ZM29.4264 26.2238C29.4264 27.6498 29.0492 28.7318 28.3024 29.4774C27.8328 29.9438 27.2284 30.2611 26.4894 30.437V31.0908C26.4894 31.5572 26.1044 31.9395 25.6348 31.9395C25.1652 31.9395 24.7764 31.5572 24.7764 31.0908V30.5938H23.3329V31.0908C23.3329 31.5572 22.948 31.9395 22.4784 31.9395C22.0088 31.9395 21.6238 31.5572 21.6238 31.0908V30.5938H21.3582C20.7385 30.5938 20.4267 30.2841 20.4267 29.6685V13.087C20.4267 12.4715 20.7385 12.1618 21.3582 12.1618H21.6238V11.2442C21.6238 10.7778 22.0088 10.3955 22.4784 10.3955C22.948 10.3955 23.3329 10.7778 23.3329 11.2442V12.1618H24.7764V11.2442C24.7764 10.7778 25.1614 10.3955 25.6348 10.3955C26.1083 10.3955 26.4894 10.7778 26.4894 11.2442V12.2383C26.4894 12.2765 26.4817 12.3109 26.4778 12.3453C27.1592 12.5135 27.7058 12.7965 28.1099 13.2017C28.7951 13.8976 29.1454 14.9643 29.1454 16.4018V17.1359C29.1454 19.0246 28.5103 20.2327 27.2554 20.7488V20.7986C28.7066 21.2879 29.4302 22.5725 29.4302 24.6409V26.2238H29.4264Z" fill="#FF5C00"/>
    </g>
  </g>

  <defs>
    <filter id="filter_1" x="0" y="31" width="48" height="48" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="1"/>
      <feGaussianBlur stdDeviation="4"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0 0.2 0 0 0 0.72 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="shadow_1"/>
      <feBlend mode="normal" in="SourceGraphic" in2="shadow_1" result="shape"/>
    </filter>
  </defs>
</svg>`);

  return new Style({
    image: new Icon({
      src,
      opacity: 1,
      scale: 0.8,
      displacement: [0, 24],
    }),
  });
}

function latLonToCoordinate(coordinate: Coordinate): Coordinate {
  return transform(coordinate, 'EPSG:4326', 'EPSG:3857');
}

function createMarker(group: EventGroup) {
  const projection = latLonToCoordinate(group.coordinate);

  const geometry = new Point(projection);

  const feature = new Feature({
    geometry,
    value: group,
    location: group.location,
  });

  feature.setStyle(createCounterStyle(group.events.length));

  return new VectorLayer({
    style: {
      'text-value': group.events.length.toString(),
      'icon-height': 300,
    },
    source: new VectorSource({
      features: [feature],
    }),
  });
}

function intersection<T>(a?: T[] | null, b?: T[] | null): T[] {
  return a ? (b ? a.filter((v) => b.includes(v)) : a) : b ? b : [];
}

export const EventsMap = ({
  events,
  eventPayments,
  userEvents,
  openAuthModal,
  isLoggedIn,
  setIsPaymentModalOpen,
  setPaymentModalData,
  conversionRate,
}: EventsMapProps) => {
  const queryOpts = {
    staleTime: 600_000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  };

  const { data: eventsLocations } = trpc.content.getEventsLocations.useQuery(
    undefined,
    queryOpts,
  );

  const [selectedEventGroup, setSelectedEventGroup] =
    useState<EventGroup | null>(null);
  const [mapState, setMapState] = useState<MapState>();
  const [filter, setFilter] = useState<CourseType[]>([]);
  const courseTypes: CourseType[] = [
    'course',
    'lecture',
    'conference',
    'exam',
    'meetup',
    'workshop',
  ];

  const updateMapState = (map: OpenLayerMap) => {
    const view = map.getView();
    setMapState({
      center: view.getCenter() ?? [0, 0],
      zoom: view.getZoom() ?? 4,
    });
  };

  // Filter effect
  const [filteredEvents, setFilteredEvents] = useState<JoinedEvent[] | null>(
    null,
  );
  useEffect(() => {
    if (!events || filter.length === 0) {
      setFilteredEvents(null);
      return;
    }

    setFilteredEvents(
      events.filter((e) => (filter.length > 0 ? filter.includes(e.type!) : true)),
    );
  }, [events, filter.length]);

  // Geo effect
  useEffect(() => {
    const groups = groupCountries(events ?? [], eventsLocations ?? [], filter);
    if (!groups) {
      return;
    }

    let state = mapState;
    if (!state) {
      // Find most populated event group
      const center =
        groups.length > 1
          ? latLonToCoordinate(
              groups.reduce((a, b) =>
                a.events.length > b.events.length ? a : b,
              ).coordinate,
            )
          : groups.length > 0
            ? latLonToCoordinate(groups[0].coordinate)
            : [0, 0];

      state = { center, zoom: 4 };

      setMapState(state);
    }

    const map = new OpenLayerMap({
      target: 'ol-map',
      layers: [osmLayer],
      view: new View(state),
    });

    for (const group of groups) {
      map.addLayer(createMarker(group));
    }

    map.on('pointermove', (e: MapBrowserEvent<MouseEvent>) => {
      const pixel = map.getEventPixel(e.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getViewport().style.cursor = hit ? 'pointer' : '';
    });

    map.on('click', (e: MapBrowserEvent<MouseEvent>) => {
      const pixel = map.getEventPixel(e.originalEvent);
      const feature = map.forEachFeatureAtPixel(pixel, (feature) => feature);

      if (feature) {
        setSelectedEventGroup(feature.get('value'));
      }
    });

    map.on('moveend', () => updateMapState(map));
    map.on('zoomend', () => updateMapState(map));

    return () => {
      map.setTarget();
    };
  }, [eventsLocations, events, filter.length]);

  const [cards, setCards] = useState<JoinedEvent[] | null>(null);
  useEffect(() => {
    if (selectedEventGroup && filteredEvents) {
      setCards(intersection(selectedEventGroup.events, filteredEvents));
    } else if (selectedEventGroup) {
      setCards(selectedEventGroup.events);
    } else if (filteredEvents) {
      setCards(filteredEvents);
    } else {
      setCards(null);
    }
  }, [selectedEventGroup, filteredEvents]);

  return (
    <div className="bg-gray-100 rounded-xl">
      <div className="flex justify-between items-center h-16 rounded-t-xl border-b px-8 font-semibold text-gray-800">
        <div className="flex gap-4 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </svg>
          Filters
        </div>

        <div className="flex gap-4 font-light">
          {courseTypes.map((f) => (
            <button
              key={f}
              onClick={() =>
                setFilter((prev) =>
                  prev.includes(f) ? prev.filter((p) => p !== f) : [...prev, f],
                )
              }
              className={cn(
                'text-md border-b border-transparent capitalize',
                filter.includes(f) ? 'border-newOrange-1 font-semibold' : '',
              )}
            >
              {f}s
            </button>
          ))}
        </div>

        <div>{/* Keep for spacing  */}</div>
      </div>

      <div
        id="ol-map"
        className={cn(
          'w-full h-96 xl:h-[32rem] overflow-hidden',
          !(selectedEventGroup || filter.length > 0) && 'rounded-b-xl',
        )}
      ></div>

      <div
        className={cn(
          'p-4 border-t',
          selectedEventGroup ?? filteredEvents ? 'rounded-b-xl' : 'hidden',
        )}
      >
        <div
          className={cn(
            'flex justify-between font-semibold text-gray-800',
            (selectedEventGroup || filteredEvents) && 'pb-4',
          )}
        >
          <div className="flex">
            {filteredEvents && (
              <div className="first-letter:uppercase">
                {filter
                  .map((f) => f + 's')
                  .join(', ')
                  .replaceAll(/(.*),/gm, '$1 and')}
              </div>
            )}
            {selectedEventGroup && filteredEvents && (
              <span>&nbsp;in&nbsp;</span>
            )}
            {selectedEventGroup && (
              <span>{selectedEventGroup?.location.name}</span>
            )}
          </div>

          <button onClick={() => (setSelectedEventGroup(null), setFilter([]))}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap gap-5 justify-center">
          {cards?.length ? (
            cards.map((event) => (
              <EventCard
                event={event}
                eventPayments={eventPayments}
                userEvents={userEvents}
                openAuthModal={openAuthModal}
                isLoggedIn={isLoggedIn}
                setIsPaymentModalOpen={setIsPaymentModalOpen}
                setPaymentModalData={setPaymentModalData}
                conversionRate={conversionRate}
                key={event.name}
              />
            ))
          ) : (
            <div className="text-gray-500 text-center w-full mb-4">
              No events found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

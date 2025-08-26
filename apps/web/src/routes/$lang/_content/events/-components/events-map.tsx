import { format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
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

import type {
  EventLocation,
  EventPayment,
  JoinedEvent,
  UserEvent,
} from '@blms/types';
import { Button, cn } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import type { View as CalendarView, Components } from 'react-big-calendar';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { CiShare2 } from 'react-icons/ci';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import type { CalendarEvent } from '#src/components/Calendar/calendar-event.js';
import { customEventGetter } from '#src/components/Calendar/custom-event-getter.js';
import { CustomEventMonth } from '#src/components/Calendar/custom-event-month.tsx';
import { CustomEventWeek } from '#src/components/Calendar/custom-event-week.tsx';
import type { PaymentModalDataModel } from '#src/services/utils.tsx';
import { trpc } from '#src/utils/trpc.ts';
import { EventCard } from './event-card.tsx';
import ShareModal from './modal-link-sharing.tsx';

enum DisplayMode {
  Calendar = 'calendar',
  Map = 'map',
}

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
    React.SetStateAction<PaymentModalDataModel>
  >;
  conversionRate: number | null;
  showMap?: boolean;
  fixedCalendarDate?: string;
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
  events: readonly JoinedEvent[],
  locations?: readonly EventLocation[],
  filter?: readonly string[],
): EventGroup[] | null {
  if (!locations?.length || !events?.length) {
    return null;
  }

  const locationsMap = new Map(locations.map((e) => [e.name, e]));
  const groupedByLocationEvents = new Map<number, EventGroup>();

  const now = Date.now();
  for (const event of events) {
    // Skip past events
    const startDate = event.startDate.getTime();
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
        coordinate: [location.lng, location.lat],
        events: [event],
        location,
        placeId: location.placeId,
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
  const src = `data:image/svg+xml;base64,${btoa(`\
<svg width="48" height="79" viewBox="0 0 48 79" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g>
    <g filter="url(#filter_1)">
      <rect x="8" y="38" width="32" height="32" rx="16" fill="white"/>
      <rect x="8.5" y="38.5" width="31" height="31" rx="15.5" stroke="#E5E7EB"/>
      <text x="24" y="60" font-family="IBMPlexSans" font-size="18" text-anchor="middle" fill="#374151">${count}</text>
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
</svg>`)}`;

  return new Style({
    image: new Icon({
      displacement: [0, 24],
      opacity: 1,
      scale: 0.8,
      src,
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
    location: group.location,
    value: group,
  });

  feature.setStyle(createCounterStyle(group.events.length));

  return new VectorLayer({
    source: new VectorSource({
      features: [feature],
    }),
    style: {
      'icon-height': 300,
      'text-value': group.events.length.toString(),
    },
  });
}

function getInitialCalendarState(fixedCalendarDate?: string) {
  if (fixedCalendarDate) {
    const fixedDate = new Date(fixedCalendarDate);
    if (!Number.isNaN(fixedDate.getTime())) {
      return {
        date: fixedDate,
        view: 'week' as CalendarView,
      };
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const dateParam = urlParams.get('date');
  const viewParam = (urlParams.get('view') as CalendarView) || 'month';

  const view: CalendarView = ['month', 'week'].includes(viewParam)
    ? viewParam
    : 'month';

  const date = dateParam ? new Date(dateParam) : new Date();

  if (Number.isNaN(date.getTime())) {
    return { date: new Date(), view: 'month' as CalendarView };
  }

  return { date, view };
}

const EventsMap = ({
  events,
  eventPayments,
  userEvents,
  openAuthModal,
  isLoggedIn,
  setIsPaymentModalOpen,
  setPaymentModalData,
  conversionRate,
  showMap = true,
  fixedCalendarDate,
}: EventsMapProps) => {
  const [mode, setMode] = useState<DisplayMode>(
    showMap ? DisplayMode.Map : DisplayMode.Calendar,
  );
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const queryOpts = {
    refetchOnMount: false, // 10 minutes
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 600_000,
  };

  /*
   * Map
   */

  const { data: eventsLocations } = useQuery(
    trpc.content.getEventsLocations.queryOptions(undefined, queryOpts),
  );

  const [selectedEventGroup, setSelectedEventGroup] =
    useState<EventGroup | null>(null);
  const [mapState, setMapState] = useState<MapState>();
  const [filter, setFilter] = useState<readonly CourseType[]>([]);
  const courseTypes: readonly CourseType[] = [
    'lecture',
    'conference',
    'exam',
    'meetup',
  ];

  const [mapInstance, setMapInstance] = useState<OpenLayerMap | null>(null);

  function prepareShareUrl(map: OpenLayerMap) {
    const newUrl = new URL(window.location.href);

    newUrl.searchParams.delete('lat');
    newUrl.searchParams.delete('lng');
    newUrl.searchParams.delete('zoom');
    newUrl.searchParams.delete('city');
    newUrl.searchParams.delete('date');
    newUrl.searchParams.delete('view');

    if (selectedEventGroup) {
      newUrl.searchParams.set(
        'city',
        encodeURIComponent(selectedEventGroup.location.name),
      );
    } else {
      const view = map.getView();
      const center = view.getCenter();

      if (center) {
        const [lng, lat] = transform(center, 'EPSG:3857', 'EPSG:4326');
        const zoom = view.getZoom();

        newUrl.searchParams.set('lat', lat.toFixed(6));
        newUrl.searchParams.set('lng', lng.toFixed(6));
        newUrl.searchParams.set('zoom', zoom?.toString() ?? '3');
      }
    }

    if (calendarView !== 'month') {
      newUrl.searchParams.set('view', calendarView);
    }

    const dateFormat = calendarView === 'month' ? 'yyyy-MM' : 'yyyy-MM-dd';
    newUrl.searchParams.set('date', format(calendarDate, dateFormat));

    setShareUrl(newUrl.toString());
    setShareModalOpen(true);
  }

  const [groups, setGroups] = useState<Map<string, EventGroup>>();

  // [MAP] Geo effect
  function getInitialStateFromUrl(): {
    mapState: MapState;
    selectedCity: string | null;
  } {
    const urlParams = new URLSearchParams(window.location.search);
    const city = urlParams.get('city');

    if (city) {
      const defaultCoordinates = latLonToCoordinate([-21.269531, 34.29847]);
      return {
        mapState: {
          center: defaultCoordinates,
          zoom: 6,
        },
        selectedCity: decodeURIComponent(city),
      };
    }

    const lat = Number.parseFloat(urlParams.get('lat') ?? '34.298470');
    const lng = Number.parseFloat(urlParams.get('lng') ?? '-21.269531');
    const zoom = Number.parseFloat(urlParams.get('zoom') ?? '3');

    const initialCoordinates = latLonToCoordinate([lng, lat]);

    return {
      mapState: {
        center: initialCoordinates,
        zoom: zoom,
      },
      selectedCity: null,
    };
  }

  useEffect(() => {
    const groups = groupCountries(events ?? [], eventsLocations ?? [], filter);
    if (!groups) {
      return;
    }

    let state = mapState;
    let initialSelectedCity: string | null = null;

    if (!state) {
      const initialState = getInitialStateFromUrl();
      initialSelectedCity = initialState.selectedCity;

      if (initialSelectedCity) {
        const targetGroup = groups.find(
          (g) => g.location.name === initialSelectedCity,
        );
        if (targetGroup) {
          state = {
            center: latLonToCoordinate(targetGroup.coordinate),
            zoom: 6,
          };
          setSelectedEventGroup(targetGroup);
        } else {
          state = initialState.mapState;
        }
      } else {
        state = initialState.mapState;
      }

      setMapState(state);
      setGroups(new Map(groups.map((g) => [g.location.name, g])));
    }

    const map = new OpenLayerMap({
      layers: [osmLayer],
      target: 'ol-map',
      view: new View(state),
    });

    setMapInstance(map);

    for (const group of groups) {
      map.addLayer(createMarker(group));
    }

    map.on('pointermove', (e: MapBrowserEvent<PointerEvent>) => {
      const pixel = map.getEventPixel(e.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getViewport().style.cursor = hit ? 'pointer' : '';
    });

    map.on('click', (e: MapBrowserEvent<PointerEvent>) => {
      const pixel = map.getEventPixel(e.originalEvent);
      const feature = map.forEachFeatureAtPixel(pixel, (feature) => feature);

      if (feature) {
        setCalendarCard(null);
        setSelectedEventGroup(feature.get('value'));
      }
    });

    return () => {
      map.setTarget(undefined);
    };
  }, [eventsLocations, events, filter, mapState]);

  // Calendar selected cards
  const [calendarCard, setCalendarCard] = useState<JoinedEvent | null>(null);

  // [MAP] Event filter
  const [cards, setCards] = useState<JoinedEvent[] | null>(null);

  useEffect(() => {
    if (calendarCard) {
      return setCards([calendarCard]);
    }

    if (selectedEventGroup) {
      setCards(selectedEventGroup.events);
    } else {
      setCards(null);
    }
  }, [selectedEventGroup, calendarCard]);

  /*
   * Calendar
   */
  const [calendarState, setCalendarState] = useState(() =>
    getInitialCalendarState(fixedCalendarDate),
  );
  const { date: calendarDate, view: calendarView } = calendarState;
  const [dateRange, setDateRange] = useState('');

  const handleNavigate = (newDate: Date) => {
    setCalendarState((prevState) => ({ ...prevState, date: newDate }));
  };

  const handleView = (newView: CalendarView) => {
    setCalendarState((prevState) => ({ ...prevState, view: newView }));
  };

  const handlePrevNext = (direction: number) => {
    const newDate = new Date(calendarDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else {
      newDate.setDate(newDate.getDate() + 7 * direction);
    }
    handleNavigate(newDate);
  };

  const locales = {
    'en-US': enUS,
  };

  const localizer = dateFnsLocalizer({
    format,
    getDay,
    locales,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  const weekComponents: Components<CalendarEvent> = {
    event: CustomEventWeek,
  };
  const monthComponents: Components<CalendarEvent> = {
    event: CustomEventMonth,
  };

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>();

  const getFilteredCalendarEvents = (
    events: JoinedEvent[],
    filter: readonly CourseType[],
  ) => {
    return events
      .filter((event) => {
        return (
          event.type !== null &&
          (filter.length === 0 || filter.includes(event.type as CourseType))
        );
      })
      .map<CalendarEvent>((data: JoinedEvent) => ({
        addressLine1: data.addressLine1,
        data,
        end: data.endDate,
        id: data.id,
        isOnline: false,
        organizer: null,
        start: data.startDate,
        subId: null,
        title: data.name,
        type: data.type,
      }));
  };
  useEffect(() => {
    if (events) {
      setCalendarEvents(getFilteredCalendarEvents(events, filter));
    }
  }, [events, filter]);

  const onFilterClick = (course: CourseType) => {
    setFilter((prev) =>
      prev.includes(course)
        ? prev.filter((f) => f !== course)
        : [...prev, course],
    );
    setCalendarCard(null);
  };

  useEffect(() => {
    setFilter(courseTypes);
  }, []);

  const handleRangeChange = (range: Date[] | { start: Date; end: Date }) => {
    if (Array.isArray(range)) {
      const start = format(range[0], 'd');
      const end = format(range[range.length - 1], 'd');
      const monthStart = format(range[0], 'MMMM');
      const monthEnd = format(range[range.length - 1], 'MMMM');
      if (monthStart === monthEnd) {
        setDateRange(`${monthStart} ${start} - ${end}`);
      } else {
        setDateRange(`${monthStart} ${start} - ${monthEnd} ${end}`);
      }
    } else {
      setDateRange(format(range.start, 'MMMM yyyy'));
    }
  };

  useEffect(() => {
    if (calendarView === 'month') {
      setDateRange(format(calendarDate, 'MMMM yyyy'));
    } else if (calendarView === 'week') {
      const weekStart = startOfWeek(calendarDate, { locale: undefined });
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const start = format(weekStart, 'd');
      const end = format(weekEnd, 'd');
      const monthStart = format(weekStart, 'MMMM');
      const monthEnd = format(weekEnd, 'MMMM');
      if (monthStart === monthEnd) {
        setDateRange(`${monthStart} ${start} - ${end}`);
      } else {
        setDateRange(`${monthStart} ${start} - ${monthEnd} ${end}`);
      }
    }
  }, [calendarView, calendarDate]);

  return (
    <div
      className={cn(
        'bg-gray-100 rounded-xl overflow-hidden',
        showMap ? '' : 'max-lg:hidden',
      )}
    >
      <div className="flex ">
        {/* CALENDAR */}
        <div
          className={cn(
            'flex-1',
            mode === DisplayMode.Calendar ? '' : 'hidden',
          )}
        >
          <div className="flex justify-between items-center h-16 rounded-t-xl border-b px-6 font-semibold text-gray-800">
            {/* View switcher */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleView('month')}
                  className={cn(
                    'border rounded-lg py-1 px-3',
                    calendarView === 'month'
                      ? 'bg-darkOrange-5 text-white border-darkOrange-5'
                      : 'bg-white',
                  )}
                >
                  {t('words.month')}
                </button>
                <button
                  type="button"
                  onClick={() => handleView('week')}
                  className={cn(
                    'border rounded-lg py-1 px-3',
                    calendarView === 'week'
                      ? 'bg-darkOrange-5 text-white border-darkOrange-5'
                      : 'bg-white',
                  )}
                >
                  {t('words.week')}
                </button>
              </div>
            </div>

            {/* Date controls */}
            <div className="flex items-center gap-1 font-normal">
              <button
                type="button"
                onClick={() => handlePrevNext(-1)}
                className="border bg-white rounded-lg p-1"
              >
                <BsChevronLeft className="size-6 p-1" />
              </button>
              <button
                type="button"
                onClick={() => handleNavigate(new Date())}
                className="border bg-white rounded-lg py-1 px-3"
              >
                {dateRange}
              </button>
              <button
                type="button"
                onClick={() => handlePrevNext(1)}
                className="border bg-white rounded-lg p-1"
              >
                <BsChevronRight className="size-6 p-1" />
              </button>
            </div>
          </div>

          <div className="border-b-rounded-xl overflow-hidden">
            <div className="text-gray-500 text-center w-full">
              <div
                className={cn(
                  showMap
                    ? 'h-96 xl:h-[34rem] w-[850px]'
                    : 'h-96 xl:h-[27rem] w-full',
                )}
              >
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  view={calendarView}
                  onView={handleView}
                  toolbar={false}
                  onSelectEvent={({ id }) => {
                    const event = events.find((e) => e.id === id);
                    if (event) {
                      setSelectedEventGroup(null);
                      setCalendarCard(event);

                      const group =
                        event.addressLine1 && groups?.get(event.addressLine1);

                      if (group) {
                        setMapState({
                          center: latLonToCoordinate(group.coordinate),
                          zoom: 4,
                        });
                      }
                    }
                  }}
                  style={{
                    height: 'inherit',
                    width: '100%',
                  }}
                  date={calendarDate}
                  onNavigate={handleNavigate}
                  eventPropGetter={customEventGetter}
                  components={
                    calendarView === 'month' ? monthComponents : weekComponents
                  }
                  timeslots={2}
                  showAllEvents={true}
                  showMultiDayTimes={true}
                  onRangeChange={handleRangeChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* MAP */}
        {showMap ? (
          <div className="relative flex-1 overflow-hidden">
            <div className="flex items-center justify-center md:justify-start h-16 rounded-t-xl border-b px-1 md:px-6 font-semibold text-gray-800">
              <div>
                <div className="hidden sm:flex items-center mr-6">
                  <HiOutlineAdjustmentsHorizontal className="size-6 stroke-[1.5]" />
                </div>
              </div>

              <div className="flex gap-3 md:gap-4 font-light overflow-x-auto no-scrollbar">
                {courseTypes.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => onFilterClick(f)}
                    className={cn(
                      'text-xs md:text-base border-b border-transparent capitalize',
                      filter.includes(f)
                        ? 'border-darkOrange-5 font-semibold'
                        : '',
                    )}
                  >
                    {f}s
                  </button>
                ))}
              </div>
            </div>

            <div
              id="ol-map"
              className={cn(
                'w-full h-96 xl:h-[34rem] overflow-hidden',
                !selectedEventGroup &&
                  (mode === DisplayMode.Calendar
                    ? 'rounded-br-xl'
                    : 'rounded-b-xl'),
              )}
            >
              <style>
                {`
              #ol-map .ol-zoom {
                top: 1rem;
                right: 1rem;
                left: auto;
              }
            `}
              </style>
            </div>
            <div className="absolute bottom-2 right-2">
              <button
                type="button"
                onClick={() => mapInstance && prepareShareUrl(mapInstance)}
                className="bg-darkOrange-5 text-white px-3 py-2 rounded-lg shadow-md hover:bg-darkOrange-6 flex items-center gap-2"
              >
                <p>{t('words.share')}</p>
                <CiShare2 />
              </button>
            </div>

            <ShareModal
              isOpen={isShareModalOpen}
              url={shareUrl}
              onClose={() => setShareModalOpen(false)}
            />

            {/* Switch mode */}
            <div className="absolute top-20 left-2 z-10 hidden xl:block">
              <Button
                variant="primary"
                size="s"
                className="h-8 border border-darkOrange-5 flex gap-2"
                onClick={() =>
                  setMode(
                    mode === DisplayMode.Calendar
                      ? DisplayMode.Map
                      : DisplayMode.Calendar,
                  )
                }
              >
                {mode === DisplayMode.Calendar ? (
                  <>
                    <BsChevronLeft className="size-4" />

                    <span>{t('events.calendar.fullMap')}</span>
                  </>
                ) : (
                  <>
                    <BsChevronRight className="size-4" />

                    <span>{t('events.calendar.displayCalendar')}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Event cards */}
      <div
        className={cn(
          'p-4 border-t',
          calendarCard || selectedEventGroup ? 'rounded-b-xl pb-4' : 'hidden',
        )}
      >
        <div className="flex justify-between font-semibold text-gray-800">
          <div className="flex">
            {selectedEventGroup && (
              <span>{selectedEventGroup?.location.name}</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedEventGroup(null);
              setCalendarCard(null);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
              role="img"
              aria-label="Events card"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap gap-5 justify-center mt-2">
          {cards?.length ? (
            cards.map((event, index) => (
              <EventCard
                event={event}
                eventPayments={eventPayments}
                userEvents={userEvents}
                openAuthModal={openAuthModal}
                isLoggedIn={isLoggedIn}
                setIsPaymentModalOpen={setIsPaymentModalOpen}
                setPaymentModalData={setPaymentModalData}
                conversionRate={conversionRate}
                // biome-ignore lint/suspicious/noArrayIndexKey: explanation
                key={index}
              />
            ))
          ) : (
            <div className="text-gray-500 text-center w-full mb-4">
              {t('events.calendar.noEventsFound')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsMap;

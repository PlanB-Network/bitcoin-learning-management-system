import { useState } from 'react';

export function NodeLocationSelector() {
  const [selectedRegion, setSelectedRegion] = useState('America');

  const regions = [
    { label: 'America', link: 'https://t.me/ErnestoQuezada' },
    { label: 'Europe', link: 'mailto:ajelex@planb.network' },
    { label: 'Africa', link: 'mailto:ajelex@planb.network' },
    { label: 'Asia/Pacific', link: 'mailto:ajelex@planb.network' },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-wrap gap-2 p-2 bg-gray-200 rounded-lg w-full justify-center">
        {regions.map((region) => (
          <a
            key={region.label}
            href={region.link}
            target={region.link.startsWith('mailto:') ? '_self' : '_blank'}
            rel="noopener noreferrer"
            onClick={() => setSelectedRegion(region.label)}
            className={`px-4 py-2 text-center font-semibold w-full sm:w-auto rounded-lg hover:bg-gray-100 hover:text-orange-400 ${
              selectedRegion === region.label
                ? 'bg-orange-600 text-gray-100'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {region.label}
          </a>
        ))}
      </div>
    </div>
  );
}

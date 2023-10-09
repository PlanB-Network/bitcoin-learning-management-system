/// <reference types="vite-plugin-svgr/client" />

import NostrIcon from '../../../assets/icons/nostr.svg?react';
import TwitterIcon from '../../../assets/icons/twitter.svg?react';
import WebIcon from '../../../assets/icons/web.svg?react';
import { TipIcon } from '../../../components/tip-icon';

interface AuthorCardProps extends React.HTMLProps<HTMLDivElement> {
  name: string;
}

export const AuthorCard = ({ name, ...props }: AuthorCardProps) => {
  return (
    <div {...props}>
      <div className="border-blue-1000 bg-beige-300 flex flex-col items-start gap-2.5 rounded-2xl border p-2">
        <div className="flex w-[610px] items-start">
          <div className="border-blue-1000 flex w-32 shrink-0 flex-col items-center justify-center self-stretch rounded-l-[0.9375rem] border bg-blue-800 p-2">
            <img
              src="https://raw.githubusercontent.com/DecouvreBitcoin/sovereign-university-data/main/resources/professors/rogzy/assets/profil.jpg"
              alt="Professor"
              className="mt-4 h-28 w-28 rounded-full"
            />
            <div className="mt-2 flex justify-between self-stretch px-1">
              <NostrIcon className="h-20" />
              <TwitterIcon className="h-20" />
              <WebIcon className="h-20" />
            </div>
          </div>
          <div className="border-blue-1000 bg-beige-300 flex flex-col items-start self-stretch rounded-r-2xl border">
            <div className="border-blue-1000 text-beige-300 flex self-stretch rounded-tr-2xl border bg-orange-500 px-5 py-2 text-3xl font-semibold">
              {name}
            </div>
            <div className="flex flex-col items-center justify-center gap-2.5 self-stretch px-0 py-2">
              <div className="flex flex-col items-center justify-center self-stretch px-5 py-0">
                <div className="flex flex-wrap content-center items-center gap-5 self-stretch text-blue-800">
                  <div className="flex items-center gap-2 text-2xl">
                    <div className="font-semibold">0</div>
                    <div className="">Courses</div>
                  </div>
                  <span className="text-3xl">•</span>
                  <div className="flex items-center gap-2 text-2xl">
                    <div className="font-semibold">15</div>
                    <div className="">Tutorials</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap content-start items-start gap-2.5 self-stretch text-lg text-blue-700">
                  <div className="flex items-center rounded-lg bg-gray-100 px-4 py-1">
                    privacy
                  </div>
                  <div className="flex items-center rounded-lg bg-gray-100 px-4 py-1">
                    lightning network
                  </div>
                  <div className="flex items-center rounded-lg bg-gray-100 px-4 py-1">
                    lightning network
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-end self-stretch px-5 pb-3">
                <div className="text-justify text-[.8125rem] font-light italic text-red-600">
                  Wanna say thanks ? TIp.
                </div>
                <div className="ml-4 h-8 w-8">
                  <TipIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

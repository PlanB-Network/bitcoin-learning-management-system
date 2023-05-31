import { Link } from 'react-router-dom';

import { FilterBar, MainLayout, Pagination } from '../../components';
import { PageTitle } from '../../components/PageTitle';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { RessourceLayout } from '../../components/RessourceLayout';

const podcasts = [
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/b010/919b/bb7447aceadcb8554dedc24aad90d5c4?Expires=1685318400&Signature=RL~ob7mRB~RQWA2u8p3YzFNv2LCmtSk3pWvLR0ANnsidGJZ3aXzujc-2cDx6M~-NJZaf1ngVKrW7wHhZLPcaQFUb6vcScO3ysfzW0FsKKfjWG5TVw9iDLYS0pUWNoZ249VI0OacvpUBtu5nAl~Gd6AZKHDZlCr~WuS7iSsyYjnaz9GabvenR8RpLje23k-4IBiQ-jN0xw0qfVUsXL2b2UyhasVC95zC7fasQQSR-kqCV0JsnnR4KKeQi8cCnApkP-D8Kb4cyy745jWaLvyDlZ3DsRUkmMVRowLMi~6tNmH29sk6ULSlY4G6KZScaG2Vf0VmlMDSCNcgXNkRIKBZZCQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/bd39/a7d6/37b6faa31b40d33f68c98c7d76448b17?Expires=1685318400&Signature=j-vp7oO8NTgH5AksiXfWsjDo9Q7DoVWuZVijyMta06MI89q7Nbdcpdlz60PVXSGlc2CvlIs-59GYMw1KX7pi4EhVkZJfMCzGT6l2IFFwydADLxhc0SVuPE1QjmGeSstjUB1UkBk2gWaa2LjDnIaoeF0jPTjTge2fyYkYk~v5YlPqlc-y-Qut9jX9R0J3MleMmSB9buBnVxb55p6cDt47UDy50WblYvcj2nHfhSKEHRph9XHMigjIqgLedIiSZOWnJ8sok6W8vgcultC2FmH9GpCuuMuDeuUJoP-AQb0AHco9LcsUXcpgpdJiYp-XL-86apAjU61lSgzPbx6Nweg-JQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/d7bc/5d21/7da11279023b2fa226dd7bead316ec5e?Expires=1685318400&Signature=pZkjaderCMZmbguCY5u~KUN7XQGYHEuwNCLXs8Kf27YKHINcXU4EmX81C4DFh4JiFfsWp2evkfUEb8C-VoSifF-g-04LEnjPOGex984-WPLNKunPCD1WUgCN~erhBSvhnrm7pMC0ukOZpxG2oZok-klN~ykJEDSwXoqJoqpisiM5bC4MlGqe3DjtDwGWJFyNl-Wszkdto3P6ANjTbShm77De3UjQ82EXYUd82rVykUS6-vgSxQodKcAoHnOo2WkLyj~Muny358Dle~OV-NELKvHkzcje7UPezkIvIx6uXXj86~VVn73uxmSolP62wNWzc3pi27RwjT~F76l~ty5xYQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/060b/3b86/f94b61dda3de0ab3c3f4e9c3eb444ec9?Expires=1685318400&Signature=aTxTCP8du57-fVr7Ux4rAdAyHJQOFlimnqpkY56pLV2lXCWfb-PJ45bKQOylDSIJEmr~wslASMa~54C1FJwg4SJiOR-aeftaI8Yiw~4tTXTdw0jRcbmcEJ6kgpUKETJy4Zcp7pDbspIW7ENCEdPoac8wYQr7ib7tvFYdM0aNWwrt9sgdQ-MaiFx0BheURd4rEjF~2kAcy8My~sRn8TLCqP1rFmKpDXEq72GiypEEQX3lJZ7m1XBl1XzdQr-aSJ8mPYKOdETRrdHyUfaGwTk~19dRu1oznmRQkdW7WHHztKh86M7Gh2Y-8Q9XwKf-YQmqTOMnELLEQ~J-9hz~fhK4Aw__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/1ab2/c261/00905e876a886ba661907eaf0d828968?Expires=1685318400&Signature=gpl9THXvjMqdXxnSDvb~Vs2cePrjaA4H2PxbBxbMUCDYGZMXVamRt6LyOLctaYAU6JbVu7N~Mr9v-yA7JXoH-eP49NSbbG4bOOQEF9XElCP5iw8vUKOPAn4V34qfXt6V-LfRM6bW5TZ77M3KQdonhH1UyrN~riZFxobaqHo1qT6bcLsv4mU4JPuR9E9f9luxX5rykCWwTlRPCrgLILVo5Wzo9Z8VH4JwLQZIwFmJXc8gB9h9K8zScolomwDJXPpIuX7z8-7TWyglozjSiNjh1uznVlNMHMO8kW3PF-7gy7X5X5hm7iE19B6pKBTkxWmMSQmYu0brBthSPKMaMlko7A__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/7ec7/976e/aa382c9edffe4cf118a19f6509a62bef?Expires=1685318400&Signature=Ba5HL~gIm~jfYU0UqW1BTybD5PzOgR96G3hUtrSyzIuYt3PMAMgJhd7-i3qv0i9WKMm1tlqQVfwZiMCovJcLfPuwpUYXCwbxEAGBYVx9LLQxiyDtRumr2qcqgWrTCirAwuKof5YYu4j8wjn-nXbm9~Ruw05uvKOwtCkfkW25WCC7cDNcVF1cNZshAo8e~grUg9M7~PxgyR4vfZiGTByzCzT8bfmwlPCprvEjXhAbwzCKWqAb8F0fedSEeXkXv5gWjwme3ZCfO~tDJk9VnWJNum38jLMNUi2RJNZCz216296F-fSkgo1LJC1cuCaNIaVySLMc9hvNOwwgT4eLl~0i6g__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/2b72/1543/86192a0f655c3cedbdc7162dbb031425?Expires=1685318400&Signature=q5v2yAI5OPLCZox~ZzxF8q8364iEhlIUhoosm5ECptZZp6GL953VlNi6I9Al79OzKQjAtSANhShiw1DXLkNKIl~TqMEecfyi53hhpTDyR-audv6GJaesSuAeRJ3~Wnm3hVt9KVcMrmA1R~hAQoQ3-Y~I~YYTiNNurPowbAiqF-FOdJXCcgp14VUgenxX81mmTvQurkGNL8T7XvVxCcjokqYNBa9QsWYq~HQIzvAn88P~btifHrqjk1C~K5kjrLLEc2ygOYtryX0L44adWxenfZXC5oLXRiJGWorb8waIl9iJk8O0yhNyo1YoZjGt2G~Pp6KJBMIR~2AbPH7PNZEtww__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/b3c0/15b7/1a84f4d4ab034c026e71ffa3677040e4?Expires=1685318400&Signature=GtOP65vvWTq4zq6fWDHoSvnZyZ8RBHhIpSL6ahcKUBY5srYnCr8lFCMkA~Ff7A48t9OGpilYog~k7c9yCxw70QpX1di1zSDaiP5vuZtECaxpqxBU35euDepjHm1b03BPmQ~zhsO3hWCRrAYwZTQTjQZ08t2K45SrtLbo1A1XUSa2~qavBHn1IF-IfHVElcIsC~fGtbSrl09WWJIzM6yvawopWoXoH~0a99byctAnzbtYafS-IFo7JxwltVlod266tMclbRWJ-Y4h0ntsfNH8f~4YbMQ-UB7B0vDeHeu5yl7xOqijq3barAcfxRFCMzKkupvAETSaCgP4b2qgcAZCRw__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/2e99/74a7/9f24c396ae25cbd6e157bff912ebdfb5?Expires=1685318400&Signature=ZuLtOQWzAUuuZ02lpgGTrPkWB3xA0SKX0jTVhJftvMxYOsxSQKpnL9ldo-tBDHvZ~~QkMel7zsS-MxY~rdTE2rWFcZDHKtUDOsqUWOQbNU6~-I08HV8ga32tHqgR00K5CjEfQCaxfOyd3SLLujwJI3RaNhs-ZHGExltXBQGpExr-Nf7y5pIx4WP~jG46S4iU6Iaw~0hu2RLQw2f~GjEI6EPt~1SEdfrh7ZWHD3YAoJRnpCN1rlUFzYmbhNUDJiT14koERUyOXSet-goU1RuzAhK~J9q1~6QdvxClsYG-IWuLvShA55nujveV5akiqQVnQHEu8ujI-1elZKFcBYQhgg__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/b015/37a4/5b151062c79161cc62d50cc7f9a01c67?Expires=1685318400&Signature=OyQ5DTEBnwiDrQdJNnt9FUYRzcbBKxCPDqh7X4fNiInHB3jf8La6EHAXTH0JVQkyuG2NmO-p~LBoGf2uhjimjylrpTlmlabpA4a8nTT~DWQ9xxT8-3RUnyoHQ6cHl2Un8Pb0TccW9gFbozf-Cc~Lt2Z8OmNEtAcbhTBsWuSkzxOq~u7xAhCn0Ei0Ivxmo0SYqERAoyOLGNV5Q2BNYFKSar~xZBjkowx4EtkiDY7zjRN6U2mFg54ynl4iuOJHLtdWOjJpufwGE7o7nMEsW2hFJ-4b2dLxCvyMhii-blhP4O3pzNTxGeBPUJ9lccu32URoVRI1Uo1LXx76OXblOzYPwg__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/6288/14b9/f9c60ab7c2a4c5ecaea8164e720f75eb?Expires=1685318400&Signature=h7wsGDiAYxtxitTqBM6-LLY1aBFzfl-l3-CXxHAPsRsfM5DaFMxXpsrt3p5y0DROnH53c5dERENCoOol5zTNqjF-ETV~4zFnAli1RoASaA2nj2UOFqhREG0WIMd6fMUEx0jatEHlLB7lFLhEbEq7V0RvKNqw7xO1eOTiO5E4nLI6VIv0CNDI6poBivuMztjzGbN-9v0EzdKbKDPJLAlw4YRxcQEEBldoJGcdWa0tfNezVi-D-65t0wpa-K-Hi95IIgiIwhgCqvQo0GxODVNZMO2s0C2GLUXGyuqAWd2mTVdLGa7pQUgRyKis4cScbZRYrMxo12lHyLXTpvREwpc4XA__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/4d3d/215d/c8918ee95c2fd6ecc90165e588253908?Expires=1685318400&Signature=U5HyblYsMgat-7xJZFz3fteXzM-5C-j~R0GdwNB7ajscQhZlw-5WHmpeR7GCz3-4oRS0GeLBoVjEd3OD8WeG1PKZccPpUPPKYZUgoZjCALgQrFDJFo-A5~8SAGqhtikuITHBVS-qMT9zD4wTVRs1J~M72OZOW6zuLXRXgoqTlObFyyWjNwNsFnxGUyiPT687ZmML2teLVwwVZrR6f-qqzes52VO6n3ktt6GQEUH-vThjHgk6rZ9DiZbTg2wrds8zqxW~fOa8xzacspI7qMHUGT6bqGT5cbxSKkMKZ1aXmpN-vayWIub9GwLa5e5jIHKsNm5ySRySfrIRCWg5ohUwcA__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/019d/a782/163ec8d4af9e54d9a38c0bb5b2567efa?Expires=1685318400&Signature=QUE45ifvFRW4mflQgFHoOKiRfrjnRanL2~0C9M8zZt2BXxMwpYcBsV~FK-hLM88YcmCwDryu-cWzkY3EK8ojowAB1iKoCguEebBypDKOTtA4GL0CuFUAzBKRqIn1CVRE3rDN2vC2sqqaUZFLdEJNSMZp9E8y8GoZ5Q3UuTt1NPmnjrKOjhwcg4h8mj-QrFg4BiADi32HzpSZiCLbZ6zKQgSTSglIm48M5YPY6At~x5vWwuqV5UmJlDnz5QyLys1EQNZWKA7s7QRrjJhhcFMpKV2eFV0Bm4-Mujn8UyBZNSehCZP8GQ421lOukP9o3qd3CsLfokdxvytPUXD1XJganA__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
  {
    coverImage:
      'https://s3-alpha-sig.figma.com/img/405e/abd9/de701cb2a06eb4f5ebc019dbf65ea054?Expires=1685318400&Signature=mwmPm8YxYbobkjvgSrRZTizdiWJPkOGmqynTVfT9Q9WXLIxqzMZnLVzW3nmhQK-yDHDigl4qJ2T5LVrQK8PyAXvfN7JaW7198VKjDt5QncRc4Z5l1Hhj7YicRoLXPDfDixYvt5~DciIaZVBcnCL4MF35X3~bQ7l1eqGKS7G3AYE5KT-uH9oWCFGdNp3St-G4ozizDxBNwTsaiW~lo9VulE~l3~npnwnjEiYmSjijONNtE9Dfn9VkJgDB4ikLrSC8bJig8apnooUfUKpXxVWSC7Zkl7SPEvOiarlAGlWvdkhR79oUGLyxctrv7HZypFCr4zUgv69gLDQymv0MONyw0w__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  },
];

export const Podcasts = () => {
  return (
    <RessourceLayout
      title="The Podcast Portal"
      tagLine="This PORTAL is open-source & open to contribution. Thanks for grading
    and sharing !"
      filterBar={{
        onChange: () => {},
        label: 'Find the perfect resources for your needs:',
      }}
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-16 my-20 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {podcasts.map((podcast) => (
          <Popover key={podcast.coverImage} className="relative">
            <Popover.Button>
              <div
                className="max-h-64 cursor-pointer group"
                key={podcast.coverImage}
              >
                <img
                  className="mx-auto h-full rounded-none border-2 border-transparent border-solid duration-200 group-hover:rounded-3xl group-hover:border-secondary-400"
                  src={podcast.coverImage}
                />
              </div>
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-10 bg-primary-100">
                <div className="flex flex-col p-2 w-52 bg-secondary-400">
                  <img
                    className="mx-auto h-full rounded-none border-2 border-transparent border-solid duration-200 group-hover:rounded-3xl group-hover:border-secondary-400"
                    src={podcast.coverImage}
                  />

                  <h4 className="text-xs">
                    Check your financial Privilege. Inside the global Bitcoin
                    revolution
                  </h4>
                  <h5 className="italic text-xxs">Written by Alex Gladtsein</h5>
                  <h5 className="italic text-xxs">Publisher .... in 2020</h5>
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>
        ))}
      </div>
    </RessourceLayout>
  );
};

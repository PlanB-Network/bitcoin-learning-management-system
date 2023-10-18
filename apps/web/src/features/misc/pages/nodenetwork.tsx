import { Link, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AmityLogo from '../../../assets/home/AmityAgeLogo.png';
import btcLyonLogo from '../../../assets/home/btcLyonLogo.png';
import btcMap from '../../../assets/home/btcMap.png';
import community from '../../../assets/home/community.svg';
import cuboPlusLogo from '../../../assets/home/cuboPlusLogo.png';
import bitcoinCurrency from '../../../assets/home/currency_bitcoin.svg';
import favorite from '../../../assets/home/favorite.svg';
import NodeImg from '../../../assets/home/fnode.png';
import hbsLogo from '../../../assets/home/hbsLogo.png';
import kiveclairLogo from '../../../assets/home/kiveclairLogo.png';
import NodeMap from '../../../assets/home/nodemap.svg';
import planBLogo from '../../../assets/home/planBLogo.png';
import rocketForm from '../../../assets/home/rocket_strokeonly.svg';
import stageOne from '../../../assets/home/stage1.svg';
import stageTwo from '../../../assets/home/stage2.svg';
import stageFour from '../../../assets/home/stage3.svg';
import visibilityOff from '../../../assets/home/visibility_off.svg';
import { Button } from '../../../atoms/Button';
import { MainLayout } from '../../../components/MainLayout';
import { SectionTitle } from '../components/SectionTitle';

export const nodeNetwork = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (sectionIndex) => {
    if (openSection === sectionIndex) {
      // Si la sección está abierta, ciérrala haciendo clic nuevamente.
      setOpenSection(null);
    } else {
      // Si la sección está cerrada, ábrela.
      setOpenSection(sectionIndex);
    }
  };

  return (
    <MainLayout footerVariant="dark">
      <>
        {/* First section */}
        <div className="flex w-full justify-center bg-blue-900  xl:px-0">
          <div className="w-full max-w-6xl px-5 py-2 md:px-16 lg:px-12">
            <div className="mb-0 ">
              <div className="flex h-6 w-full flex-row sm:h-10 sm:w-2/4">
                <h2 className="bg-orange-600 text-base font-bold text-gray-100 sm:text-3xl">
                  NODE NETWORK
                </h2>
                <img className="mx-2 h-auto px-1" src={NodeImg} alt="" />
              </div>

              <p className="mt-1 text-xs uppercase text-gray-100 sm:text-base">
                our strength is our community. let's gather into a global
                bitcoin network.
              </p>
            </div>
            <div className="my-0 flex flex-col-reverse justify-around  sm:my-0 md:flex-row">
              <div className="  w-full flex-col leading-[50px] text-gray-100 sm:mt-3 sm:w-2/5  ">
                <h4 className="text-lg font-semibold text-gray-100 ">
                  Every country needs a Plan B !{' '}
                </h4>
                <p className=" mt-3 text-xs sm:text-base">
                  All around the world, Bitcoiners are coming together in
                  communities.
                </p>
                <ul className="ml-5 mt-5 list-disc space-y-0 text-xs font-light text-white sm:pl-8 sm:text-base">
                  <li>
                    A new{' '}
                    <span className="text-orange-400">Bitcoin meetups</span>{' '}
                    emerges every week.
                  </li>
                  <li>
                    Educational centers,{' '}
                    <span className="text-orange-400">hackerspaces</span>, and
                    Bitcoin office spaces are on the rise.
                  </li>
                  <li>
                    <span className="text-orange-400">Secure citadels </span>
                    are under construction.
                  </li>
                </ul>
                <p className="mt-3 text-xs sm:text-base">
                  The dedication of the Bitcoin community to collaborate,
                  support one another, and offer essential tools for their local
                  counterparts is essential to thrive in the modern landscape.
                </p>
                <p className="mt-3 text-xs sm:text-base">
                  The dedication of the Bitcoin community to collaborate,
                  support one another, and offer essential tools for their local
                  counterparts is essential to thrive in the modern landscape.
                </p>
                <h1 className="mt-3  text-lg font-semibold">
                  Let’s built Bitcoin Citadel around the world
                </h1>
              </div>

              <div className=" max-w-sm content-center pr-0  md:ml-2 lg:max-w-2xl">
                <img src={NodeMap} alt="Rabbit Studying" />
              </div>
            </div>
          </div>
        </div>

        {/* 2nd section */}
        <div className="flex w-full flex-col justify-center bg-blue-900 px-5 md:px-10 lg:px-32 xl:px-0">
          <div className="my-12 flex flex-col-reverse items-center justify-center px-5 md:flex-row">
            <div className="flex flex-row place-items-start	 text-lg text-white  sm:text-2xl ">
              <div className="m-2 flex flex-col items-stretch sm:my-1">
                <img className="h-40" src={stageOne} alt="Rabbit" />
                <h4 className="text-center text-base">Stage 1 - Communties</h4>
              </div>
              <div className=" mx-2 flex-col items-stretch ">
                <img className="h-40" src={stageTwo} alt="Rabbit" />
                <h4 className="text-center text-base">Stage 2 - HUB</h4>
              </div>
              <div className="mx-2 flex flex-col items-stretch ">
                <img className="h-40" src={stageTwo} alt="Rabbit" />
                <h4 className="text-center text-base">Stage 3 - Full Node</h4>
              </div>
              <div className="mx-2 flex flex-col ">
                <img className="h-40" src={stageFour} alt="Rabbit" />
                <h4 className="text-center text-base">
                  Stage 3 - Full Citadel
                </h4>
              </div>
            </div>
          </div>
          <div className=" w-full max-w-6xl flex-col place-items-start items-center justify-center px-5 py-2 leading-[50px] text-gray-100 sm:mt-3  md:px-20 ">
            <div className="place-items-center items-center justify-center">
              <h4 className="text-lg font-semibold text-gray-100 ">
                Every country needs a Plan B !
              </h4>
              <p className="mt-3  text-xs font-thin sm:text-base">
                By joining our network, we'll guide you in transitioning from a
                simple Bitcoin meetup to a fully secured Bitcoin citadel!
              </p>
              <ul className="ml-5 mt-5 list-disc space-y-0 text-xs font-light text-white sm:pl-8 sm:text-base">
                <li>
                  <span className="text-orange-400">Community building</span>{' '}
                  support
                </li>
                <li>
                  Educational resources for
                  <span className="text-orange-400"> local seminars</span>
                </li>
                <li>Access to worldwide experts</li>
                <li>Connection to thousands of students</li>
              </ul>
              <h2 className="text-base font-semibold text-orange-600 sm:text-lg">
                You're not alone in trying to change the world. Let's pool our
                resources to succeed.
              </h2>
            </div>
          </div>
          <div className="mb-9 flex items-center justify-center sm:h-20 ">
            {/* Links for the form */}
            <a
              href="https://docs.google.com/forms/u/0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="relative flex h-12 w-auto cursor-pointer items-center justify-center rounded-xl bg-orange-500 transition duration-300 ease-in-out hover:bg-blue-500">
                <span className="ml-2 text-xs text-white sm:ml-11 sm:text-lg">
                  Become part of the revolution!
                </span>
                <a
                  href="https://docs.google.com/forms/u/0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="ml-1 mr-2 flex items-center rounded  bg-gray-100 px-2 py-1 text-xs transition duration-300 ease-in-out hover:bg-gray-200 sm:ml-4 sm:mr-11 sm:text-lg">
                    <span className=" text-xs sm:mr-1 sm:text-base">Apply</span>
                    <img
                      className="text-blue-1000 h-5 w-5"
                      src={rocketForm}
                      alt="Cohetelogo"
                    />
                  </button>
                </a>
              </div>
            </a>
          </div>
        </div>

        {/* white collaborators section */}
        <div className="flex w-full justify-center bg-gray-100 px-5 md:px-14 lg:px-16  ">
          <div className="w-full max-w-6xl py-10">
            <div className="my-0 flex  flex-col items-center px-6 text-blue-800 sm:my-2 sm:w-full sm:flex-row">
              <div className="mx-5 flex w-full flex-col items-center justify-center leading-[50px] sm:ml-0 sm:w-full lg:space-y-4">
                <h2 className="mx-10 items-center px-2 text-center text-base font-semibold sm:text-3xl">
                  They've are already part of the Network!
                </h2>
                <div className="sm:w-full">
                  <div className="flex flex-col items-center sm:place-content-center sm:text-center md:flex-row">
                    <img
                      className="m-1 h-auto w-auto max-w-full md:h-24"
                      src={planBLogo}
                      alt="BTC Lyon"
                    />
                    <img
                      className="m-1 h-auto w-auto max-w-full md:h-24"
                      src={AmityLogo}
                      alt="Cubo Plus SV"
                    />
                  </div>
                </div>
                {/* <div className="flex flex-col items-center sm:flex-row sm:flex-wrap sm:place-content-center"> */}
                <div className="hidden items-center sm:place-content-center md:flex md:flex-row">
                  <img
                    className="m-1 h-auto w-auto max-w-full md:h-24"
                    src={btcLyonLogo}
                    alt="BTC Lyon"
                  />
                  <img
                    className="m-1 h-auto w-auto max-w-full md:h-24"
                    src={cuboPlusLogo}
                    alt="Cubo Plus SV"
                  />
                  <img
                    className="m-1 h-auto w-auto max-w-full md:h-24"
                    src={hbsLogo}
                    alt="HB.s com"
                  />
                  <img
                    className="m-1  max-w-full md:h-auto md:w-auto lg:h-24"
                    src={kiveclairLogo}
                    alt="Kiveclair"
                  />
                </div>
                {/* Mobile Version */}
                <div className="flex flex-row flex-wrap place-content-center items-center md:hidden">
                  <div className="w-1/2 md:w-full">
                    <img
                      className="m-1 h-auto w-auto max-w-full md:h-24"
                      src={btcLyonLogo}
                      alt="BTC Lyon"
                    />
                  </div>
                  <div className="w-1/2 md:w-full">
                    <img
                      className="m-1 h-auto w-auto max-w-full md:h-24"
                      src={cuboPlusLogo}
                      alt="Cubo Plus SV"
                    />
                  </div>
                  <div className="w-1/2 md:w-full">
                    <img
                      className="m-1 h-auto w-auto max-w-full md:h-24"
                      src={hbsLogo}
                      alt="HB.s com"
                    />
                  </div>
                  <div className="w-1/2 md:w-full">
                    <img
                      className="m-1 max-w-full sm:h-auto sm:w-auto md:h-24"
                      src={kiveclairLogo}
                      alt="Kiveclair"
                    />
                  </div>
                </div>
              </div>

              <div className="my-6 flex-col text-xs font-semibold sm:ml-12 sm:items-center sm:text-lg md:my-0 lg:max-w-xl">
                <h3 className="mb-4">
                  Proud partner with BTCmap to integrate more than 250
                  communities into the map in 2023
                </h3>
                <div className="h-auto hover:scale-110 sm:h-4/5 sm:w-4/5 sm:px-10">
                  <img src={btcMap} alt="BTC Map" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Q&A section */}
        <div className="flex w-full flex-col items-center justify-center bg-blue-900   xl:px-0">
          <div className="mt-3 w-full max-w-6xl px-5 py-2 md:px-16 lg:px-12">
            <div className="mb-0 px-2 sm:px-8 ">
              <div className="flex h-6 w-full flex-row sm:h-10 ">
                <h2 className="text-base font-semibold text-orange-600 sm:text-3xl">
                  Q&A
                </h2>
              </div>
              <div className="mt-5">
                <h2
                  className="cursor-pointer text-base font-medium text-orange-600 sm:text-2xl"
                  onClick={() => toggleSection(0)}
                >
                  <span className="mr-2">{'>'}</span>
                  What's a Node ?
                </h2>
                {openSection === 0 && (
                  <p className="mt-1 text-xs text-gray-100 sm:text-base">
                    A node is simply a bitcoin community that wants to move to
                    the next step and accelerate its own local Bitcoin adoption!
                    There is no minimum size to start with.
                  </p>
                )}
              </div>
              <div className="mt-5">
                <h2
                  className="cursor-pointer text-base font-medium text-orange-600 sm:text-2xl"
                  onClick={() => toggleSection(1)}
                >
                  <span className="mr-2">{'>'}</span>
                  What do I gain ?
                </h2>
                {openSection === 1 && (
                  <p className="mt-1 text-xs text-gray-100 sm:text-base">
                    At Plan B we aim to improve the educational bitcoin
                    ecosystem by providing the right tools to build and educate
                    on Bitcoin. By becoming a node, your community will get
                    access to a large range of resources, services, special
                    educational training and more. Make your community count as
                    a reference in the Bitcoin world.
                  </p>
                )}
              </div>
              <div className="mt-5">
                <h2
                  className="cursor-pointer text-base font-medium text-orange-600 sm:text-2xl"
                  onClick={() => toggleSection(2)}
                >
                  <span className="mr-2">{'>'}</span>
                  What are the requirements ?
                </h2>
                {openSection === 2 && (
                  <p className="mt-1 text-xs text-gray-100 sm:text-base">
                    To be part of the network you must align on some core
                    values. These are:
                    <ul className="ml-8 list-disc">
                      <li>Be Bitcoin only</li>
                      <li>Value privacy</li>
                      <li>Care for the open source work</li>
                    </ul>
                  </p>
                )}
              </div>
              <div className="mt-5">
                <h2
                  className="cursor-pointer text-base font-medium text-orange-600 sm:text-2xl"
                  onClick={() => toggleSection(3)}
                >
                  <span className="mr-2">{'>'}</span>
                  What size is a Node?
                </h2>
                {openSection === 3 && (
                  <p className="mt-1 text-xs text-gray-100 sm:text-base">
                    A Bitcoin node can be of any size. Based on some requirement
                    different name will be attribute. A node with an
                    hackerspace, a gym, some office place will be considered a
                    ”Citadel” while your first bitcoin home town office will be
                    known as “nodes”.
                  </p>
                )}
              </div>
              <div className="mt-5">
                <h2
                  className="cursor-pointer text-base font-medium text-orange-600 sm:text-2xl"
                  onClick={() => toggleSection(4)}
                >
                  <span className="mr-2">{'>'}</span>
                  What are the requirements ?
                </h2>
                {openSection === 4 && (
                  <div>
                    <p className="mt-1 text-xs text-gray-100 sm:text-base">
                      We wish to offer a safe heaven for bitcoiners around the
                      world.
                    </p>
                    <p className="mt-1 text-xs text-gray-100 sm:text-base">
                      We beleive that by helping local hubs grow, we will be
                      able to create a network of citadels where bitcoiners will
                      be welcome to work, create, share and discuss safely.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mb-9 mt-4 flex items-center justify-center sm:mt-2 sm:h-20 ">
            {/* Links missing for the form */}
            <a
              href="https://docs.google.com/forms/u/0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="relative flex h-12 w-auto cursor-pointer items-center justify-center rounded-xl bg-orange-500 transition duration-300 ease-in-out hover:bg-blue-500">
                <span className="ml-2 text-xs text-white sm:ml-11 sm:text-lg">
                  Become part of the revolution!
                </span>
                <a
                  href="https://docs.google.com/forms/u/0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="ml-1 mr-2 flex items-center rounded  bg-gray-100 px-2 py-1 text-xs transition duration-300 ease-in-out hover:bg-gray-200 sm:ml-4 sm:mr-11 sm:text-lg">
                    <span className=" text-xs sm:mr-1 sm:text-base">Apply</span>
                    <img
                      className="text-blue-1000 h-5 w-5"
                      src={rocketForm}
                      alt="Cohetelogo"
                    />
                  </button>
                </a>
              </div>
            </a>
          </div>
        </div>
      </>
    </MainLayout>
  );
};

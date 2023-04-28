import { Routes } from '../types';

const dynamicParamRegex = new RegExp(/\/:[A-Za-z0-9-]+/g);

export const replaceDynamicParam = (
  route: Routes,
  dynamicElements: Record<string, string>
) => {
  const dynamicParams = route.match(dynamicParamRegex);

  let dynamicRoute = route.slice();
  dynamicParams?.forEach((param) => {
    const sanParam = param.slice(2); // route param without `/:`
    const dynamicElement = dynamicElements[sanParam] ?? 'not-defined';
    dynamicRoute = dynamicRoute.replace(param, `/${dynamicElement}`);
  });

  return dynamicRoute;
};

import { createClient } from 'contentful';

const space = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

// Initialize the Contentful Client
// We only initialize if the keys are present, to avoid crashing the app before setup
export const contentfulClient = space && accessToken 
  ? createClient({
      space: space,
      accessToken: accessToken,
    })
  : null;

const imgUrls = [
  // Account
  {
    url: process.env.REACT_APP_AWS_ACCOUNT_IMG_URL_1,
    replace: process.env.REACT_APP_CLOUD_FRONT_ACCOUNT_IMG_URL,
  },
  {
    url: process.env.REACT_APP_AWS_ACCOUNT_IMG_URL_2,
    replace: process.env.REACT_APP_CLOUD_FRONT_ACCOUNT_IMG_URL,
  },
  // Curriculum
  {
    url: process.env.REACT_APP_AWS_CURRICULUM_IMG_URL_1,
    replace: process.env.REACT_APP_CLOUD_FRONT_CURRICULUM_IMG_URL,
  },
  {
    url: process.env.REACT_APP_AWS_CURRICULUM_IMG_URL_2,
    replace: process.env.REACT_APP_CLOUD_FRONT_CURRICULUM_IMG_URL,
  },
  // Builder
  {
    url: process.env.REACT_APP_AWS_BUILDER_IMG_URL_1,
    replace: process.env.REACT_APP_CLOUD_FRONT_BUILDER_IMG_URL,
  },
  {
    url: process.env.REACT_APP_AWS_BUILDER_IMG_URL_2,
    replace: process.env.REACT_APP_CLOUD_FRONT_BUILDER_IMG_URL,
  },
  // Game
  {
    url: process.env.REACT_APP_AWS_GAME_IMG_URL_1,
    replace: process.env.REACT_APP_CLOUD_FRONT_GAME_IMG_URL,
  },
  {
    url: process.env.REACT_APP_AWS_GAME_IMG_URL_2,
    replace: process.env.REACT_APP_CLOUD_FRONT_GAME_IMG_URL,
  },
  // Slidr
  {
    url: process.env.REACT_APP_AWS_SLIDR_IMG_URL_1,
    replace: process.env.REACT_APP_CLOUD_FRONT_SLIDR_IMG_URL,
  },
  {
    url: process.env.REACT_APP_AWS_SLIDR_IMG_URL_2,
    replace: process.env.REACT_APP_CLOUD_FRONT_SLIDR_IMG_URL,
  },
  // Hub
  {
    url: process.env.REACT_APP_AWS_HUB_IMG_URL_1,
    replace: process.env.REACT_APP_CLOUD_FRONT_HUB_IMG_URL,
  },
  {
    url: process.env.REACT_APP_AWS_HUB_IMG_URL_2,
    replace: process.env.REACT_APP_CLOUD_FRONT_HUB_IMG_URL,
  },
];
const thumbnailUrls = [
  // Account
  {
    url: process.env.REACT_APP_AWS_ACCOUNT_THUMBNAIL_URL_1,
    replace: process.env.REACT_APP_CLOUD_FRONT_ACCOUNT_THUMBNAIL_URL,
  },
  {
    url: process.env.REACT_APP_AWS_ACCOUNT_THUMBNAIL_URL_2,
    replace: process.env.REACT_APP_CLOUD_FRONT_ACCOUNT_THUMBNAIL_URL,
  },
  // Curriculum
  {
    url: process.env.REACT_APP_AWS_CURRICULUM_THUMBNAIL_URL_1,
    replace: process.env.REACT_APP_CLOUD_FRONT_CURRICULUM_THUMBNAIL_URL,
  },
  {
    url: process.env.REACT_APP_AWS_CURRICULUM_THUMBNAIL_URL_2,
    replace: process.env.REACT_APP_CLOUD_FRONT_CURRICULUM_THUMBNAIL_URL,
  },
  // Builder
  {
    url: process.env.REACT_APP_AWS_BUILDER_THUMBNAIL_URL_1,
    replace: process.env.REACT_APP_CLOUD_FRONT_BUILDER_THUMBNAIL_URL,
  },
  {
    url: process.env.REACT_APP_AWS_BUILDER_THUMBNAIL_URL_2,
    replace: process.env.REACT_APP_CLOUD_FRONT_BUILDER_THUMBNAIL_URL,
  },
  // Game
  {
    url: process.env.REACT_APP_AWS_GAME_THUMBNAIL_URL_1,
    replace: process.env.REACT_APP_CLOUD_FRONT_GAME_THUMBNAIL_URL,
  },
  {
    url: process.env.REACT_APP_AWS_GAME_THUMBNAIL_URL_2,
    replace: process.env.REACT_APP_CLOUD_FRONT_GAME_THUMBNAIL_URL,
  },
  // Slidr
  {
    url: process.env.REACT_APP_AWS_SLIDR_THUMBNAIL_URL_1,
    replace: process.env.REACT_APP_CLOUD_FRONT_SLIDR_THUMBNAIL_URL,
  },
  {
    url: process.env.REACT_APP_AWS_SLIDR_THUMBNAIL_URL_2,
    replace: process.env.REACT_APP_CLOUD_FRONT_SLIDR_THUMBNAIL_URL,
  },
  // Hub
  {
    url: process.env.REACT_APP_AWS_HUB_THUMBNAIL_URL_1,
    replace: process.env.REACT_APP_CLOUD_FRONT_HUB_THUMBNAIL_URL,
  },
  {
    url: process.env.REACT_APP_AWS_HUB_THUMBNAIL_URL_2,
    replace: process.env.REACT_APP_CLOUD_FRONT_HUB_THUMBNAIL_URL,
  },
];

export const getCloudFrontImgUrl = url => {
  if (!!url && typeof url !== "string") return "";
  for (let i = 0; i < imgUrls.length; i++) {
    if (url.startsWith(imgUrls[i].url)) {
      return url.replace(imgUrls[i].url, imgUrls[i].replace);
    }
  }
  return url;
};
export const getCloudFrontThumbnailUrl = url => {
  if (!!url && typeof url !== "string") return "";
  for (let i = 0; i < thumbnailUrls.length; i++) {
    if (url.startsWith(thumbnailUrls[i].url)) {
      return url.replace(thumbnailUrls[i].url, thumbnailUrls[i].replace);
    }
  }
  return url;
};

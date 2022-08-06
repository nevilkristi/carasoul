import { lazy } from "react";

const FeedDashboard = lazy(() =>
  import(/* webpackChunkName: 'Dashboard' */ "modules/dashboard")
);
const Slidr = lazy(() =>
  import(/* webpackChunkName: 'Slidr' */ "modules/slidr")
);
const Slideshow = lazy(() =>
  import(/* webpackChunkName: 'Slideshow' */ "modules/slideshow")
);

const Faq = lazy(() =>
  import(/* webpackChunkName: 'FAQs' */ "modules/layout/components/Faq")
);
const Tutorial = lazy(() =>
  import(
    /* webpackChunkName: 'Tutorial' */ "modules/layout/components/Tutorial"
  )
);
const Keyword = lazy(() =>
  import(/* webpackChunkName: 'Keyword' */ "modules/layout/components/Keyword")
);
const Error404 = lazy(() =>
  import(
    /* webpackChunkName: 'Error404' */ "modules/layout/components/Error404"
  )
);
const Subscription = lazy(() =>
  import(/* webpackChunkName: 'Subscription' */ "modules/subscription")
);

const PrivateRoute = [
  {
    path: "/",
    component: FeedDashboard,
    checkAuth: true,
  },
  {
    path: "/faq",
    component: Faq,
    checkAuth: true,
  },
  {
    path: "/tutorial",
    component: Tutorial,
    checkAuth: false,
  },
  {
    path: "/slide-show-preview/:id",
    component: Slideshow,
    checkAuth: false,
  },
  {
    path: "/slide-show/:id",
    component: Slideshow,
    checkAuth: false,
  },
  {
    path: "/slidr/:slideshow_id",
    component: Slidr,
    checkAuth: true,
  },
  {
    path: "/subscription",
    component: Subscription,
    checkAuth: true,
  },
  {
    path: "/404",
    component: Error404,
    checkAuth: false,
  },
  {
    path: "/:id",
    component: Keyword,
    checkAuth: false,
  },
];

export default PrivateRoute;

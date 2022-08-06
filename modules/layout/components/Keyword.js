import Loader from "common/Loader";
import { GET_KEYWORD_DATA } from "constants/urls";
import React, { useEffect, useState } from "react";
import { axiosAdmin } from "services/api";

const Keyword = ({ match, history }) => {
  const [loading, setLoading] = useState(false);
  const keyword = match.params.id;
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = { keyword: keyword, site_id: 6 };
        const res = await axiosAdmin.post(GET_KEYWORD_DATA, data);
        if (res.status) {
          setLoading(false);
          if (
            res.data?.data?.pageLinkData?.link_type === 9 &&
            !!res.data.data.pageLinkData.target_url
          ) {
            window.location.replace(res.data.data.pageLinkData.target_url);
          } else {
            history.push("/404");
          }
        }
      } catch (e) {
        setLoading(false);
      }
    })();
  }, [keyword, history]);

  return loading ? <Loader /> : null;
};

export default Keyword;

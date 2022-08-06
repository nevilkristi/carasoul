import React, { useEffect, useState } from "react";
import { Card, CardBody } from "reactstrap";
import CommonButton from "common/Button";
import { axiosAccount } from "services/api";
import { GET_ACTIVE_SUBSCRIPTION, GET_PRODUCTS } from "constants/urls";
import moment from "moment";
import { toast } from "react-toastify";

const Subscription = ({ history }) => {
  const [products, setProducts] = useState([]);
  const [subscription, setSubscription] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    axiosAccount
      .post(GET_PRODUCTS, {
        site_id: 6,
        category_id: 0,
      })
      .then(res => {
        if (res.status && res.data?.data?.product_data) {
          setLoading(false);
          setProducts(res.data.data.product_data);
        }
      })
      .catch(e => setLoading(false));
  }, []);
  useEffect(() => {
    if (!!products && products.length > 0) {
      axiosAccount.get(`${GET_ACTIVE_SUBSCRIPTION}/${6}`).then(response => {
        if (response.status && response.data.data.rows) {
          setSubscription(response.data.data.rows);
        }
      });
    }
  }, [products]);
  const getActiveSubscription = product_id => {
    let arr = [];
    if (subscription.length > 0) {
      subscription.forEach(sub => {
        sub.user_orders.forEach(od => {
          od.user_order_items.forEach(item => {
            if (item.product_id === product_id) {
              arr.push({
                user_subscription_id: sub.user_subscription_id,
                next_payment_date: sub.next_payment_date,
              });
            }
          });
        });
      });
      return arr[arr.length - 1];
    } else {
      return null;
    }
  };
  const handleSubscription = product => {
    if (!!subscription?.length) {
      toast.error(
        "You are already having one active subscription. Please cancel that and try again."
      );
      return;
    }
    window.location.replace(
      `${process.env.REACT_APP_ACCOUNT_SITE_URL}/subscription-confirmation?product_id=${product.product_id}&site_id=6&redirect_url=${process.env.REACT_APP_SLIDR_SITE_URL}/subscription`
    );
  };
  return (
    <div className="blue-bg">
      <section className="sub-header">
        <div className="back-arrow-title">
          <div className="sub-header-title align-items-center">
            <span
              className="back-arrow back-arrow-canvas"
              onClick={() => history.push("/")}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </span>
            <h2 className="mb0">Subscription</h2>
          </div>
        </div>
      </section>
      <div className="mt-30 sub-container subscription">
        <Card>
          <CardBody>
            {loading ? (
              <div>Please wait while data is loading...</div>
            ) : (
              <>
                {products.length > 0 ? (
                  <>
                    {products.map(product => (
                      <React.Fragment key={product.product_id}>
                        {!!getActiveSubscription(product.product_id)
                          ?.user_subscription_id && (
                          <div className="text-end mb-2">
                            Next Renewal Date :{" "}
                            {getActiveSubscription(product.product_id)
                              ?.next_payment_date
                              ? moment(
                                  getActiveSubscription(product.product_id)
                                    .next_payment_date
                                ).format("MMMM DD,YYYY")
                              : "Life Time"}
                            {/* {moment(product.next_payment_date).format(
                              "MMMM DD,YYYY"
                            )} */}
                          </div>
                        )}

                        <Card className="subscription-plan">
                          <CardBody>
                            <div className="d-flex justify-content-between">
                              <div className="title">
                                ${product.product_price} /{" "}
                                {product.product_name}
                              </div>
                              <div className="text-theme fs-12 d-flex align-items-center cursor-pointer">
                                {!!getActiveSubscription(product.product_id)
                                  ?.user_subscription_id ? (
                                  <div
                                    onClick={e =>
                                      window.open(
                                        `${
                                          process.env.REACT_APP_ACCOUNT_SITE_URL
                                        }/view-subscription/${
                                          getActiveSubscription(
                                            product.product_id
                                          )?.user_subscription_id
                                        }`,
                                        "_blank"
                                      )
                                    }
                                  >
                                    Your Subscription
                                  </div>
                                ) : (
                                  <CommonButton
                                    btnText={`Try ${product.product_name} Subscription`}
                                    btnClass="fs-12"
                                    btnClick={() => handleSubscription(product)}
                                  />
                                )}
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </React.Fragment>
                    ))}
                  </>
                ) : (
                  !!!loading && <div>No data available</div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Subscription;

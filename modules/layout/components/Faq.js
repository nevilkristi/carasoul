import React, { useEffect, useState } from "react";
import { Card, CardBody } from "reactstrap";
import { Collapse } from "react-bootstrap";
import { axiosAdmin } from "services/api";
import { GET_ALL_FAQ_URL } from "constants/urls";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";

const Faq = ({ history }) => {
  const [isOpen, setIsOpen] = useState([]);
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    axiosAdmin
      .post(GET_ALL_FAQ_URL, {
        site_id: 6,
      })
      .then(res => {
        if (res.status && res.data?.data?.rows) {
          setLoading(false);
          setFaq(res.data.data.rows);
        }
      })
      .catch(err => {
        setLoading(false);
        toast.error(err.response?.data?.message || err.message);
      });
  }, []);
  const openClose = id => {
    if (isOpen.includes(id)) {
      setIsOpen(pre => pre.filter(x => x !== id));
    } else {
      setIsOpen(pre => [...pre, id]);
    }
  };
  return (
    <div className="blue-bg">
      <section className="sub-header">
        <div className="back-arrow-title">
          <div className="sub-header-title">
            <span
              className="back-arrow back-arrow-canvas"
              onClick={() => history.push("/")}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </span>
            <h2 className="mb0">Frequently asked Questions</h2>
          </div>
        </div>
      </section>

      <div className="sub-container">
        <Card>
          <CardBody>
            {!!faq.length > 0 ? (
              <>
                {faq.map(FAQ => (
                  <div key={FAQ.faq_id} className="faq">
                    <div
                      className="faq-title cursor-pointer"
                      onClick={() => openClose(FAQ.faq_id)}
                    >
                      <h5>{FAQ.title}</h5>
                      <i
                        className={`bx bx-chevron-${
                          isOpen.includes(FAQ.faq_id) ? "up" : "down"
                        }`}
                        aria-hidden="true"
                      ></i>
                    </div>
                    <Collapse in={isOpen.includes(FAQ.faq_id)}>
                      <div>
                        <div className="faq-text">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(FAQ.content),
                            }}
                          />
                        </div>
                      </div>
                    </Collapse>
                  </div>
                ))}
              </>
            ) : (
              <>
                {loading ? (
                  <div>Please wait while data is loading</div>
                ) : (
                  <div>No FAQs available</div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Faq;

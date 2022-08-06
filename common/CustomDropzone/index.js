import React, { forwardRef, lazy, Suspense } from "react";
const CustomDropZone = lazy(() =>
  import(/* webpackChunkName: 'Dropzone' */ "./CustomDropZone")
);

const Loader = () => {
  return (
    <div className="mb-3 placeholder-glow">
      <span className="placeholder col-3 mb-3"></span>
      <div className="d-flex align-items-center placeholder-glow">
        <div
          className="dropzone-area placeholder"
          style={{
            borderColor: "#ced4da",
          }}
        >
          <p className="mb-0">Please wait while dropzone is loading...</p>
        </div>
      </div>
    </div>
  );
};

const DropZone = forwardRef((props, ref) => {
  return (
    <Suspense fallback={<Loader />}>
      <CustomDropZone {...props} ref={ref} />
    </Suspense>
  );
});

export default DropZone;

import { useEffect, useState } from "react";

const useDebounce = (value, debounceTime = 500) => {
  const [state, setState] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setState(value);
    }, [debounceTime]);

    return () => clearTimeout(timeoutId);
  }, [value, debounceTime]);

  return state;
};

export default useDebounce;

import * as React from "react";

const useEffectAfterFirstRender = (
  effect: () => void,
  dependencies: Array<any>
) => {
  const firstExecution = React.useRef(true);
  React.useEffect(() => {
    if (firstExecution.current) {
      firstExecution.current = false;
      return;
    }
    effect();
  }, dependencies);
};

export default useEffectAfterFirstRender;

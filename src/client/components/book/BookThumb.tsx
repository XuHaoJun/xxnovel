import {
  LazyLoadImage,
  LazyLoadImageProps,
} from "react-lazy-load-image-component";

export const getBookThumbDefaultProps = () => {
  return {
    width: 122,
    height: 162,
  };
};

export const BookThumb = (_props: LazyLoadImageProps) => {
  const defaultProps = getBookThumbDefaultProps();
  const props = {...defaultProps, ..._props};
  return <LazyLoadImage {...props} />;
};

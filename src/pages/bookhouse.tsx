import React from "react";
import _ from "lodash";
import RGL, { WidthProvider, Layout } from "react-grid-layout";
import { Box, NoSsr, Container } from "@mui/material";
import { useDebounce } from "ahooks";

const ReactGridLayout = WidthProvider(RGL);

const getDefaultProps = (): ReactGridLayout.ReactGridLayoutProps => ({
  className: "layout",
  cols: 12,
  rowHeight: 30,
  compactType: null,
});

const BookHousePage = () => {
  const defaultProps = getDefaultProps();
  const props = defaultProps;
  const items = 3;
  const generateLayout = () => {
    const p = defaultProps;
    return _.map(new Array(items), function (item, i) {
      const y: number = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6) * y,
        w: 2,
        h: y,
        i: i.toString(),
      };
    });
  };

  const generateDOM = () => {
    return _.map(_.range(items), function (i) {
      return (
        <Box component="div" key={i} sx={{ backgroundColor: "#c2c0ba" }}>
          <span className="text">我是書或章節 {i}</span>
        </Box>
      );
    });
  };

  const [layout, setLayout] = React.useState(() => generateLayout());
  const debounedLayout = useDebounce(layout, { wait: 3000 });

  return (
    <Container>
      <NoSsr>
        <ReactGridLayout
          layout={debounedLayout}
          onLayoutChange={(layout: Layout[]) => {
            console.log(layout);
            setLayout(layout);
          }}
          {...props}
        >
          {generateDOM()}
        </ReactGridLayout>
      </NoSsr>
    </Container>
  );
};

export default BookHousePage;

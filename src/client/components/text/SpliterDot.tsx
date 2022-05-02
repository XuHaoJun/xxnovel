import { Box, BoxProps } from "@mui/material";

export const SpliterDot = (props: BoxProps) => {
  return (
    <Box
      component="span"
      sx={{
        userSelect: "none",
        margin: "0 4px",
        "&:after": {
          content: '"•"',
        },
      }}
      {...props}
    />
  );
};

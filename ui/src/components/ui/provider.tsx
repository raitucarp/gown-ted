import { ChakraProvider, Theme } from "@chakra-ui/react";
import React from "react";
import { system } from "../../theme";

export function Provider(props: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <Theme appearance="dark" colorPalette="blue" style={{ height: "100%", width: "100%" }}>
        {props.children}
      </Theme>
    </ChakraProvider>
  );
}

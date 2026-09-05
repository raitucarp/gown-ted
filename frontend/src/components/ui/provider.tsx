import { ChakraProvider, defaultSystem, Theme } from "@chakra-ui/react";
import React from "react";

export function Provider(props: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <Theme appearance="dark" colorPalette="blue" style={{ height: "100%", width: "100%" }}>
        {props.children}
      </Theme>
    </ChakraProvider>
  );
}

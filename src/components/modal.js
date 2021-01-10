/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "@emotion/react";

import React from "react";
import VisuallyHidden from "@reach/visually-hidden";
import { Dialog, CircleButton } from "./lib";

const ModalContext = React.createContext();

//function that returns all the functions given to it
const callAll = (...fns) => (...args) => fns.forEach((fn) => fn && fn(...args));

function Modal(props) {
  const [isOpen, setIsOpen] = React.useState(false);
  return <ModalContext.Provider value={[isOpen, setIsOpen]} {...props} />;
}

function ModalDismissButton({ children: child }) {
  const [setIsOpen] = React.useContext(ModalContext);
  return React.cloneElement(child, {
    onClick: () => callAll(() => setIsOpen(true), child.props.onClick),
  });
}

function ModalContentsBase(props) {
  const [isOpen, setIsOpen] = React.useContext(ModalContext);
  return (
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props} />
  );
}

function ModalOpenButton({ children: child }) {
  const [, setIsOpen] = React.useContext(ModalContext);
  return React.cloneElement(child, {
    onClick: callAll(() => setIsOpen(true), child.props.onClick),
  });
}

function ModalContents({ title, children, ...props }) {
  return (
    <ModalContentsBase {...props}>
      <div css={{ display: "flex", justifyContent: "flex-end" }}>
        <ModalDismissButton>
          <CircleButton>
            <VisuallyHidden>Close</VisuallyHidden>
            <span aria-hidden>×</span>
          </CircleButton>
        </ModalDismissButton>
      </div>

      <h3 css={{ textAlign: "center", fontSize: "2em" }}>{title}</h3>

      {children}
    </ModalContentsBase>
  );
}
export { Modal, ModalDismissButton, ModalOpenButton, ModalContents };

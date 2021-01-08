/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "@emotion/react";

import React from "react";
import {
  Input,
  Button,
  FormGroup,
  Spinner,
  FullPageSpinner,
} from "./components/lib";
import { useAsync } from "./utils/hooks";
import { Modal, ModalContents, ModalOpenButton } from "./components/modal";

const isLoading = true;

function LoginForm({ onSubmit, submitButton }) {
  const { isLoading, isError } = useAsync();
  return (
    <form>
      <FormGroup>
        <label htmlFor="username">Username</label>
        <Input id="username" />
      </FormGroup>
      <FormGroup>
        <label htmlFor="password">Password</label>
        <Input id="password" />
      </FormGroup>
      <div>
        {React.cloneElement(
          submitButton,
          { type: "submit" },
          ...(Array.isArray(submitButton.props.children)
            ? submitButton.props.children
            : [submitButton.props.children]),
          isLoading ? <Spinner css={{ marginLeft: 5 }} /> : null
        )}
      </div>
    </form>
  );
}
function UnauthenticatedApp() {
  return (
    <div
      css={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      <Modal>
        <ModalOpenButton>
          <Button variant="primary">Login</Button>
        </ModalOpenButton>
        <ModalContents aria-label="Login Form" title="Login">
          <LoginForm submitButton={<Button>Login</Button>} />
        </ModalContents>
      </Modal>
    </div>
  );
}

export { UnauthenticatedApp };

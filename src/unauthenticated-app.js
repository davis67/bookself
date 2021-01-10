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
  ErrorMessage,
} from "./components/lib";
import { useAsync } from "./utils/hooks";
import { Modal, ModalContents, ModalOpenButton } from "./components/modal";
import { Logo } from "./components/logo";

function LoginForm({ onSubmit, submitButton }) {
  const { isLoading, isError, run, error } = useAsync();

  function handleSubmit(event) {
    event.preventDefault();

    const { username, password } = event.target.elements;

    run(onSubmit({ username: username.value, password: password.value }));
  }
  return (
    <form onSubmit={handleSubmit}>
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
      {isError ? <ErrorMessage error={error} /> : null}
    </form>
  );
}

function UnauthenticatedApp({ login, register }) {
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
      <Logo />
      <h1>Bookshelf</h1>
      <div>
        <Modal>
          <ModalOpenButton>
            <Button variant="primary">Login</Button>
          </ModalOpenButton>
          <ModalContents aria-label="Login form" title="Login">
            <LoginForm
              onSubmit={login}
              submitButton={<Button variant="primary">Login</Button>}
            />
          </ModalContents>
        </Modal>
        <Modal>
          <ModalOpenButton>
            <Button variant="secondary">Register</Button>
          </ModalOpenButton>
          <ModalContents aria-label="Login form" title="Register">
            <LoginForm
              onSubmit={register}
              submitButton={<Button variant="primary">Register</Button>}
            />
          </ModalContents>
        </Modal>
      </div>
    </div>
  );
}

export { UnauthenticatedApp };

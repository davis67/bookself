/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "@emotion/react";

import React from "react";
import * as auth from "./auth-provider";
import { AuthenticatedApp } from "./authenticated-app";
import { FullPageSpinner } from "./components/lib";
import { UnauthenticatedApp } from "./unauthenticated-app";
import { useAsync } from "./utils/hooks";
import * as colors from "./styles/colors";
import { client } from "./utils/api-client";

async function getUser() {
  let user = null;

  const token = await auth.getToken();
  if (token) {
    const data = await client("me", { token });
    user = data.user;
  }

  return user;
}
function App() {
  const {
    data: user,
    isIdle,
    isLoading,
    isError,
    error,
    isSuccess,
    setData,
    run,
  } = useAsync();

  React.useEffect(() => {
    run(getUser());
  }, [run]);

  console.log(user);
  const login = (form) => auth.login(form).then((user) => setData(user));
  const register = (form) => auth.register(form).then((user) => setData(user));

  if (isLoading || isIdle) {
    return <FullPageSpinner />;
  }

  if (isError) {
    return (
      <div
        css={{
          color: colors.danger,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>Uh oh... There's a problem. Try refreshing the app.</p>
        <pre>{error.message}</pre>
      </div>
    );
  }
  if (isSuccess) {
    return user ? (
      <AuthenticatedApp />
    ) : (
      <UnauthenticatedApp login={login} register={register} />
    );
  }
}

export default App;

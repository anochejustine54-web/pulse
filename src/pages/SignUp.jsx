// SignUp.jsx - gets setUser from Layout through the Outlet context
import { useOutletContext } from "react-router";
import Body from "../components/Body";
import Form from "../components/form";

export default function SignUp() {
  const { setUser } = useOutletContext();
  return (
    <Body title="Join Pulse" subtitle="Enter your details to get started.">
      <div className="narrow">
        <Form onSuccess={setUser} />
      </div>
    </Body>
  );
}

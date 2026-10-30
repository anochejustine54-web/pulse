import { Link } from "react-router";
import Body from "../components/Body";

export default function NotFound() {
  return (
    <Body title="404: Page not found" subtitle="That address doesn't exist on Pulse.">
      <Link to="/" className="primary btn-link">Go to Home</Link>
    </Body>
  );
}

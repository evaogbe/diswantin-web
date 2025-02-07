import { Link } from "~/ui/link";

export function GuestFooter() {
  return (
    <footer className="gap-fl-xs p-fl-2xs flex border-t text-sm">
      <p>
        <Link to="/cookies">Cookie policy</Link>
      </p>
      <p>
        <Link to="/privacy">Privacy policy</Link>
      </p>
      <p>
        <Link to="/terms">Terms of Service</Link>
      </p>
    </footer>
  );
}

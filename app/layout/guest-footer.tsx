import { Link } from "~/ui/link";

export function GuestFooter() {
  return (
    <footer className="flex gap-fl-xs border-t p-fl-2xs text-sm">
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

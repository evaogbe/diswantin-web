import { Link } from "@remix-run/react";

export function AppHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header>
      <h1>
        <Link to={isAuthenticated ? "/home" : "/"}>Diswantin</Link>
      </h1>
      {isAuthenticated && (
        <nav>
          <ul>
            <li>
              <Link to="/new-todo">New to-do</Link>
            </li>
            <li>
              <Link to="/settings">Settings</Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

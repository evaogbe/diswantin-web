import { Link, NavLink } from "@remix-run/react";

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
              <NavLink to="/new-todo">New to-do</NavLink>
            </li>
            <li>
              <NavLink to="/settings">Settings</NavLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

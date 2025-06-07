# Handling React Hydration in StockSage

## The Problem: Hydration Mismatches

React hydration mismatches occur when the client-side rendered content doesn't match the server-side rendered HTML. Common causes include:

1. DOM elements added dynamically during client-side rendering that weren't present in the server HTML
2. Class manipulations that happen immediately on client-side rendering
3. Libraries that automatically add classes to HTML/body elements on load

The specific error we encountered:

```
Warning: Prop `className` did not match. Server: "..." Client: "... hydrated"
```

This indicated that a class (`hydrated`) was being added to the HTML element during client-side rendering that wasn't present in the server-rendered HTML.

## The Solution

We implemented a robust solution with several key components:

### 1. Safe DOM Utilities

The `dom-utils.ts` file provides utilities for safely manipulating the DOM only after hydration is complete:

- `safeDOM`: Ensures callbacks run after hydration by using `requestAnimationFrame`
- `safelyAddClass`: Safely adds a class to an element
- `safelyRemoveClass`: Safely removes a class
- `safelyReplaceClass`: Safely replaces classes
- `safelySetAttribute`: Safely sets an attribute

### 2. Theme-Specific Utilities

The `hydration-utils.ts` file provides theme-specific utilities:

- `safelyApplyTheme`: Safely applies a theme to the root element
- `addClassToRoot`: Safely adds a class to the root element
- `removeClassFromRoot`: Safely removes a class from the root element

### 3. Updated ThemeProvider

The `ThemeProvider.tsx` component was updated to:

- Track mounted state to know when client-side rendering is complete
- Use safe DOM utilities for all class manipulations
- Only perform DOM operations after the component is mounted
- Properly handle system theme preferences

### 4. Consistent HTML/Body Classes in Layout

The `layout.tsx` file was updated to ensure consistent class names between server and client renders:

- Static classes that don't change during hydration
- No client-side code to add classes during initial render

## Testing the Solution

A test page is available at `/test-hydration` to verify that hydration is working correctly. This page includes:

- A hydration test component that shows different content before and after hydration
- Static content for comparison
- Implementation details

## Best Practices

To avoid hydration mismatches in future development:

1. Always use the `safeDOM` utilities for DOM manipulations
2. Defer any DOM changes until after hydration using the mounted state pattern
3. Avoid adding classes directly to HTML or body elements in client components
4. Use conditional rendering with `useEffect` and `useState` for client-side-only content
5. Keep server and client HTML structures identical during initial render

## References

- [Next.js Hydration Documentation](https://nextjs.org/docs/messages/react-hydration-error)
- [React 18 Hydration Documentation](https://reactjs.org/docs/react-dom-client.html#hydrateroot)
- [Understanding and Solving React Hydration Errors](https://www.joshwcomeau.com/react/the-perils-of-rehydration/) 
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

// A component that throws a render error for testing purposes
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }): React.ReactElement {
    if (shouldThrow) {
        throw new Error("Test render error");
    }
    return <div>Normal render</div>;
}

// Suppress console.error output during error boundary tests
let consoleErrorSpy: jest.SpyInstance;
beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { /* suppress */ });
});
afterEach(() => {
    consoleErrorSpy.mockRestore();
});

describe("ErrorBoundary component", () => {
    it("renders children when no error is thrown", () => {
        render(
            <ErrorBoundary>
                <ThrowingComponent shouldThrow={false} />
            </ErrorBoundary>
        );

        expect(screen.getByText("Normal render")).toBeInTheDocument();
    });

    it("renders default fallback UI when a child throws", () => {
        render(
            <ErrorBoundary>
                <ThrowingComponent shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("Something went wrong loading the library.")).toBeInTheDocument();
    });

    it("renders custom fallback when provided and a child throws", () => {
        render(
            <ErrorBoundary fallback={<div>Custom error UI</div>}>
                <ThrowingComponent shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText("Custom error UI")).toBeInTheDocument();
        expect(screen.queryByRole("alert")).toBeNull();
    });

    it("logs the error to console when a child throws", () => {
        render(
            <ErrorBoundary>
                <ThrowingComponent shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(consoleErrorSpy).toHaveBeenCalled();
    });
});

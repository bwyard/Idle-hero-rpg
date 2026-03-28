/**
 * ErrorBoundary — Catches render errors and shows a fallback UI.
 *
 * Wraps the app root to prevent white-screen crashes. Displays
 * a "Something went wrong" message with a Restart button that
 * resets the error state.
 */

import { Component } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

// React Error Boundaries require class components — no functional equivalent exists.
// eslint-disable-next-line no-restricted-syntax
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console for development debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private readonly handleRestart = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>The app encountered an unexpected error.</Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={this.handleRestart}
            accessibilityLabel="Restart the app"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Restart</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#140a24',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f0d060',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#b0a090',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#352050',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#f0d060',
    paddingVertical: 14,
    paddingHorizontal: 32,
    minHeight: 48,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: '#f0d060',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f0d060',
  },
});
